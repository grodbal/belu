-- B4.3C1: serialize new client bookings per Beluer and enforce schedule overlap atomically.
-- Local migration only. Do not apply to Supabase without explicit instruction.

begin;

create or replace function public.create_booking_with_schedule_lock(p_booking jsonb)
returns uuid
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_client_profile_id uuid;
  v_beluer_profile_id uuid;
  v_service_id uuid;
  v_scheduled_date date;
  v_scheduled_time time without time zone;
  v_idempotency_key uuid;
  v_duration_minutes integer;
  v_existing_booking_id uuid;
  v_booking_id uuid;
  v_service_status text;
  v_service_name text;
  v_service_category text;
  v_service_type public.service_type;
  v_minimum_price numeric(10,2);
  v_beluer_status text;
  v_beluer_is_available boolean;
  v_beluer_level public.beluer_level;
  v_category_approval_status text;
  v_offer_status text;
  v_beluer_price numeric(10,2);
  v_service_price_snapshot numeric(10,2);
  v_minimum_price_snapshot numeric(10,2);
  v_start timestamp without time zone;
  v_end timestamp without time zone;
begin
  v_client_profile_id := (p_booking ->> 'client_profile_id')::uuid;
  v_beluer_profile_id := (p_booking ->> 'beluer_profile_id')::uuid;
  v_service_id := (p_booking ->> 'service_id')::uuid;
  v_scheduled_date := (p_booking ->> 'scheduled_date')::date;
  v_scheduled_time := (p_booking ->> 'scheduled_time')::time;
  v_idempotency_key := (p_booking ->> 'idempotency_key')::uuid;

  -- Preserve idempotent retries, including retries arriving through another worker.
  select booking.id
    into v_existing_booking_id
  from public.bookings booking
  where booking.client_profile_id = v_client_profile_id
    and booking.idempotency_key = v_idempotency_key;

  if found then
    return v_existing_booking_id;
  end if;

  -- The same Beluer always maps to the same transaction-scoped advisory lock.
  -- Other Beluers use independent lock keys and can book concurrently.
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(v_beluer_profile_id::text, 811477)
  );

  -- Recheck after waiting for the lock in case another request completed the same retry.
  select booking.id
    into v_existing_booking_id
  from public.bookings booking
  where booking.client_profile_id = v_client_profile_id
    and booking.idempotency_key = v_idempotency_key;

  if found then
    return v_existing_booking_id;
  end if;

  select service.status, service.name, service.category, service.service_type
    into v_service_status, v_service_name, v_service_category, v_service_type
  from public.services service
  where service.id = v_service_id
  for share;

  if not found then
    raise exception using errcode = 'P0001', message = 'SERVICE_NOT_FOUND';
  end if;
  if v_service_status <> 'active' then
    raise exception using errcode = 'P0001', message = 'BOOKING_SERVICE_NOT_ACTIVE';
  end if;

  select rule.minimum_price
    into v_minimum_price
  from public.service_pricing_rules rule
  where rule.service_id = v_service_id
  for share;

  if not found or v_minimum_price is null or v_minimum_price <= 0 then
    raise exception using errcode = 'P0001', message = 'MINIMUM_PRICE_NOT_FOUND';
  end if;

  select beluer.status, beluer.is_available, beluer.level
    into v_beluer_status, v_beluer_is_available, v_beluer_level
  from public.beluer_profiles beluer
  where beluer.id = v_beluer_profile_id
  for share;

  if not found or v_beluer_status <> 'approved' then
    raise exception using errcode = 'P0001', message = 'BOOKING_BELUER_NOT_APPROVED';
  end if;
  if v_beluer_is_available is distinct from true then
    raise exception using errcode = 'P0001', message = 'BOOKING_BELUER_NOT_AVAILABLE';
  end if;
  if v_beluer_level::text is distinct from (p_booking ->> 'beluer_level_snapshot') then
    raise exception using errcode = 'P0001', message = 'BELUER_LEVEL_CHANGED_RETRY';
  end if;

  select approval.status
    into v_category_approval_status
  from public.beluer_category_approvals approval
  where approval.beluer_profile_id = v_beluer_profile_id
    and approval.category = v_service_category
  for share;

  if not found or v_category_approval_status <> 'approved' then
    raise exception using errcode = 'P0001', message = 'BOOKING_CATEGORY_NOT_APPROVED';
  end if;

  select skill.status, skill.beluer_price
    into v_offer_status, v_beluer_price
  from public.beluer_service_skills skill
  where skill.beluer_profile_id = v_beluer_profile_id
    and skill.service_id = v_service_id
  for share;

  if not found or v_offer_status <> 'active' then
    raise exception using errcode = 'P0001', message = 'BOOKING_OFFER_NOT_ACTIVE';
  end if;
  if v_beluer_price is null or v_beluer_price <= 0 then
    raise exception using errcode = 'P0001', message = 'BOOKING_OFFER_PRICE_INVALID';
  end if;
  if v_beluer_price < v_minimum_price then
    raise exception using errcode = 'P0001', message = 'PRICE_BELOW_MINIMUM';
  end if;

  v_service_price_snapshot := (p_booking ->> 'service_price_snapshot')::numeric;
  v_minimum_price_snapshot := (p_booking ->> 'minimum_price_snapshot')::numeric;

  if v_beluer_price is distinct from v_service_price_snapshot
    or (p_booking ->> 'public_price')::numeric is distinct from v_service_price_snapshot
    or (p_booking ->> 'base_price')::numeric is distinct from v_service_price_snapshot then
    raise exception using errcode = 'P0001', message = 'OFFER_PRICE_CHANGED_RETRY';
  end if;
  if v_minimum_price is distinct from v_minimum_price_snapshot then
    raise exception using errcode = 'P0001', message = 'MINIMUM_PRICE_CHANGED_RETRY';
  end if;
  if v_service_category is distinct from (p_booking ->> 'service_category_snapshot')
    or v_service_name is distinct from (p_booking ->> 'service_name_snapshot')
    or v_service_type is distinct from
      (p_booking ->> 'service_type_snapshot')::public.service_type then
    raise exception using errcode = 'P0001', message = 'BOOKING_SERVICE_CHANGED_RETRY';
  end if;

  select service.duration_minutes
    into v_duration_minutes
  from public.services service
  where service.id = v_service_id;

  if not found or v_duration_minutes is null or v_duration_minutes <= 0 then
    raise exception using
      errcode = 'P0001',
      message = 'BOOKING_SERVICE_DURATION_UNAVAILABLE';
  end if;

  v_start := v_scheduled_date + v_scheduled_time;
  v_end := v_start + pg_catalog.make_interval(mins => v_duration_minutes);

  if exists (
    select 1
    from public.bookings existing_booking
    join public.services existing_service
      on existing_service.id = existing_booking.service_id
    where existing_booking.beluer_profile_id = v_beluer_profile_id
      and existing_booking.status in ('assigned', 'confirmed', 'in_progress')
      and v_start < (
        existing_booking.scheduled_date
        + existing_booking.scheduled_time
        + pg_catalog.make_interval(mins => existing_service.duration_minutes)
      )
      and v_end > (existing_booking.scheduled_date + existing_booking.scheduled_time)
  ) then
    raise exception using
      errcode = 'P0001',
      message = 'TIME_SLOT_UNAVAILABLE';
  end if;

  insert into public.bookings (
    client_profile_id,
    beluer_profile_id,
    service_id,
    booking_mode,
    scheduled_date,
    scheduled_time,
    address,
    district,
    notes,
    is_express,
    express_fee,
    status,
    public_price,
    logistic_fee,
    base_price,
    payment_status,
    service_price_snapshot,
    service_name_snapshot,
    service_category_snapshot,
    service_type_snapshot,
    minimum_price_snapshot,
    beluer_level_snapshot,
    commission_rate_snapshot,
    belu_commission_rate,
    belu_commission_amount,
    beluer_service_payout_amount,
    beluer_logistic_payout_amount,
    beluer_express_payout_amount,
    beluer_total_payout_amount,
    beluer_payment_amount,
    commission_locked_at,
    commission_locked_event,
    idempotency_key
  ) values (
    v_client_profile_id,
    v_beluer_profile_id,
    v_service_id,
    'libre',
    v_scheduled_date,
    v_scheduled_time,
    p_booking ->> 'address',
    p_booking ->> 'district',
    p_booking ->> 'notes',
    (p_booking ->> 'is_express')::boolean,
    (p_booking ->> 'express_fee')::numeric,
    'assigned',
    (p_booking ->> 'public_price')::numeric,
    (p_booking ->> 'logistic_fee')::numeric,
    (p_booking ->> 'base_price')::numeric,
    'pending',
    (p_booking ->> 'service_price_snapshot')::numeric,
    p_booking ->> 'service_name_snapshot',
    p_booking ->> 'service_category_snapshot',
    (p_booking ->> 'service_type_snapshot')::public.service_type,
    (p_booking ->> 'minimum_price_snapshot')::numeric,
    p_booking ->> 'beluer_level_snapshot',
    (p_booking ->> 'commission_rate_snapshot')::numeric,
    (p_booking ->> 'belu_commission_rate')::numeric,
    (p_booking ->> 'belu_commission_amount')::numeric,
    (p_booking ->> 'beluer_service_payout_amount')::numeric,
    (p_booking ->> 'beluer_logistic_payout_amount')::numeric,
    (p_booking ->> 'beluer_express_payout_amount')::numeric,
    (p_booking ->> 'beluer_total_payout_amount')::numeric,
    (p_booking ->> 'beluer_payment_amount')::numeric,
    (p_booking ->> 'commission_locked_at')::timestamptz,
    'client_selected_beluer',
    v_idempotency_key
  )
  on conflict (client_profile_id, idempotency_key)
    where idempotency_key is not null
    do nothing
  returning id into v_booking_id;

  if v_booking_id is null then
    select booking.id
      into v_booking_id
    from public.bookings booking
    where booking.client_profile_id = v_client_profile_id
      and booking.idempotency_key = v_idempotency_key;
  end if;

  if v_booking_id is null then
    raise exception using
      errcode = 'P0001',
      message = 'BOOKING_INSERT_FAILED';
  end if;

  return v_booking_id;
end;
$$;

revoke all on function public.create_booking_with_schedule_lock(jsonb)
  from public, anon, authenticated;
grant execute on function public.create_booking_with_schedule_lock(jsonb)
  to service_role;

commit;
