begin;

-- B5.1D: atomically record a provider-confirmed payment and enqueue its domain event.
create or replace function public.confirm_booking_payment(
  p_payment_attempt_id uuid,
  p_provider text,
  p_provider_payment_id text,
  p_provider_order_id text default null,
  p_paid_at timestamptz default null
)
returns table (
  result_code text,
  booking_id uuid,
  payment_attempt_id uuid,
  booking_status text,
  booking_payment_status text,
  payment_status text,
  outbox_event_id uuid
)
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_payment public.payments%rowtype;
  v_booking public.bookings%rowtype;
  v_amount_minor bigint;
  v_total numeric;
  v_now timestamptz := pg_catalog.clock_timestamp();
  v_late boolean := false;
  v_deduplication_key text;
begin
  result_code := 'PAYMENT_ATTEMPT_NOT_FOUND';
  booking_id := null;
  payment_attempt_id := p_payment_attempt_id;
  booking_status := null;
  booking_payment_status := null;
  payment_status := null;
  outbox_event_id := null;

  if p_payment_attempt_id is null or p_provider is null or btrim(p_provider) = ''
    or p_provider_payment_id is null or btrim(p_provider_payment_id) = '' then
    result_code := 'INVALID_REQUEST';
    return next;
    return;
  end if;

  -- Read the immutable relationship, then lock booking before payment, matching
  -- create_payment_attempt_with_hold_lock and expire_booking_payment_hold.
  select p.* into v_payment from public.payments p where p.id = p_payment_attempt_id;
  if not found then return next; return; end if;
  booking_id := v_payment.booking_id;

  select b.* into v_booking from public.bookings b where b.id = v_payment.booking_id for update;
  if not found then result_code := 'BOOKING_NOT_FOUND'; return next; return; end if;

  select p.* into v_payment from public.payments p where p.id = p_payment_attempt_id for update;
  if not found or v_payment.booking_id is distinct from v_booking.id then
    result_code := 'PAYMENT_ATTEMPT_NOT_FOUND'; return next; return;
  end if;

  booking_status := v_booking.status;
  booking_payment_status := v_booking.payment_status;
  payment_status := v_payment.status;
  v_now := pg_catalog.clock_timestamp();

  if v_payment.provider is distinct from p_provider then
    result_code := 'PAYMENT_PROVIDER_MISMATCH'; return next; return;
  end if;
  if v_payment.currency is distinct from 'PEN' or v_payment.amount_minor <= 0 then
    result_code := 'PAYMENT_ATTEMPT_NOT_CONFIRMABLE'; return next; return;
  end if;

  v_late := v_booking.payment_status = 'pending'
    and (v_booking.status = 'cancelled'
      or (v_booking.hold_expires_at is not null and v_booking.hold_expires_at <= v_now));

  if v_payment.status = 'paid' then
    if v_payment.provider_payment_id is distinct from p_provider_payment_id
      or (p_provider_order_id is not null and v_payment.provider_order_id is distinct from p_provider_order_id) then
      result_code := 'PAYMENT_ATTEMPT_NOT_CONFIRMABLE'; return next; return;
    end if;
    if v_booking.payment_status = 'paid' then
      v_deduplication_key := 'booking.payment_confirmed:' || v_booking.id::text;
      select o.id into outbox_event_id from public.integration_outbox o where o.deduplication_key = v_deduplication_key;
      result_code := 'PAYMENT_ALREADY_CONFIRMED'; return next; return;
    end if;
    if v_late then
      v_deduplication_key := 'payment.late_paid_requires_review:' || v_payment.id::text;
      select o.id into outbox_event_id from public.integration_outbox o where o.deduplication_key = v_deduplication_key;
      result_code := 'PAYMENT_LATE_AFTER_EXPIRY'; return next; return;
    end if;
    result_code := 'PAYMENT_ATTEMPT_NOT_CONFIRMABLE'; return next; return;
  end if;

  if v_payment.status = 'refunded' then
    result_code := 'PAYMENT_ATTEMPT_NOT_CONFIRMABLE'; return next; return;
  end if;

  if v_payment.status not in ('pending', 'processing') and not v_late then
    result_code := 'PAYMENT_ATTEMPT_NOT_CONFIRMABLE'; return next; return;
  end if;
  if not v_late then
    if v_booking.client_profile_id is distinct from v_payment.client_profile_id
      or v_booking.beluer_profile_id is null
      or v_booking.status is distinct from 'payment_pending'
      or v_booking.payment_status is distinct from 'pending'
      or v_booking.hold_expires_at is null then
      result_code := 'BOOKING_PAYMENT_STATE_INVALID'; return next; return;
    end if;

    v_total := coalesce(v_booking.service_price_snapshot, v_booking.base_price, 0)
      + coalesce(v_booking.logistic_fee, 0) + coalesce(v_booking.express_fee, 0);
    if v_total <= 0 or v_total::text in ('NaN', 'Infinity', '-Infinity') then
      result_code := 'PAYMENT_AMOUNT_MISMATCH'; return next; return;
    end if;
    v_amount_minor := pg_catalog.round(v_total * 100)::bigint;
    if v_payment.amount_minor is distinct from v_amount_minor then
      result_code := 'PAYMENT_AMOUNT_MISMATCH'; return next; return;
    end if;

    -- The hold can expire while validation runs, so check immediately before writes.
    v_now := pg_catalog.clock_timestamp();
    v_late := v_booking.payment_status = 'pending'
      and (v_booking.status = 'cancelled'
        or (v_booking.hold_expires_at is not null and v_booking.hold_expires_at <= v_now));

    if not v_late then
      begin
        update public.payments p set status = 'paid', provider_payment_id = p_provider_payment_id,
          provider_order_id = coalesce(p_provider_order_id, p.provider_order_id),
          paid_at = coalesce(p_paid_at, v_now), updated_at = v_now
        where p.id = v_payment.id;
      exception when unique_violation then
        result_code := 'PAYMENT_PROVIDER_ID_CONFLICT'; return next; return;
      end;

      update public.bookings b set payment_status = 'paid', status = 'assigned',
        hold_expires_at = null, updated_at = v_now where b.id = v_booking.id;

      v_deduplication_key := 'booking.payment_confirmed:' || v_booking.id::text;
      insert into public.integration_outbox (event_type, aggregate_type, aggregate_id, payload, deduplication_key)
      values ('booking.payment_confirmed', 'booking', v_booking.id,
        jsonb_build_object('booking_id', v_booking.id, 'payment_attempt_id', v_payment.id,
          'client_profile_id', v_booking.client_profile_id, 'beluer_profile_id', v_booking.beluer_profile_id,
          'service_id', v_booking.service_id, 'scheduled_date', v_booking.scheduled_date,
          'scheduled_time', v_booking.scheduled_time, 'district', v_booking.district,
          'amount_minor', v_payment.amount_minor, 'currency', v_payment.currency,
          'provider', v_payment.provider, 'method', v_payment.method), v_deduplication_key)
      on conflict (deduplication_key) do nothing returning id into outbox_event_id;
      if outbox_event_id is null then
        select o.id into outbox_event_id from public.integration_outbox o where o.deduplication_key = v_deduplication_key;
      end if;

      booking_status := 'assigned';
      booking_payment_status := 'paid';
      payment_status := 'paid';
      result_code := 'OK';
      return next; return;
    end if;
  end if;

  -- A verified late capture is recorded as paid without reviving the booking.
  update public.bookings b set status = 'cancelled', updated_at = v_now
  where b.id = v_booking.id and b.payment_status = 'pending'
    and b.hold_expires_at is not null and b.hold_expires_at <= v_now;
  booking_status := case when v_booking.payment_status = 'pending' then 'cancelled' else v_booking.status end;
  update public.payments p set status = 'paid', provider_payment_id = p_provider_payment_id,
    provider_order_id = coalesce(p_provider_order_id, p.provider_order_id),
    paid_at = coalesce(p_paid_at, v_now), updated_at = v_now where p.id = v_payment.id;
  v_deduplication_key := 'payment.late_paid_requires_review:' || v_payment.id::text;
  insert into public.integration_outbox (event_type, aggregate_type, aggregate_id, payload, deduplication_key)
  values ('payment.late_paid_requires_review', 'payment', v_payment.id,
    jsonb_build_object('booking_id', v_booking.id, 'payment_attempt_id', v_payment.id,
      'amount_minor', v_payment.amount_minor, 'provider', v_payment.provider,
      'provider_payment_id', p_provider_payment_id), v_deduplication_key)
  on conflict (deduplication_key) do nothing returning id into outbox_event_id;
  if outbox_event_id is null then
    select o.id into outbox_event_id from public.integration_outbox o where o.deduplication_key = v_deduplication_key;
  end if;
  payment_status := 'paid';
  result_code := 'PAYMENT_LATE_AFTER_EXPIRY';
  return next;
exception when unique_violation then
  result_code := 'PAYMENT_PROVIDER_ID_CONFLICT';
  return next;
end;
$$;

revoke all on function public.confirm_booking_payment(uuid, text, text, text, timestamptz)
  from public, anon, authenticated;
grant execute on function public.confirm_booking_payment(uuid, text, text, text, timestamptz)
  to service_role;

commit;
