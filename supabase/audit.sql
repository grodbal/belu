-- =====================================================
-- BELU ✦ AUDIT LOG
-- Sensitive action tracking for Admin operations
-- =====================================================

-- IMPORTANT:
-- Execute after:
-- 1. schema.sql
-- 2. rls-policies.sql
-- 3. seed.sql
-- 4. storage-policies.sql
-- 5. triggers.sql
-- 6. functions.sql
-- 7. views.sql
--
-- This file creates audit tables and triggers for sensitive changes.
-- The goal is traceability, not frontend functionality yet.

-- =====================================================
-- AUDIT ACTION ENUM
-- =====================================================

do $$ begin
  create type audit_action_type as enum (
    'insert',
    'update',
    'delete',
    'status_change',
    'level_change',
    'payment_change',
    'refund',
    'photo_moderation',
    'booking_assignment',
    'booking_status_change'
  );
exception
  when duplicate_object then null;
end $$;

-- =====================================================
-- AUDIT LOG TABLE
-- =====================================================

create table if not exists audit_log (
  id uuid primary key default gen_random_uuid(),

  actor_profile_id uuid references profiles(id) on delete set null,
  actor_role user_role,

  action_type audit_action_type not null,
  table_name text not null,
  record_id uuid,

  old_data jsonb,
  new_data jsonb,

  description text,

  created_at timestamptz not null default now()
);

create index if not exists idx_audit_log_actor_profile_id
on audit_log(actor_profile_id);

create index if not exists idx_audit_log_table_name
on audit_log(table_name);

create index if not exists idx_audit_log_record_id
on audit_log(record_id);

create index if not exists idx_audit_log_action_type
on audit_log(action_type);

create index if not exists idx_audit_log_created_at
on audit_log(created_at);

-- =====================================================
-- ENABLE RLS
-- =====================================================

alter table audit_log enable row level security;

drop policy if exists "audit_log_select_admin" on audit_log;
create policy "audit_log_select_admin"
on audit_log
for select
using (public.is_admin());

drop policy if exists "audit_log_insert_system_or_admin" on audit_log;
create policy "audit_log_insert_system_or_admin"
on audit_log
for insert
with check (public.is_admin());

-- NOTE:
-- Regular users should never read audit logs.
-- Admin can read them from a future Admin / Audit section.

-- =====================================================
-- HELPER: INSERT AUDIT LOG
-- =====================================================

create or replace function public.insert_audit_log(
  p_action_type audit_action_type,
  p_table_name text,
  p_record_id uuid,
  p_old_data jsonb default null,
  p_new_data jsonb default null,
  p_description text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor_profile_id uuid;
  v_actor_role user_role;
begin
  v_actor_profile_id := public.current_profile_id();
  v_actor_role := public.current_user_role();

  insert into audit_log (
    actor_profile_id,
    actor_role,
    action_type,
    table_name,
    record_id,
    old_data,
    new_data,
    description
  )
  values (
    v_actor_profile_id,
    v_actor_role,
    p_action_type,
    p_table_name,
    p_record_id,
    p_old_data,
    p_new_data,
    p_description
  );
end;
$$;

-- =====================================================
-- GENERIC AUDIT FUNCTION FOR UPDATES
-- =====================================================

create or replace function public.audit_sensitive_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_action audit_action_type := 'update';
  v_description text := null;
begin
  -- beluer_profiles: status change
  if tg_table_name = 'beluer_profiles'
     and old.status is distinct from new.status then
    v_action := 'status_change';
    v_description := 'Beluer status changed from ' || old.status || ' to ' || new.status;
  end if;

  -- beluer_profiles: level change
  if tg_table_name = 'beluer_profiles'
     and old.level is distinct from new.level then
    v_action := 'level_change';
    v_description := 'Beluer level changed from ' || old.level || ' to ' || new.level;
  end if;

  -- bookings: Beluer assignment
  if tg_table_name = 'bookings'
     and old.beluer_id is distinct from new.beluer_id then
    v_action := 'booking_assignment';
    v_description := 'Booking Beluer assignment changed.';
  end if;

  -- bookings: status change
  if tg_table_name = 'bookings'
     and old.status is distinct from new.status then
    v_action := 'booking_status_change';
    v_description := 'Booking status changed from ' || old.status || ' to ' || new.status;
  end if;

  -- payments: payment status change
  if tg_table_name = 'payments'
     and old.status is distinct from new.status then
    v_action := case
      when new.status = 'refunded' then 'refund'::audit_action_type
      else 'payment_change'::audit_action_type
    end;

    v_description := 'Payment status changed from ' || old.status || ' to ' || new.status;
  end if;

  -- beluer_photos: moderation change
  if tg_table_name = 'beluer_photos'
     and old.status is distinct from new.status then
    v_action := 'photo_moderation';
    v_description := 'Photo status changed from ' || old.status || ' to ' || new.status;
  end if;

  perform public.insert_audit_log(
    v_action,
    tg_table_name,
    new.id,
    to_jsonb(old),
    to_jsonb(new),
    v_description
  );

  return new;
end;
$$;

-- =====================================================
-- GENERIC AUDIT FUNCTION FOR INSERTS
-- =====================================================

create or replace function public.audit_sensitive_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.insert_audit_log(
    'insert',
    tg_table_name,
    new.id,
    null,
    to_jsonb(new),
    'Record inserted into ' || tg_table_name
  );

  return new;
end;
$$;

-- =====================================================
-- GENERIC AUDIT FUNCTION FOR DELETES
-- =====================================================

create or replace function public.audit_sensitive_delete()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.insert_audit_log(
    'delete',
    tg_table_name,
    old.id,
    to_jsonb(old),
    null,
    'Record deleted from ' || tg_table_name
  );

  return old;
end;
$$;

-- =====================================================
-- TRIGGERS: BELUER PROFILES
-- =====================================================

drop trigger if exists audit_beluer_profiles_update_trigger on beluer_profiles;
create trigger audit_beluer_profiles_update_trigger
after update on beluer_profiles
for each row
execute function public.audit_sensitive_update();

drop trigger if exists audit_beluer_profiles_insert_trigger on beluer_profiles;
create trigger audit_beluer_profiles_insert_trigger
after insert on beluer_profiles
for each row
execute function public.audit_sensitive_insert();

-- =====================================================
-- TRIGGERS: SERVICES
-- =====================================================

drop trigger if exists audit_services_update_trigger on services;
create trigger audit_services_update_trigger
after update on services
for each row
execute function public.audit_sensitive_update();

drop trigger if exists audit_services_insert_trigger on services;
create trigger audit_services_insert_trigger
after insert on services
for each row
execute function public.audit_sensitive_insert();

-- =====================================================
-- TRIGGERS: BOOKINGS
-- =====================================================

drop trigger if exists audit_bookings_update_trigger on bookings;
create trigger audit_bookings_update_trigger
after update on bookings
for each row
execute function public.audit_sensitive_update();

drop trigger if exists audit_bookings_insert_trigger on bookings;
create trigger audit_bookings_insert_trigger
after insert on bookings
for each row
execute function public.audit_sensitive_insert();

-- =====================================================
-- TRIGGERS: PAYMENTS
-- =====================================================

drop trigger if exists audit_payments_update_trigger on payments;
create trigger audit_payments_update_trigger
after update on payments
for each row
execute function public.audit_sensitive_update();

drop trigger if exists audit_payments_insert_trigger on payments;
create trigger audit_payments_insert_trigger
after insert on payments
for each row
execute function public.audit_sensitive_insert();

-- =====================================================
-- TRIGGERS: BELUER PHOTOS
-- =====================================================

drop trigger if exists audit_beluer_photos_update_trigger on beluer_photos;
create trigger audit_beluer_photos_update_trigger
after update on beluer_photos
for each row
execute function public.audit_sensitive_update();

drop trigger if exists audit_beluer_photos_insert_trigger on beluer_photos;
create trigger audit_beluer_photos_insert_trigger
after insert on beluer_photos
for each row
execute function public.audit_sensitive_insert();

drop trigger if exists audit_beluer_photos_delete_trigger on beluer_photos;
create trigger audit_beluer_photos_delete_trigger
after delete on beluer_photos
for each row
execute function public.audit_sensitive_delete();

-- =====================================================
-- AUDIT VIEWS
-- =====================================================

create or replace view public.v_admin_audit_log as
select
  al.id,
  al.actor_profile_id,
  p.full_name as actor_name,
  al.actor_role,
  al.action_type,
  al.table_name,
  al.record_id,
  al.description,
  al.old_data,
  al.new_data,
  al.created_at
from audit_log al
left join profiles p on p.id = al.actor_profile_id
order by al.created_at desc;

-- =====================================================
-- NOTES
-- =====================================================

-- 1. This audit system tracks sensitive changes.
-- 2. Admin should later have a visual Audit section.
-- 3. For production, avoid showing full old_data/new_data to all admins if sensitive fields grow.
-- 4. If external systems update the DB with service role, actor_profile_id may be null.
-- 5. For n8n/API jobs, consider adding system_actor text later.