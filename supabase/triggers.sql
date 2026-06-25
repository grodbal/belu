-- =====================================================
-- BELU - SUPABASE TRIGGERS
-- Triggers compatibles con el modelo MVP actual.
--
-- Importante:
-- - updated_at vive en schema.sql.
-- - La app actual calcula precios/comision en createBooking.ts.
-- - Pagos reales, payouts y WhatsApp/n8n quedan para fases posteriores.
-- =====================================================

-- =====================================================
-- 1. SYNC BOOKING PAYMENT STATUS FROM PAYMENTS
-- =====================================================

create or replace function public.sync_booking_payment_status()
returns trigger as $$
begin
  update public.bookings
  set
    payment_status = new.status,
    updated_at = now()
  where id = new.booking_id;

  return new;
end;
$$ language plpgsql;

drop trigger if exists sync_booking_payment_status_trigger on public.payments;
create trigger sync_booking_payment_status_trigger
after insert or update on public.payments
for each row
execute function public.sync_booking_payment_status();

-- =====================================================
-- 2. RECALCULATE BELUER TOTAL BOOKINGS AFTER BOOKING CHANGES
-- =====================================================

drop trigger if exists update_beluer_total_bookings_trigger on public.bookings;
drop function if exists public.update_beluer_total_bookings();

create or replace function public.recalculate_beluer_total_bookings(
  p_beluer_profile_id uuid
)
returns void as $$
begin
  if p_beluer_profile_id is null then
    return;
  end if;

  update public.beluer_profiles
  set
    total_bookings = (
      select count(*)::integer
      from public.bookings
      where beluer_profile_id = p_beluer_profile_id
        and status = 'completed'
    ),
    updated_at = now()
  where id = p_beluer_profile_id;
end;
$$ language plpgsql;

create or replace function public.sync_beluer_total_bookings()
returns trigger as $$
begin
  if tg_op = 'DELETE' then
    perform public.recalculate_beluer_total_bookings(old.beluer_profile_id);
    return old;
  end if;

  if tg_op = 'INSERT' then
    perform public.recalculate_beluer_total_bookings(new.beluer_profile_id);
    return new;
  end if;

  if old.beluer_profile_id is distinct from new.beluer_profile_id then
    perform public.recalculate_beluer_total_bookings(old.beluer_profile_id);
  end if;

  perform public.recalculate_beluer_total_bookings(new.beluer_profile_id);

  return new;
end;
$$ language plpgsql;

create trigger update_beluer_total_bookings_trigger
after insert or update or delete on public.bookings
for each row
execute function public.sync_beluer_total_bookings();

-- =====================================================
-- 3. ENSURE ONLY ONE COVER PHOTO PER BELUER
-- Fase posterior: beluer_photos + Supabase Storage.
-- =====================================================

create or replace function public.ensure_single_cover_photo()
returns trigger as $$
begin
  if new.is_cover = true then
    update public.beluer_photos
    set
      is_cover = false,
      updated_at = now()
    where beluer_id = new.beluer_id
      and id <> new.id;
  end if;

  return new;
end;
$$ language plpgsql;

drop trigger if exists ensure_single_cover_photo_trigger on public.beluer_photos;
create trigger ensure_single_cover_photo_trigger
after insert or update on public.beluer_photos
for each row
execute function public.ensure_single_cover_photo();

-- =====================================================
-- 4. FORCE NEW NON-ADMIN PHOTOS TO PENDING REVIEW
-- Fase posterior: beluer_photos + Supabase Storage.
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

drop trigger if exists force_photo_pending_review_for_non_admin_trigger on public.beluer_photos;
create trigger force_photo_pending_review_for_non_admin_trigger
before insert on public.beluer_photos
for each row
execute function public.force_photo_pending_review_for_non_admin();

-- =====================================================
-- 5. AUTOMATION LOG WHEN BOOKING IS CREATED
-- Fase posterior: WhatsApp API / n8n.
-- =====================================================

create or replace function public.log_booking_created_automation()
returns trigger as $$
begin
  insert into public.automations_log (
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
      'client_profile_id', new.client_profile_id,
      'beluer_profile_id', new.beluer_profile_id,
      'service_id', new.service_id,
      'booking_mode', new.booking_mode,
      'status', new.status,
      'payment_status', new.payment_status,
      'scheduled_date', new.scheduled_date,
      'scheduled_time', new.scheduled_time,
      'district', new.district,
      'public_price', new.public_price
    )
  );

  return new;
end;
$$ language plpgsql;

drop trigger if exists log_booking_created_automation_trigger on public.bookings;
create trigger log_booking_created_automation_trigger
after insert on public.bookings
for each row
execute function public.log_booking_created_automation();

-- =====================================================
-- 6. AUTOMATION LOG WHEN BOOKING STATUS CHANGES
-- Fase posterior: WhatsApp API / n8n.
-- =====================================================

create or replace function public.log_booking_status_change_automation()
returns trigger as $$
begin
  if old.status is distinct from new.status then
    insert into public.automations_log (
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
        'client_profile_id', new.client_profile_id,
        'beluer_profile_id', new.beluer_profile_id,
        'service_id', new.service_id,
        'booking_mode', new.booking_mode,
        'scheduled_date', new.scheduled_date,
        'scheduled_time', new.scheduled_time
      )
    );
  end if;

  return new;
end;
$$ language plpgsql;

drop trigger if exists log_booking_status_change_automation_trigger on public.bookings;
create trigger log_booking_status_change_automation_trigger
after update on public.bookings
for each row
execute function public.log_booking_status_change_automation();

-- =====================================================
-- END
-- =====================================================
