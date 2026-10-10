begin;

-- B5.1C1: serialize payment-attempt creation with payment-hold state.
create or replace function public.create_payment_attempt_with_hold_lock(
  p_booking_id uuid,
  p_client_profile_id uuid,
  p_provider text,
  p_method text,
  p_idempotency_key uuid
)
returns table (
  result_code text,
  payment_attempt_id uuid,
  booking_id uuid,
  amount_minor bigint,
  currency text,
  method text,
  provider text,
  expires_at timestamptz,
  status text
)
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_booking public.bookings%rowtype;
  v_payment public.payments%rowtype;
  v_has_keyed_attempt boolean := false;
  v_now timestamptz;
  v_total numeric;
  v_amount_minor bigint;
begin
  result_code := 'INVALID_REQUEST';
  payment_attempt_id := null;
  booking_id := p_booking_id;
  amount_minor := null;
  currency := null;
  method := null;
  provider := null;
  expires_at := null;
  status := null;

  if p_booking_id is null
    or p_client_profile_id is null
    or p_idempotency_key is null
    or p_provider is distinct from 'culqi'
    or p_method is null
    or p_method not in ('card', 'yape', 'qr') then
    return next;
    return;
  end if;

  select b.*
    into v_booking
  from public.bookings as b
  where b.id = p_booking_id
  for update;

  if not found then
    result_code := 'BOOKING_NOT_FOUND';
    return next;
    return;
  end if;

  if v_booking.client_profile_id is distinct from p_client_profile_id then
    result_code := 'BOOKING_NOT_OWNED';
    return next;
    return;
  end if;

  if v_booking.payment_status = 'paid' then
    result_code := 'PAYMENT_ALREADY_COMPLETED';
    return next;
    return;
  end if;

  select p.*
    into v_payment
  from public.payments as p
  where p.client_profile_id = p_client_profile_id
    and p.idempotency_key = p_idempotency_key
  for update;

  if found then
    if v_payment.booking_id is distinct from p_booking_id
      or v_payment.provider is distinct from p_provider
      or v_payment.method is distinct from p_method then
      result_code := 'IDEMPOTENCY_KEY_REUSED';
      return next;
      return;
    end if;

    if v_payment.status = 'paid' then
      result_code := 'PAYMENT_ALREADY_COMPLETED';
      return next;
      return;
    elsif v_payment.status = 'expired' then
      v_now := pg_catalog.clock_timestamp();
      if v_booking.status = 'cancelled'
        or (v_booking.hold_expires_at is not null and v_booking.hold_expires_at <= v_now) then
        if v_booking.status = 'payment_pending' then
          update public.bookings as b
          set status = 'cancelled', updated_at = v_now
          where b.id = v_booking.id
            and b.status = 'payment_pending'
            and b.payment_status = 'pending'
            and b.hold_expires_at <= v_now;
        end if;
        update public.payments as p
        set status = 'expired', updated_at = v_now
        where p.booking_id = v_booking.id
          and p.status in ('pending', 'processing');
        result_code := 'PAYMENT_HOLD_EXPIRED';
      else
        result_code := 'PAYMENT_ATTEMPT_NOT_REUSABLE';
      end if;
      return next;
      return;
    elsif v_payment.status in ('failed', 'refunded') then
      result_code := 'PAYMENT_ATTEMPT_NOT_REUSABLE';
      return next;
      return;
    elsif v_payment.status in ('pending', 'processing') then
      v_has_keyed_attempt := true;
    else
      result_code := 'PAYMENT_ATTEMPT_NOT_REUSABLE';
      return next;
      return;
    end if;
  end if;

  if v_booking.status is distinct from 'payment_pending'
    or v_booking.payment_status is distinct from 'pending' then
    result_code := 'BOOKING_NOT_PAYMENT_PENDING';
    return next;
    return;
  end if;

  if v_booking.hold_expires_at is null then
    result_code := 'PAYMENT_HOLD_INVALID';
    return next;
    return;
  end if;

  if v_booking.beluer_profile_id is null then
    result_code := 'BOOKING_BELUER_UNASSIGNED';
    return next;
    return;
  end if;

  v_now := pg_catalog.clock_timestamp();
  if v_booking.hold_expires_at <= v_now then
    update public.bookings as b
    set status = 'cancelled', updated_at = v_now
    where b.id = v_booking.id
      and b.status = 'payment_pending'
      and b.payment_status = 'pending'
      and b.hold_expires_at <= v_now;

    update public.payments as p
    set status = 'expired', updated_at = v_now
    where p.booking_id = v_booking.id
      and p.status in ('pending', 'processing');

    result_code := 'PAYMENT_HOLD_EXPIRED';
    return next;
    return;
  end if;

  if v_has_keyed_attempt then
    result_code := 'OK';
    payment_attempt_id := v_payment.id;
    booking_id := v_payment.booking_id;
    amount_minor := v_payment.amount_minor;
    currency := v_payment.currency;
    method := v_payment.method;
    provider := v_payment.provider;
    expires_at := v_payment.expires_at;
    status := v_payment.status;
    return next;
    return;
  end if;

  select p.*
    into v_payment
  from public.payments as p
  where p.booking_id = p_booking_id
    and p.status in ('pending', 'processing')
  for update;

  if found then
    if v_payment.provider is distinct from p_provider
      or v_payment.method is distinct from p_method then
      result_code := 'PAYMENT_ATTEMPT_ALREADY_ACTIVE';
      return next;
      return;
    end if;

    result_code := 'OK';
    payment_attempt_id := v_payment.id;
    booking_id := v_payment.booking_id;
    amount_minor := v_payment.amount_minor;
    currency := v_payment.currency;
    method := v_payment.method;
    provider := v_payment.provider;
    expires_at := v_payment.expires_at;
    status := v_payment.status;
    return next;
    return;
  end if;

  -- Keep aligned with getBookingPaymentAmountMinor: snapshot -> base_price,
  -- plus logistics and Express, rounded to PEN minor units.
  v_total := coalesce(v_booking.service_price_snapshot, v_booking.base_price, 0)
    + coalesce(v_booking.logistic_fee, 0)
    + coalesce(v_booking.express_fee, 0);

  if v_total <= 0 or v_total::text in ('NaN', 'Infinity', '-Infinity') then
    result_code := 'PAYMENT_AMOUNT_INVALID';
    return next;
    return;
  end if;

  v_amount_minor := pg_catalog.round(v_total * 100)::bigint;
  if v_amount_minor <= 0 then
    result_code := 'PAYMENT_AMOUNT_INVALID';
    return next;
    return;
  end if;

  v_now := pg_catalog.clock_timestamp();
  if v_booking.hold_expires_at <= v_now then
    update public.bookings as b
    set status = 'cancelled', updated_at = v_now
    where b.id = v_booking.id
      and b.status = 'payment_pending'
      and b.payment_status = 'pending'
      and b.hold_expires_at <= v_now;

    update public.payments as p
    set status = 'expired', updated_at = v_now
    where p.booking_id = v_booking.id
      and p.status in ('pending', 'processing');

    result_code := 'PAYMENT_HOLD_EXPIRED';
    return next;
    return;
  end if;

  begin
    insert into public.payments (
      booking_id,
      client_profile_id,
      provider,
      provider_order_id,
      provider_payment_id,
      amount_minor,
      currency,
      method,
      status,
      idempotency_key,
      expires_at
    ) values (
      v_booking.id,
      p_client_profile_id,
      p_provider,
      null,
      null,
      v_amount_minor,
      'PEN',
      p_method,
      'pending',
      p_idempotency_key,
      v_booking.hold_expires_at
    )
    returning * into v_payment;
  exception when unique_violation then
    select p.*
      into v_payment
    from public.payments as p
    where p.client_profile_id = p_client_profile_id
      and p.idempotency_key = p_idempotency_key
    for update;

    if found then
      if v_payment.booking_id is distinct from p_booking_id
        or v_payment.provider is distinct from p_provider
        or v_payment.method is distinct from p_method then
        result_code := 'IDEMPOTENCY_KEY_REUSED';
        return next;
        return;
      elsif v_payment.status = 'paid' then
        result_code := 'PAYMENT_ALREADY_COMPLETED';
        return next;
        return;
      elsif v_payment.status not in ('pending', 'processing') then
        result_code := 'PAYMENT_ATTEMPT_NOT_REUSABLE';
        return next;
        return;
      end if;
    else
      select p.*
        into v_payment
      from public.payments as p
      where p.booking_id = p_booking_id
        and p.status in ('pending', 'processing')
      for update;

      if not found then
        result_code := 'INTERNAL_ERROR';
        return next;
        return;
      elsif v_payment.provider is distinct from p_provider
        or v_payment.method is distinct from p_method then
        result_code := 'PAYMENT_ATTEMPT_ALREADY_ACTIVE';
        return next;
        return;
      end if;
    end if;
  end;

  result_code := 'OK';
  payment_attempt_id := v_payment.id;
  booking_id := v_payment.booking_id;
  amount_minor := v_payment.amount_minor;
  currency := v_payment.currency;
  method := v_payment.method;
  provider := v_payment.provider;
  expires_at := v_payment.expires_at;
  status := v_payment.status;
  return next;
end;
$$;

revoke all on function public.create_payment_attempt_with_hold_lock(uuid, uuid, text, text, uuid)
  from public, anon, authenticated;
grant execute on function public.create_payment_attempt_with_hold_lock(uuid, uuid, text, text, uuid)
  to service_role;

commit;
