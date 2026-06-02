-- =====================================================
-- BELU ✦ SUPABASE RLS POLICIES
-- Base Row Level Security rules for Clienta, Beluer and Admin
-- =====================================================

-- IMPORTANT:
-- This file assumes Supabase Auth will be used.
-- profiles.auth_user_id should match auth.uid().
-- Admin access is determined by profiles.role = 'admin'.

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
  from profiles
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
  from profiles
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
    from profiles
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
  from client_profiles cp
  join profiles p on p.id = cp.profile_id
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
  from beluer_profiles bp
  join profiles p on p.id = bp.profile_id
  where p.auth_user_id = auth.uid()
  limit 1;
$$;

-- =====================================================
-- ENABLE RLS
-- =====================================================

alter table profiles enable row level security;
alter table client_profiles enable row level security;
alter table beluer_profiles enable row level security;
alter table services enable row level security;
alter table beluer_services enable row level security;
alter table service_addons enable row level security;
alter table beluer_photos enable row level security;
alter table beluer_availability enable row level security;
alter table bookings enable row level security;
alter table booking_services enable row level security;
alter table booking_addons enable row level security;
alter table payments enable row level security;
alter table beluer_earnings enable row level security;
alter table favorites enable row level security;
alter table reviews enable row level security;
alter table automations_log enable row level security;

-- =====================================================
-- COLUMN PRIVILEGES FOR CLIENT PROFILE EDITING
-- =====================================================

-- Client-facing writes are deliberately limited by column privileges.
-- Trusted Server Actions use service_role for full operations.

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

-- =====================================================
-- PROFILES
-- =====================================================

drop policy if exists "profiles_select_own_or_admin" on profiles;
create policy "profiles_select_own_or_admin"
on profiles
for select
to authenticated
using (
  auth_user_id = auth.uid()
  or public.is_admin()
);

drop policy if exists "profiles_update_own_or_admin" on profiles;
drop policy if exists "profiles_update_own_phone" on profiles;
create policy "profiles_update_own_phone"
on profiles
for update
to authenticated
using (
  auth_user_id = auth.uid()
)
with check (
  auth_user_id = auth.uid()
);

drop policy if exists "profiles_insert_admin" on profiles;

-- =====================================================
-- CLIENT PROFILES
-- =====================================================

drop policy if exists "client_profiles_select_own_or_admin" on client_profiles;
drop policy if exists "client_profiles_select_own" on client_profiles;
create policy "client_profiles_select_own"
on client_profiles
for select
to authenticated
using (
  profile_id = public.current_profile_id()
);

drop policy if exists "client_profiles_update_own_or_admin" on client_profiles;
drop policy if exists "client_profiles_update_own_beauty_preference" on client_profiles;
create policy "client_profiles_update_own_beauty_preference"
on client_profiles
for update
to authenticated
using (
  profile_id = public.current_profile_id()
)
with check (
  profile_id = public.current_profile_id()
);

drop policy if exists "client_profiles_insert_admin" on client_profiles;

-- =====================================================
-- BELUER PROFILES
-- =====================================================

drop policy if exists "beluer_profiles_select_public_approved_own_or_admin" on beluer_profiles;
create policy "beluer_profiles_select_public_approved_own_or_admin"
on beluer_profiles
for select
using (
  status = 'approved'
  or profile_id = public.current_profile_id()
  or public.is_admin()
);

drop policy if exists "beluer_profiles_update_own_limited_or_admin" on beluer_profiles;
create policy "beluer_profiles_update_own_limited_or_admin"
on beluer_profiles
for update
using (
  profile_id = public.current_profile_id()
  or public.is_admin()
)
with check (
  profile_id = public.current_profile_id()
  or public.is_admin()
);

drop policy if exists "beluer_profiles_insert_admin" on beluer_profiles;
create policy "beluer_profiles_insert_admin"
on beluer_profiles
for insert
with check (
  public.is_admin()
);

-- NOTE:
-- In the app layer, Beluers should NOT be allowed to edit sensitive fields:
-- level, status, rating_average, total_bookings, review_notes.
-- For stricter DB-level separation, create an RPC for Beluer profile updates later.

-- =====================================================
-- SERVICES
-- =====================================================

drop policy if exists "services_select_active_or_admin" on services;
create policy "services_select_active_or_admin"
on services
for select
using (
  is_active = true
  or public.is_admin()
);

drop policy if exists "services_admin_all" on services;
create policy "services_admin_all"
on services
for all
using (public.is_admin())
with check (public.is_admin());

-- =====================================================
-- BELUER SERVICES
-- =====================================================

drop policy if exists "beluer_services_select_active_or_owner_or_admin" on beluer_services;
create policy "beluer_services_select_active_or_owner_or_admin"
on beluer_services
for select
using (
  is_active = true
  or beluer_id = public.current_beluer_profile_id()
  or public.is_admin()
);

drop policy if exists "beluer_services_insert_owner_or_admin" on beluer_services;
create policy "beluer_services_insert_owner_or_admin"
on beluer_services
for insert
with check (
  beluer_id = public.current_beluer_profile_id()
  or public.is_admin()
);

drop policy if exists "beluer_services_update_owner_or_admin" on beluer_services;
create policy "beluer_services_update_owner_or_admin"
on beluer_services
for update
using (
  beluer_id = public.current_beluer_profile_id()
  or public.is_admin()
)
with check (
  beluer_id = public.current_beluer_profile_id()
  or public.is_admin()
);

drop policy if exists "beluer_services_delete_admin" on beluer_services;
create policy "beluer_services_delete_admin"
on beluer_services
for delete
using (public.is_admin());

-- NOTE:
-- Price minimum validation should be enforced later with a trigger
-- comparing beluer_services.price against services.minimum_price.

-- =====================================================
-- SERVICE ADDONS
-- =====================================================

drop policy if exists "service_addons_select_active_or_admin" on service_addons;
create policy "service_addons_select_active_or_admin"
on service_addons
for select
using (
  is_active = true
  or public.is_admin()
);

drop policy if exists "service_addons_admin_all" on service_addons;
create policy "service_addons_admin_all"
on service_addons
for all
using (public.is_admin())
with check (public.is_admin());

-- =====================================================
-- BELUER PHOTOS
-- =====================================================

drop policy if exists "beluer_photos_select_approved_owner_or_admin" on beluer_photos;
create policy "beluer_photos_select_approved_owner_or_admin"
on beluer_photos
for select
using (
  status = 'approved'
  or beluer_id = public.current_beluer_profile_id()
  or public.is_admin()
);

drop policy if exists "beluer_photos_insert_owner_or_admin" on beluer_photos;
create policy "beluer_photos_insert_owner_or_admin"
on beluer_photos
for insert
with check (
  beluer_id = public.current_beluer_profile_id()
  or public.is_admin()
);

drop policy if exists "beluer_photos_update_owner_or_admin" on beluer_photos;
create policy "beluer_photos_update_owner_or_admin"
on beluer_photos
for update
using (
  beluer_id = public.current_beluer_profile_id()
  or public.is_admin()
)
with check (
  beluer_id = public.current_beluer_profile_id()
  or public.is_admin()
);

drop policy if exists "beluer_photos_delete_owner_or_admin" on beluer_photos;
create policy "beluer_photos_delete_owner_or_admin"
on beluer_photos
for delete
using (
  beluer_id = public.current_beluer_profile_id()
  or public.is_admin()
);

-- NOTE:
-- In the app layer, Beluers should upload photos as pending_review.
-- Admin should be the only role allowed to approve/reject photos.

-- =====================================================
-- BELUER AVAILABILITY
-- =====================================================

drop policy if exists "beluer_availability_select_public_owner_or_admin" on beluer_availability;
create policy "beluer_availability_select_public_owner_or_admin"
on beluer_availability
for select
using (
  is_available = true
  or beluer_id = public.current_beluer_profile_id()
  or public.is_admin()
);

drop policy if exists "beluer_availability_insert_owner_or_admin" on beluer_availability;
create policy "beluer_availability_insert_owner_or_admin"
on beluer_availability
for insert
with check (
  beluer_id = public.current_beluer_profile_id()
  or public.is_admin()
);

drop policy if exists "beluer_availability_update_owner_or_admin" on beluer_availability;
create policy "beluer_availability_update_owner_or_admin"
on beluer_availability
for update
using (
  beluer_id = public.current_beluer_profile_id()
  or public.is_admin()
)
with check (
  beluer_id = public.current_beluer_profile_id()
  or public.is_admin()
);

drop policy if exists "beluer_availability_delete_owner_or_admin" on beluer_availability;
create policy "beluer_availability_delete_owner_or_admin"
on beluer_availability
for delete
using (
  beluer_id = public.current_beluer_profile_id()
  or public.is_admin()
);

-- =====================================================
-- BOOKINGS
-- =====================================================

drop policy if exists "bookings_select_owner_beluer_or_admin" on bookings;
create policy "bookings_select_owner_beluer_or_admin"
on bookings
for select
using (
  client_id = public.current_client_profile_id()
  or beluer_id = public.current_beluer_profile_id()
  or public.is_admin()
);

drop policy if exists "bookings_insert_client_or_admin" on bookings;
create policy "bookings_insert_client_or_admin"
on bookings
for insert
with check (
  client_id = public.current_client_profile_id()
  or public.is_admin()
);

drop policy if exists "bookings_update_owner_beluer_or_admin" on bookings;
create policy "bookings_update_owner_beluer_or_admin"
on bookings
for update
using (
  client_id = public.current_client_profile_id()
  or beluer_id = public.current_beluer_profile_id()
  or public.is_admin()
)
with check (
  client_id = public.current_client_profile_id()
  or beluer_id = public.current_beluer_profile_id()
  or public.is_admin()
);

-- NOTE:
-- In production, update permissions should be stricter:
-- Clienta can cancel/reprogram only according to policy.
-- Beluer can accept assigned bookings only.
-- Admin can manage operational status.
-- This should later move to RPC functions.

-- =====================================================
-- BOOKING SERVICES
-- =====================================================

drop policy if exists "booking_services_select_related_or_admin" on booking_services;
create policy "booking_services_select_related_or_admin"
on booking_services
for select
using (
  exists (
    select 1
    from bookings b
    where b.id = booking_services.booking_id
      and (
        b.client_id = public.current_client_profile_id()
        or b.beluer_id = public.current_beluer_profile_id()
        or public.is_admin()
      )
  )
);

drop policy if exists "booking_services_insert_client_or_admin" on booking_services;
create policy "booking_services_insert_client_or_admin"
on booking_services
for insert
with check (
  exists (
    select 1
    from bookings b
    where b.id = booking_services.booking_id
      and (
        b.client_id = public.current_client_profile_id()
        or public.is_admin()
      )
  )
);

-- =====================================================
-- BOOKING ADDONS
-- =====================================================

drop policy if exists "booking_addons_select_related_or_admin" on booking_addons;
create policy "booking_addons_select_related_or_admin"
on booking_addons
for select
using (
  exists (
    select 1
    from bookings b
    where b.id = booking_addons.booking_id
      and (
        b.client_id = public.current_client_profile_id()
        or b.beluer_id = public.current_beluer_profile_id()
        or public.is_admin()
      )
  )
);

drop policy if exists "booking_addons_insert_client_or_admin" on booking_addons;
create policy "booking_addons_insert_client_or_admin"
on booking_addons
for insert
with check (
  exists (
    select 1
    from bookings b
    where b.id = booking_addons.booking_id
      and (
        b.client_id = public.current_client_profile_id()
        or public.is_admin()
      )
  )
);

-- =====================================================
-- PAYMENTS
-- =====================================================

drop policy if exists "payments_select_client_or_admin" on payments;
create policy "payments_select_client_or_admin"
on payments
for select
using (
  client_id = public.current_client_profile_id()
  or public.is_admin()
);

drop policy if exists "payments_insert_client_or_admin" on payments;
create policy "payments_insert_client_or_admin"
on payments
for insert
with check (
  client_id = public.current_client_profile_id()
  or public.is_admin()
);

drop policy if exists "payments_update_admin" on payments;
create policy "payments_update_admin"
on payments
for update
using (public.is_admin())
with check (public.is_admin());

-- NOTE:
-- Beluers should not see full client payment records.
-- Their financial view should come from beluer_earnings.

-- =====================================================
-- BELUER EARNINGS
-- =====================================================

drop policy if exists "beluer_earnings_select_owner_or_admin" on beluer_earnings;
create policy "beluer_earnings_select_owner_or_admin"
on beluer_earnings
for select
using (
  beluer_id = public.current_beluer_profile_id()
  or public.is_admin()
);

drop policy if exists "beluer_earnings_admin_all" on beluer_earnings;
create policy "beluer_earnings_admin_all"
on beluer_earnings
for all
using (public.is_admin())
with check (public.is_admin());

-- =====================================================
-- FAVORITES
-- =====================================================

drop policy if exists "favorites_select_owner_or_admin" on favorites;
create policy "favorites_select_owner_or_admin"
on favorites
for select
using (
  client_id = public.current_client_profile_id()
  or public.is_admin()
);

drop policy if exists "favorites_insert_owner_or_admin" on favorites;
create policy "favorites_insert_owner_or_admin"
on favorites
for insert
with check (
  client_id = public.current_client_profile_id()
  or public.is_admin()
);

drop policy if exists "favorites_delete_owner_or_admin" on favorites;
create policy "favorites_delete_owner_or_admin"
on favorites
for delete
using (
  client_id = public.current_client_profile_id()
  or public.is_admin()
);

-- =====================================================
-- REVIEWS
-- =====================================================

drop policy if exists "reviews_select_public_owner_or_admin" on reviews;
create policy "reviews_select_public_owner_or_admin"
on reviews
for select
using (
  true
);

drop policy if exists "reviews_insert_client_or_admin" on reviews;
create policy "reviews_insert_client_or_admin"
on reviews
for insert
with check (
  client_id = public.current_client_profile_id()
  or public.is_admin()
);

drop policy if exists "reviews_update_admin" on reviews;
create policy "reviews_update_admin"
on reviews
for update
using (public.is_admin())
with check (public.is_admin());

-- NOTE:
-- Later, review insert should be restricted to completed bookings only.

-- =====================================================
-- AUTOMATIONS LOG
-- =====================================================

drop policy if exists "automations_log_select_admin" on automations_log;
create policy "automations_log_select_admin"
on automations_log
for select
using (public.is_admin());

drop policy if exists "automations_log_insert_admin" on automations_log;
create policy "automations_log_insert_admin"
on automations_log
for insert
with check (public.is_admin());

drop policy if exists "automations_log_update_admin" on automations_log;
create policy "automations_log_update_admin"
on automations_log
for update
using (public.is_admin())
with check (public.is_admin());

-- =====================================================
-- END
-- =====================================================
