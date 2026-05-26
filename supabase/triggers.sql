-- =====================================================
-- BELU ✦ SUPABASE TRIGGERS
-- Business logic triggers for prices, earnings, ratings and counters
-- =====================================================

-- IMPORTANT:
-- Execute after:
-- 1. schema.sql
-- 2. rls-policies.sql
-- 3. seed.sql
-- 4. storage-policies.sql
--
-- This file adds database-level protections and automatic calculations.

-- =====================================================
-- 1. VALIDATE BELUER SERVICE PRICE
-- Beluer price cannot be lower than service minimum_price
-- =====================================================

create or replace function public.validate_beluer_service_price()
returns trigger as $$
declare
  min_price numeric(10,2);
begin
  select minimum_price
  into min_price
  from services
  where id = new.service_id;

  if min_price is null then
    raise exception 'Service not found.';
  end if;

  if new.price < min_price then
    raise exception 'Beluer service price cannot be lower than the belu minimum price.';
  end if;

  return new;
end;
$$ language plpgsql;

drop trigger if exists validate_beluer_service_price_trigger on beluer_services;

create trigger validate_beluer_service_price_trigger
before insert or update on beluer_services
for each row
execute function public.validate_beluer_service_price();

-- =====================================================
-- 2. UPDATE BOOKING PAYMENT STATUS FROM PAYMENTS
-- If payment is paid/refunded/failed, sync booking payment_status and status
-- =====================================================

create or replace function public.sync_booking_payment_status()
returns trigger as $$
begin
  if new.status = 'paid' then
    update bookings
    set
      payment_status = 'paid',
      status = case
        when status = 'pending_payment' then 'paid'::booking_status
        else status
      end,
      updated_at = now()
    where id = new.booking_id;
  end if;

  if new.status = 'failed' then
    update bookings
    set
      payment_status = 'failed',
      updated_at = now()
    where id = new.booking_id;
  end if;

  if new.status = 'refunded' then
    update bookings
    set
      payment_status = 'refunded',
      status = 'refunded',
      updated_at = now()
    where id = new.booking_id;
  end if;

  if new.status = 'partially_refunded' then
    update bookings
    set
      payment_status = 'partially_refunded',
      updated_at = now()
    where id = new.booking_id;
  end if;

  return new;
end;
$$ language plpgsql;

drop trigger if exists sync_booking_payment_status_trigger on payments;

create trigger sync_booking_payment_status_trigger
after insert or update on payments
for each row
execute function public.sync_booking_payment_status();

-- =====================================================
-- 3. CREATE OR UPDATE BELUER EARNINGS AFTER PAID PAYMENT
-- Automatically creates earning when a booking has a Beluer and payment is paid
-- =====================================================

create or replace function public.upsert_beluer_earning_from_payment()
returns trigger as $$
declare
  booking_record bookings%rowtype;
  commission_percentage numeric(5,2);
  commission_amount numeric(10,2);
  net_amount numeric(10,2);
begin
  if new.status <> 'paid' then
    return new;
  end if;

  select *
  into booking_record
  from bookings
  where id = new.booking_id;

  if booking_record.id is null then
    return new;
  end if;

  if booking_record.beluer_id is null then
    return new;
  end if;

  -- MVP default commission.
  -- Later this should depend on Beluer plan:
  -- Marketplace: 20%
  -- Libre: 15%
  -- Suscriptor: 10%
  commission_percentage := 20;
  commission_amount := round((new.amount * commission_percentage / 100), 2);
  net_amount := new.amount - commission_amount;

  insert into beluer_earnings (
    booking_id,
    beluer_id,
    gross_amount,
    platform_commission_percentage,
    platform_commission_amount,
    net_amount,
    payout_status
  )
  values (
    booking_record.id,
    booking_record.beluer_id,
    new.amount,
    commission_percentage,
    commission_amount,
    net_amount,
    'pending'
  )
  on conflict (booking_id) do update
  set
    beluer_id = excluded.beluer_id,
    gross_amount = excluded.gross_amount,
    platform_commission_percentage = excluded.platform_commission_percentage,
    platform_commission_amount = excluded.platform_commission_amount,
    net_amount = excluded.net_amount,
    payout_status = excluded.payout_status,
    updated_at = now();

  return new;
end;
$$ language plpgsql;

-- Needed for upsert by booking_id
create unique index if not exists idx_beluer_earnings_booking_unique
on beluer_earnings(booking_id);

drop trigger if exists upsert_beluer_earning_from_payment_trigger on payments;

create trigger upsert_beluer_earning_from_payment_trigger
after insert or update on payments
for each row
execute function public.upsert_beluer_earning_from_payment();

-- =====================================================
-- 4. UPDATE BELUER TOTAL BOOKINGS AFTER BOOKING COMPLETED
-- Increments total_bookings when booking becomes completed
-- =====================================================

create or replace function public.update_beluer_total_bookings()
returns trigger as $$
begin
  if new.status = 'completed'
     and old.status is distinct from 'completed'
     and new.beluer_id is not null then

    update beluer_profiles
    set
      total_bookings = total_bookings + 1,
      updated_at = now()
    where id = new.beluer_id;

  end if;

  return new;
end;
$$ language plpgsql;

drop trigger if exists update_beluer_total_bookings_trigger on bookings;

create trigger update_beluer_total_bookings_trigger
after update on bookings
for each row
execute function public.update_beluer_total_bookings();

-- =====================================================
-- 5. UPDATE BELUER RATING AFTER REVIEW
-- Recalculates average rating from reviews
-- =====================================================

create or replace function public.update_beluer_rating_average()
returns trigger as $$
declare
  target_beluer_id uuid;
begin
  target_beluer_id := coalesce(new.beluer_id, old.beluer_id);

  update beluer_profiles
  set
    rating_average = (
      select coalesce(round(avg(rating)::numeric, 2), 0)
      from reviews
      where beluer_id = target_beluer_id
    ),
    updated_at = now()
  where id = target_beluer_id;

  return coalesce(new, old);
end;
$$ language plpgsql;

drop trigger if exists update_beluer_rating_after_insert_trigger on reviews;
create trigger update_beluer_rating_after_insert_trigger
after insert on reviews
for each row
execute function public.update_beluer_rating_average();

drop trigger if exists update_beluer_rating_after_update_trigger on reviews;
create trigger update_beluer_rating_after_update_trigger
after update on reviews
for each row
execute function public.update_beluer_rating_average();

drop trigger if exists update_beluer_rating_after_delete_trigger on reviews;
create trigger update_beluer_rating_after_delete_trigger
after delete on reviews
for each row
execute function public.update_beluer_rating_average();

-- =====================================================
-- 6. ENSURE ONLY ONE COVER PHOTO PER BELUER
-- When one photo is_cover = true, all other photos for that Beluer become false
-- =====================================================

create or replace function public.ensure_single_cover_photo()
returns trigger as $$
begin
  if new.is_cover = true then
    update beluer_photos
    set
      is_cover = false,
      updated_at = now()
    where beluer_id = new.beluer_id
      and id <> new.id;
  end if;

  return new;
end;
$$ language plpgsql;

drop trigger if exists ensure_single_cover_photo_trigger on beluer_photos;

create trigger ensure_single_cover_photo_trigger
after insert or update on beluer_photos
for each row
execute function public.ensure_single_cover_photo();

-- =====================================================
-- 7. DEFAULT NEW BELUER PHOTOS TO PENDING REVIEW
-- Beluer-uploaded photos should not go live automatically
-- =====================================================

create or replace function public.force_photo_pending_review_for_non_admin()
returns trigger as $$
begin
  if not public.is_admin() then
    new.status = 'pending_review';
    new.is_featured = false;
  end if;

  return new;
end;
$$ language plpgsql;

drop trigger if exists force_photo_pending_review_for_non_admin_trigger on beluer_photos;

create trigger force_photo_pending_review_for_non_admin_trigger
before insert on beluer_photos
for each row
execute function public.force_photo_pending_review_for_non_admin();

-- =====================================================
-- 8. AUTOMATION LOG WHEN BOOKING IS CREATED
-- Useful for n8n to later detect pending automation events
-- =====================================================

create or replace function public.log_booking_created_automation()
returns trigger as $$
begin
  insert into automations_log (
    booking_id,
    automation_type,
    status,
    payload
  )
  values (
    new.id,
    'booking_created',
    'pending',
    jsonb_build_object(
      'booking_id', new.id,
      'assignment_mode', new.assignment_mode,
      'status', new.status,
      'scheduled_date', new.scheduled_date,
      'scheduled_time', new.scheduled_time,
      'district', new.district,
      'total', new.total
    )
  );

  return new;
end;
$$ language plpgsql;

drop trigger if exists log_booking_created_automation_trigger on bookings;

create trigger log_booking_created_automation_trigger
after insert on bookings
for each row
execute function public.log_booking_created_automation();

-- =====================================================
-- 9. AUTOMATION LOG WHEN BOOKING STATUS CHANGES
-- Useful for n8n workflows: assigned, cancelled, rescheduled, completed
-- =====================================================

create or replace function public.log_booking_status_change_automation()
returns trigger as $$
begin
  if old.status is distinct from new.status then
    insert into automations_log (
      booking_id,
      automation_type,
      status,
      payload
    )
    values (
      new.id,
      'booking_status_changed',
      'pending',
      jsonb_build_object(
        'booking_id', new.id,
        'old_status', old.status,
        'new_status', new.status,
        'assignment_mode', new.assignment_mode,
        'beluer_id', new.beluer_id,
        'scheduled_date', new.scheduled_date,
        'scheduled_time', new.scheduled_time
      )
    );
  end if;

  return new;
end;
$$ language plpgsql;

drop trigger if exists log_booking_status_change_automation_trigger on bookings;

create trigger log_booking_status_change_automation_trigger
after update on bookings
for each row
execute function public.log_booking_status_change_automation();

-- =====================================================
-- 10. PREVENT REVIEW BEFORE BOOKING COMPLETED
-- Clienta should only review a completed booking
-- =====================================================

create or replace function public.validate_review_booking_completed()
returns trigger as $$
declare
  booking_record bookings%rowtype;
begin
  select *
  into booking_record
  from bookings
  where id = new.booking_id;

  if booking_record.id is null then
    raise exception 'Booking not found.';
  end if;

  if booking_record.status <> 'completed' then
    raise exception 'Reviews can only be created for completed bookings.';
  end if;

  if booking_record.client_id <> new.client_id then
    raise exception 'Review client does not match booking client.';
  end if;

  if booking_record.beluer_id <> new.beluer_id then
    raise exception 'Review Beluer does not match booking Beluer.';
  end if;

  return new;
end;
$$ language plpgsql;

drop trigger if exists validate_review_booking_completed_trigger on reviews;

create trigger validate_review_booking_completed_trigger
before insert on reviews
for each row
execute function public.validate_review_booking_completed();

-- =====================================================
-- END
-- =====================================================