-- =====================================================
-- BELU - SUPABASE RLS POLICIES
-- Modelo local alineado con la app MVP actual.
--
-- Importante:
-- - La app escribe datos sensibles desde Server Actions con service_role.
-- - authenticated solo recibe permisos directos minimos de lectura/edicion.
-- - No ejecutar automaticamente contra remoto desde Codex.
-- =====================================================

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

create or replace function public.current_profile_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id
  from public.profiles
  where auth_user_id = auth.uid()
  limit 1;
$$;

create or replace function public.current_user_role()
returns user_role
language sql
stable
security definer
set search_path = public
as $$
  select role
  from public.profiles
  where auth_user_id = auth.uid()
  limit 1;
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where auth_user_id = auth.uid()
      and role = 'admin'
  );
$$;

create or replace function public.current_client_profile_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select cp.id
  from public.client_profiles cp
  join public.profiles p on p.id = cp.profile_id
  where p.auth_user_id = auth.uid()
  limit 1;
$$;

create or replace function public.current_beluer_profile_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select bp.id
  from public.beluer_profiles bp
  join public.profiles p on p.id = bp.profile_id
  where p.auth_user_id = auth.uid()
  limit 1;
$$;

-- =====================================================
-- ENABLE RLS
-- =====================================================

alter table public.profiles enable row level security;
alter table public.client_profiles enable row level security;
alter table public.beluer_profiles enable row level security;
alter table public.services enable row level security;
alter table public.beluer_service_skills enable row level security;
alter table public.bookings enable row level security;
alter table public.payments enable row level security;
alter table public.beluer_photos enable row level security;
alter table public.automations_log enable row level security;

-- =====================================================
-- TABLE / COLUMN PRIVILEGES
-- =====================================================

revoke all privileges on table public.profiles from anon;
revoke insert, update, delete on table public.profiles from authenticated;
grant select on table public.profiles to authenticated;
grant update (phone) on table public.profiles to authenticated;
grant select, insert, update, delete on table public.profiles to service_role;

revoke all privileges on table public.client_profiles from anon;
revoke insert, update, delete on table public.client_profiles from authenticated;
grant select on table public.client_profiles to authenticated;
grant update (beauty_preference) on table public.client_profiles to authenticated;
grant select, insert, update, delete on table public.client_profiles to service_role;

revoke insert, update, delete on table public.beluer_profiles from authenticated;
grant select on table public.beluer_profiles to anon, authenticated;
grant select, insert, update, delete on table public.beluer_profiles to service_role;

revoke insert, update, delete on table public.services from authenticated;
grant select on table public.services to anon, authenticated;
grant select, insert, update, delete on table public.services to service_role;

revoke insert, update, delete on table public.beluer_service_skills from authenticated;
grant select on table public.beluer_service_skills to anon, authenticated;
grant select, insert, update, delete on table public.beluer_service_skills to service_role;

revoke insert, update, delete on table public.bookings from authenticated;
grant select on table public.bookings to authenticated;
grant select, insert, update, delete on table public.bookings to service_role;

revoke insert, update, delete on table public.payments from authenticated;
grant select on table public.payments to authenticated;
grant select, insert, update, delete on table public.payments to service_role;

revoke insert, update, delete on table public.beluer_photos from authenticated;
grant select on table public.beluer_photos to anon, authenticated;
grant select, insert, update, delete on table public.beluer_photos to service_role;

revoke all privileges on table public.automations_log from anon, authenticated;
grant select on table public.automations_log to authenticated;
grant select, insert, update, delete on table public.automations_log to service_role;

-- =====================================================
-- PROFILES
-- =====================================================

drop policy if exists "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_admin"
on public.profiles
for select
to authenticated
using (
  auth_user_id = auth.uid()
  or public.is_admin()
);

drop policy if exists "profiles_update_own_or_admin" on public.profiles;
drop policy if exists "profiles_update_own_phone" on public.profiles;
create policy "profiles_update_own_phone"
on public.profiles
for update
to authenticated
using (auth_user_id = auth.uid())
with check (auth_user_id = auth.uid());

-- No direct authenticated insert/delete policy for profiles.
-- Clienta registration and Beluer creation use protected Server Actions.

-- =====================================================
-- CLIENT_PROFILES
-- =====================================================

drop policy if exists "client_profiles_select_own_or_admin" on public.client_profiles;
drop policy if exists "client_profiles_select_own" on public.client_profiles;
create policy "client_profiles_select_own"
on public.client_profiles
for select
to authenticated
using (
  profile_id = public.current_profile_id()
);

drop policy if exists "client_profiles_update_own_or_admin" on public.client_profiles;
drop policy if exists "client_profiles_update_own_beauty_preference" on public.client_profiles;
create policy "client_profiles_update_own_beauty_preference"
on public.client_profiles
for update
to authenticated
using (
  profile_id = public.current_profile_id()
)
with check (
  profile_id = public.current_profile_id()
);

-- No direct authenticated insert/delete policy for client_profiles.
-- createClientProfile/updateClientProfile use service_role safely.

-- =====================================================
-- BELUER_PROFILES
-- =====================================================

drop policy if exists "beluer_profiles_select_public_approved_own_or_admin" on public.beluer_profiles;
create policy "beluer_profiles_select_public_approved_own_or_admin"
on public.beluer_profiles
for select
to anon, authenticated
using (
  status = 'approved'
  or profile_id = public.current_profile_id()
  or public.is_admin()
);

-- Beluer profile edits go through updateBeluerPublicProfileAction with service_role.
-- Admin operational edits go through protected admin Server Actions.
-- No broad authenticated update policy is granted here.

-- =====================================================
-- SERVICES
-- =====================================================

drop policy if exists "services_select_active_or_admin" on public.services;
create policy "services_select_active_or_admin"
on public.services
for select
to anon, authenticated
using (
  status = 'active'
  or public.is_admin()
);

-- Services are managed only by Admin/service_role.

-- =====================================================
-- BELUER_SERVICE_SKILLS
-- =====================================================

drop policy if exists "beluer_service_skills_select_related_or_admin" on public.beluer_service_skills;
create policy "beluer_service_skills_select_related_or_admin"
on public.beluer_service_skills
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.beluer_profiles bp
    where bp.id = beluer_service_skills.beluer_profile_id
      and (
        bp.status = 'approved'
        or bp.profile_id = public.current_profile_id()
        or public.is_admin()
      )
  )
);

-- Skill assignment is Admin-only through updateBeluerServiceSkillsAction.
-- No direct authenticated insert/update/delete policy.

-- =====================================================
-- BOOKINGS
-- =====================================================

drop policy if exists "bookings_select_owner_beluer_or_admin" on public.bookings;
create policy "bookings_select_owner_beluer_or_admin"
on public.bookings
for select
to authenticated
using (
  client_profile_id = public.current_profile_id()
  or beluer_profile_id = public.current_beluer_profile_id()
  or public.is_admin()
);

drop policy if exists "bookings_insert_client_or_admin" on public.bookings;
drop policy if exists "bookings_update_owner_beluer_or_admin" on public.bookings;

-- No direct authenticated insert/update/delete on bookings.
-- createBooking, cancelBooking, Admin assignment/status and Beluer accept/reject
-- are handled by Server Actions that validate role/ownership and use service_role.

-- =====================================================
-- PAYMENTS
-- =====================================================

drop policy if exists "payments_select_client_or_admin" on public.payments;
create policy "payments_select_client_or_admin"
on public.payments
for select
to authenticated
using (
  client_profile_id = public.current_profile_id()
  or public.is_admin()
);

drop policy if exists "payments_insert_client_or_admin" on public.payments;
drop policy if exists "payments_update_admin" on public.payments;

-- No client direct inserts into payments for MVP.
-- Real gateway integration should write via webhooks/service_role.

-- =====================================================
-- BELUER_PHOTOS
-- =====================================================

drop policy if exists "beluer_photos_select_approved_owner_or_admin" on public.beluer_photos;
create policy "beluer_photos_select_approved_owner_or_admin"
on public.beluer_photos
for select
to anon, authenticated
using (
  status = 'approved'
  or beluer_id = public.current_beluer_profile_id()
  or public.is_admin()
);

drop policy if exists "beluer_photos_insert_owner_or_admin" on public.beluer_photos;
drop policy if exists "beluer_photos_update_owner_or_admin" on public.beluer_photos;
drop policy if exists "beluer_photos_delete_owner_or_admin" on public.beluer_photos;

-- Portfolio is Fase posterior: beluer_photos + Supabase Storage.
-- Until then, no direct authenticated write policy is granted.

-- =====================================================
-- AUTOMATIONS_LOG
-- =====================================================

drop policy if exists "automations_log_select_admin" on public.automations_log;
create policy "automations_log_select_admin"
on public.automations_log
for select
to authenticated
using (public.is_admin());

-- Writes should come from service_role / n8n integration only.

-- =====================================================
-- END
-- =====================================================
