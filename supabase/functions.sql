-- =====================================================
-- BELU ✦ SUPABASE RPC FUNCTIONS
-- Secure database functions for bookings, Beluers, photos and payments
-- =====================================================

-- IMPORTANT:
-- Execute after:
-- 1. schema.sql
-- 2. rls-policies.sql
-- 3. seed.sql
-- 4. storage-policies.sql
-- 5. triggers.sql
--
-- These functions are designed to centralize sensitive operations.
-- The frontend should call RPC functions instead of updating critical tables directly.

-- =====================================================
-- 1. CREATE CLIENT BOOKING
-- Creates booking + booking_services + booking_addons in a controlled way.
-- Payment will still be handled later by Culqi/Niubiz integration.
-- =====================================================

create or replace function public.create_client_booking(
  p_beluer_id uuid,
  p_assignment_mode booking_assignment_mode,
  p_scheduled_date date,
  p_scheduled_time time,
  p_district text,
  p_address text,
  p_instructions text,
  p_services jsonb,
  p_addons jsonb default '[]'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_client_id uuid;
  v_booking_id uuid;
  v_subtotal numeric(10,2) := 0;
  v_total numeric(10,2) := 0;
  v_service jsonb;
  v_addon jsonb;
begin
  v_client_id := public.current_client_profile_id();

  if v_client_id is null then
    raise exception 'Only authenticated client profiles can create bookings.';
  end if;

  if jsonb_array_length(p_services) = 0 then
    raise exception 'At least one service is required.';
  end if;

  for v_service in select * from jsonb_array_elements(p_services)
  loop
    v_subtotal := v_subtotal + coalesce((v_service ->> 'price_snapshot')::numeric, 0);
  end loop;

  for v_addon in select * from jsonb_array_elements(p_addons)
  loop
    v_subtotal := v_subtotal + coalesce((v_addon ->> 'price_snapshot')::numeric, 0);
  end loop;

  v_total := v_subtotal;

  insert into bookings (
    client_id,
    beluer_id,
    assignment_mode,
    status,
    scheduled_date,
    scheduled_time,
    district,
    address,
    instructions,
    subtotal,
    logistics_fee,
    express_fee,
    total,
    payment_status
  )
  values (
    v_client_id,
    p_beluer_id,
    p_assignment_mode,
    'pending_payment',
    p_scheduled_date,
    p_scheduled_time,
    p_district,
    p_address,
    p_instructions,
    v_subtotal,
    0,
    0,
    v_total,
    'pending'
  )
  returning id into v_booking_id;

  for v_service in select * from jsonb_array_elements(p_services)
  loop
    insert into booking_services (
      booking_id,
      service_id,
      beluer_service_id,
      name_snapshot,
      price_snapshot
    )
    values (
      v_booking_id,
      nullif(v_service ->> 'service_id', '')::uuid,
      nullif(v_service ->> 'beluer_service_id', '')::uuid,
      v_service ->> 'name_snapshot',
      (v_service ->> 'price_snapshot')::numeric
    );
  end loop;

  for v_addon in select * from jsonb_array_elements(p_addons)
  loop
    insert into booking_addons (
      booking_id,
      addon_id,
      name_snapshot,
      price_snapshot
    )
    values (
      v_booking_id,
      nullif(v_addon ->> 'addon_id', '')::uuid,
      v_addon ->> 'name_snapshot',
      (v_addon ->> 'price_snapshot')::numeric
    );
  end loop;

  return v_booking_id;
end;
$$;

-- =====================================================
-- 2. ACCEPT BOOKING AS BELUER
-- Beluer accepts a booking assigned to her or available in managed flow.
-- =====================================================

create or replace function public.accept_booking_as_beluer(
  p_booking_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_beluer_id uuid;
  v_booking bookings%rowtype;
begin
  v_beluer_id := public.current_beluer_profile_id();

  if v_beluer_id is null then
    raise exception 'Only authenticated Beluers can accept bookings.';
  end if;

  select *
  into v_booking
  from bookings
  where id = p_booking_id
  for update;

  if v_booking.id is null then
    raise exception 'Booking not found.';
  end if;

  if v_booking.status not in ('paid', 'pending_beluer_assignment', 'assigned') then
    raise exception 'Booking cannot be accepted in its current status.';
  end if;

  if v_booking.beluer_id is not null and v_booking.beluer_id <> v_beluer_id then
    raise exception 'This booking is assigned to another Beluer.';
  end if;

  update bookings
  set
    beluer_id = v_beluer_id,
    status = 'assigned',
    updated_at = now()
  where id = p_booking_id;
end;
$$;

-- =====================================================
-- 3. ADMIN ASSIGN BELUER TO BOOKING
-- Admin assigns a Beluer to a managed booking.
-- =====================================================

create or replace function public.admin_assign_beluer_to_booking(
  p_booking_id uuid,
  p_beluer_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Only admin can assign Beluers.';
  end if;

  if not exists (
    select 1
    from beluer_profiles
    where id = p_beluer_id
      and status = 'approved'
  ) then
    raise exception 'Beluer is not approved or does not exist.';
  end if;

  update bookings
  set
    beluer_id = p_beluer_id,
    status = 'assigned',
    updated_at = now()
  where id = p_booking_id;

  if not found then
    raise exception 'Booking not found.';
  end if;
end;
$$;

-- =====================================================
-- 4. ADMIN UPDATE BOOKING STATUS
-- Admin changes operational status.
-- =====================================================

create or replace function public.admin_update_booking_status(
  p_booking_id uuid,
  p_status booking_status
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Only admin can update booking status.';
  end if;

  update bookings
  set
    status = p_status,
    updated_at = now()
  where id = p_booking_id;

  if not found then
    raise exception 'Booking not found.';
  end if;
end;
$$;

-- =====================================================
-- 5. CLIENT CANCEL BOOKING
-- MVP cancellation function.
-- Later this should enforce cancellation rules by time window.
-- =====================================================

create or replace function public.client_cancel_booking(
  p_booking_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_client_id uuid;
begin
  v_client_id := public.current_client_profile_id();

  if v_client_id is null then
    raise exception 'Only authenticated clients can cancel bookings.';
  end if;

  update bookings
  set
    status = 'cancelled',
    updated_at = now()
  where id = p_booking_id
    and client_id = v_client_id
    and status not in ('completed', 'cancelled', 'refunded');

  if not found then
    raise exception 'Booking cannot be cancelled.';
  end if;
end;
$$;

-- =====================================================
-- 6. CLIENT RESCHEDULE BOOKING
-- MVP reschedule function.
-- Later this should enforce policy and notify via n8n.
-- =====================================================

create or replace function public.client_reschedule_booking(
  p_booking_id uuid,
  p_new_date date,
  p_new_time time
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_client_id uuid;
begin
  v_client_id := public.current_client_profile_id();

  if v_client_id is null then
    raise exception 'Only authenticated clients can reschedule bookings.';
  end if;

  update bookings
  set
    scheduled_date = p_new_date,
    scheduled_time = p_new_time,
    status = 'rescheduled',
    updated_at = now()
  where id = p_booking_id
    and client_id = v_client_id
    and status not in ('completed', 'cancelled', 'refunded');

  if not found then
    raise exception 'Booking cannot be rescheduled.';
  end if;
end;
$$;

-- =====================================================
-- 7. ADMIN APPROVE BELUER
-- =====================================================

create or replace function public.admin_approve_beluer(
  p_beluer_id uuid,
  p_level beluer_level default 'verificada'
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Only admin can approve Beluers.';
  end if;

  update beluer_profiles
  set
    status = 'approved',
    level = p_level,
    updated_at = now()
  where id = p_beluer_id;

  if not found then
    raise exception 'Beluer profile not found.';
  end if;
end;
$$;

-- =====================================================
-- 8. ADMIN REJECT BELUER
-- =====================================================

create or replace function public.admin_reject_beluer(
  p_beluer_id uuid,
  p_review_notes text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Only admin can reject Beluers.';
  end if;

  update beluer_profiles
  set
    status = 'rejected',
    review_notes = coalesce(p_review_notes, review_notes),
    updated_at = now()
  where id = p_beluer_id;

  if not found then
    raise exception 'Beluer profile not found.';
  end if;
end;
$$;

-- =====================================================
-- 9. ADMIN PAUSE BELUER
-- =====================================================

create or replace function public.admin_pause_beluer(
  p_beluer_id uuid,
  p_review_notes text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Only admin can pause Beluers.';
  end if;

  update beluer_profiles
  set
    status = 'paused',
    review_notes = coalesce(p_review_notes, review_notes),
    updated_at = now()
  where id = p_beluer_id;

  if not found then
    raise exception 'Beluer profile not found.';
  end if;
end;
$$;

-- =====================================================
-- 10. ADMIN UPDATE BELUER LEVEL
-- =====================================================

create or replace function public.admin_update_beluer_level(
  p_beluer_id uuid,
  p_level beluer_level
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Only admin can update Beluer level.';
  end if;

  update beluer_profiles
  set
    level = p_level,
    updated_at = now()
  where id = p_beluer_id;

  if not found then
    raise exception 'Beluer profile not found.';
  end if;
end;
$$;

-- =====================================================
-- 11. ADMIN MODERATE BELUER PHOTO
-- Approve or reject portfolio photo.
-- =====================================================

create or replace function public.admin_moderate_beluer_photo(
  p_photo_id uuid,
  p_status photo_status,
  p_review_notes text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Only admin can moderate photos.';
  end if;

  if p_status not in ('approved', 'rejected', 'pending_review') then
    raise exception 'Invalid photo status.';
  end if;

  update beluer_photos
  set
    status = p_status,
    review_notes = coalesce(p_review_notes, review_notes),
    updated_at = now()
  where id = p_photo_id;

  if not found then
    raise exception 'Photo not found.';
  end if;
end;
$$;

-- =====================================================
-- 12. ADMIN MARK FEATURED PHOTO
-- =====================================================

create or replace function public.admin_mark_featured_photo(
  p_photo_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_beluer_id uuid;
begin
  if not public.is_admin() then
    raise exception 'Only admin can feature photos.';
  end if;

  select beluer_id
  into v_beluer_id
  from beluer_photos
  where id = p_photo_id;

  if v_beluer_id is null then
    raise exception 'Photo not found.';
  end if;

  update beluer_photos
  set
    is_featured = false,
    updated_at = now()
  where beluer_id = v_beluer_id;

  update beluer_photos
  set
    is_featured = true,
    status = 'approved',
    updated_at = now()
  where id = p_photo_id;
end;
$$;

-- =====================================================
-- 13. BELUER SET COVER PHOTO
-- Beluer can set cover among her own approved or pending photos.
-- =====================================================

create or replace function public.beluer_set_cover_photo(
  p_photo_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_beluer_id uuid;
  v_photo_beluer_id uuid;
begin
  v_beluer_id := public.current_beluer_profile_id();

  if v_beluer_id is null then
    raise exception 'Only authenticated Beluers can set cover photos.';
  end if;

  select beluer_id
  into v_photo_beluer_id
  from beluer_photos
  where id = p_photo_id;

  if v_photo_beluer_id is null then
    raise exception 'Photo not found.';
  end if;

  if v_photo_beluer_id <> v_beluer_id then
    raise exception 'You can only manage your own photos.';
  end if;

  update beluer_photos
  set
    is_cover = false,
    updated_at = now()
  where beluer_id = v_beluer_id;

  update beluer_photos
  set
    is_cover = true,
    updated_at = now()
  where id = p_photo_id;
end;
$$;

-- =====================================================
-- 14. ADMIN REGISTER MANUAL PAYMENT
-- For Yape/Plin/manual confirmations in MVP.
-- =====================================================

create or replace function public.admin_register_manual_payment(
  p_booking_id uuid,
  p_method payment_method,
  p_amount numeric,
  p_transaction_id text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_client_id uuid;
  v_payment_id uuid;
begin
  if not public.is_admin() then
    raise exception 'Only admin can register manual payments.';
  end if;

  select client_id
  into v_client_id
  from bookings
  where id = p_booking_id;

  if v_client_id is null then
    raise exception 'Booking not found.';
  end if;

  insert into payments (
    booking_id,
    client_id,
    provider,
    method,
    status,
    amount,
    currency,
    transaction_id,
    paid_at
  )
  values (
    p_booking_id,
    v_client_id,
    'manual',
    p_method,
    'paid',
    p_amount,
    'PEN',
    p_transaction_id,
    now()
  )
  returning id into v_payment_id;

  return v_payment_id;
end;
$$;

-- =====================================================
-- 15. ADMIN REFUND PAYMENT
-- MVP refund status update.
-- Real refund must later call Culqi/Niubiz API.
-- =====================================================

create or replace function public.admin_refund_payment(
  p_payment_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Only admin can refund payments.';
  end if;

  update payments
  set
    status = 'refunded',
    updated_at = now()
  where id = p_payment_id;

  if not found then
    raise exception 'Payment not found.';
  end if;
end;
$$;

-- =====================================================
-- 16. GET ADMIN DASHBOARD SUMMARY
-- Returns high-level operational metrics.
-- =====================================================

create or replace function public.get_admin_dashboard_summary()
returns table (
  total_bookings bigint,
  pending_assignments bigint,
  completed_bookings bigint,
  approved_beluers bigint,
  pending_beluers bigint,
  pending_photos bigint,
  paid_amount numeric,
  platform_commission numeric
)
language sql
security definer
set search_path = public
as $$
  select
    (select count(*) from bookings) as total_bookings,
    (select count(*) from bookings where status = 'pending_beluer_assignment') as pending_assignments,
    (select count(*) from bookings where status = 'completed') as completed_bookings,
    (select count(*) from beluer_profiles where status = 'approved') as approved_beluers,
    (select count(*) from beluer_profiles where status = 'pending_review') as pending_beluers,
    (select count(*) from beluer_photos where status = 'pending_review') as pending_photos,
    (select coalesce(sum(amount), 0) from payments where status = 'paid') as paid_amount,
    (select coalesce(sum(platform_commission_amount), 0) from beluer_earnings) as platform_commission;
$$;

-- =====================================================
-- 17. GET BELUER DASHBOARD SUMMARY
-- Returns current Beluer summary.
-- =====================================================

create or replace function public.get_beluer_dashboard_summary()
returns table (
  pending_bookings bigint,
  assigned_bookings bigint,
  completed_bookings bigint,
  pending_payout numeric,
  paid_payout numeric,
  rating_average numeric,
  total_bookings int
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_beluer_id uuid;
begin
  v_beluer_id := public.current_beluer_profile_id();

  if v_beluer_id is null then
    raise exception 'Only authenticated Beluers can access this summary.';
  end if;

  return query
  select
    (select count(*) from bookings where beluer_id = v_beluer_id and status in ('paid', 'pending_beluer_assignment', 'assigned')) as pending_bookings,
    (select count(*) from bookings where beluer_id = v_beluer_id and status in ('assigned', 'confirmed', 'in_progress')) as assigned_bookings,
    (select count(*) from bookings where beluer_id = v_beluer_id and status = 'completed') as completed_bookings,
    (select coalesce(sum(net_amount), 0) from beluer_earnings where beluer_id = v_beluer_id and payout_status in ('pending', 'scheduled')) as pending_payout,
    (select coalesce(sum(net_amount), 0) from beluer_earnings where beluer_id = v_beluer_id and payout_status = 'paid') as paid_payout,
    (select bp.rating_average from beluer_profiles bp where bp.id = v_beluer_id) as rating_average,
    (select bp.total_bookings from beluer_profiles bp where bp.id = v_beluer_id) as total_bookings;
end;
$$;

-- =====================================================
-- 18. GET CLIENT DASHBOARD SUMMARY
-- Returns current client summary.
-- =====================================================

create or replace function public.get_client_dashboard_summary()
returns table (
  active_bookings bigint,
  completed_bookings bigint,
  favorite_beluers bigint,
  total_paid numeric
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_client_id uuid;
begin
  v_client_id := public.current_client_profile_id();

  if v_client_id is null then
    raise exception 'Only authenticated clients can access this summary.';
  end if;

  return query
  select
    (select count(*) from bookings where client_id = v_client_id and status not in ('completed', 'cancelled', 'refunded')) as active_bookings,
    (select count(*) from bookings where client_id = v_client_id and status = 'completed') as completed_bookings,
    (select count(*) from favorites where client_id = v_client_id) as favorite_beluers,
    (select coalesce(sum(amount), 0) from payments where client_id = v_client_id and status = 'paid') as total_paid;
end;
$$;

-- =====================================================
-- END
-- =====================================================