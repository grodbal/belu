-- =====================================================
-- BELU - SUPABASE BASE SCHEMA
-- Modelo local con el fundamento aditivo B4.2A para catálogo y precios por Beluer.
--
-- Importante:
-- - No ejecutar automaticamente contra remoto desde Codex.
-- - La app actual usa Server Actions con service_role para escrituras sensibles.
-- - MVP: una reserva = un servicio mediante bookings.service_id.
-- - Fase 2: servicios multiples requieren booking_items o equivalente.
-- =====================================================

create extension if not exists "pgcrypto";

-- =====================================================
-- ENUMS
-- =====================================================

do $$ begin
  create type user_role as enum ('cliente', 'beluer', 'admin');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type beluer_level as enum ('nueva', 'standard', 'premium', 'top');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type beluer_status as enum ('pending_review', 'approved', 'rejected', 'paused', 'disabled');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type service_type as enum ('primary', 'addon');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type beluer_category_approval_status as enum ('pending', 'approved', 'rejected', 'revoked');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type service_status as enum ('active', 'inactive');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type beluer_skill_status as enum ('active', 'inactive');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type booking_mode as enum ('managed', 'libre');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type booking_status as enum (
    'pending',
    'assigned',
    'confirmed',
    'in_progress',
    'completed',
    'cancelled',
    'redo_requested',
    'redo_approved'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type payment_status as enum ('pending', 'paid', 'failed', 'refunded');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type payment_provider as enum ('manual', 'culqi', 'niubiz', 'yape');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type payment_method as enum ('manual', 'card', 'yape', 'plin');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type photo_status as enum ('pending_review', 'approved', 'rejected');
exception when duplicate_object then null;
end $$;

-- =====================================================
-- USER PROFILES
-- =====================================================

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique,
  role user_role not null,
  full_name text not null,
  email text unique,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.client_profiles (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references public.profiles(id) on delete cascade,
  district text,
  main_address text,
  beauty_preference text,
  whatsapp_notifications_enabled boolean not null default true,
  day_21_reminder_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.beluer_profiles (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references public.profiles(id) on delete cascade,
  public_name text not null,
  bio text,
  instagram text,
  phone text,
  profile_photo_url text,
  districts text[] not null default '{}',
  experience_years integer not null default 0,
  level beluer_level not null default 'nueva',
  status beluer_status not null default 'pending_review',
  rating_average numeric(3,2) not null default 0,
  total_bookings integer not null default 0,
  is_available boolean not null default true,
  weekly_income_goal numeric(10,2) not null default 0,
  monthly_income_goal numeric(10,2) not null default 4000,
  review_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =====================================================
-- SERVICES
-- =====================================================

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  service_type service_type not null default 'primary',
  name text not null unique,
  description text,
  public_price numeric(10,2) not null,
  logistic_fee numeric(10,2) not null default 10,
  base_price numeric(10,2) generated always as (public_price - logistic_fee) stored,
  duration_minutes integer not null default 90,
  image_url text,
  is_featured boolean not null default false,
  status service_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint services_price_check check (public_price >= 0 and logistic_fee >= 0),
  constraint services_category_check check (category in ('lashes', 'nails', 'brows')),
  constraint services_base_price_positive check (base_price >= 0)
);

alter table public.services
  add column if not exists service_type service_type not null default 'primary';

alter table public.services
  drop constraint if exists services_category_check;
alter table public.services
  add constraint services_category_check
  check (category in ('lashes', 'nails', 'brows'));

create table if not exists public.service_images (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references public.services(id) on delete cascade,
  image_url text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.beluer_service_skills (
  id uuid primary key default gen_random_uuid(),
  beluer_profile_id uuid not null references public.beluer_profiles(id) on delete cascade,
  service_id uuid not null references public.services(id) on delete cascade,
  status beluer_skill_status not null default 'active',
  beluer_price numeric(10,2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (beluer_profile_id, service_id),
  constraint beluer_service_skills_beluer_price_check check (beluer_price is null or beluer_price > 0)
);

alter table public.beluer_service_skills
  add column if not exists beluer_price numeric(10,2);
do $$ begin
  if not exists (select 1 from pg_constraint where conrelid = 'public.beluer_service_skills'::regclass and conname = 'beluer_service_skills_beluer_price_check') then
    alter table public.beluer_service_skills add constraint beluer_service_skills_beluer_price_check
      check (beluer_price is null or beluer_price > 0);
  end if;
end $$;

create table if not exists public.service_pricing_rules (
  service_id uuid primary key references public.services(id) on delete cascade,
  minimum_price numeric(10,2) not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint service_pricing_rules_minimum_price_check check (minimum_price > 0)
);

create table if not exists public.beluer_category_approvals (
  id uuid primary key default gen_random_uuid(),
  beluer_profile_id uuid not null references public.beluer_profiles(id) on delete cascade,
  category text not null constraint beluer_category_approvals_category_check check (category in ('lashes', 'nails', 'brows')),
  status beluer_category_approval_status not null default 'pending',
  approved_by uuid references public.profiles(id) on delete set null,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint beluer_category_approvals_beluer_category_key unique (beluer_profile_id, category)
);

-- =====================================================
-- BOOKINGS
-- =====================================================

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),

  -- Nombre conservado por compatibilidad con la app actual.
  -- Apunta a profiles.id de una clienta, no a client_profiles.id.
  client_profile_id uuid not null references public.profiles(id),

  beluer_profile_id uuid references public.beluer_profiles(id),
  service_id uuid not null references public.services(id),
  booking_mode text not null default 'managed',
  scheduled_date date not null,
  scheduled_time time not null,
  address text not null,
  district text not null,
  notes text,
  is_express boolean not null default false,
  express_fee numeric(10,2) not null default 0,
  status text not null default 'pending',
  public_price numeric(10,2) not null,
  logistic_fee numeric(10,2) not null default 0,
  base_price numeric(10,2) not null default 0,
  belu_commission_rate numeric(5,2) not null default 13,
  belu_commission_amount numeric(10,2) not null default 0,
  beluer_payment_amount numeric(10,2) not null default 0,
  payment_status text not null default 'pending',
  idempotency_key uuid,
  service_price_snapshot numeric(10,2),
  service_name_snapshot text,
  service_category_snapshot text check (service_category_snapshot is null or service_category_snapshot in ('lashes', 'nails', 'brows')),
  service_type_snapshot service_type,
  minimum_price_snapshot numeric(10,2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table if exists public.bookings
  add column if not exists beluer_level_snapshot text,
  add column if not exists commission_rate_snapshot numeric(6,4),
  add column if not exists beluer_service_payout_amount numeric(10,2),
  add column if not exists beluer_logistic_payout_amount numeric(10,2),
  add column if not exists beluer_express_payout_amount numeric(10,2),
  add column if not exists beluer_total_payout_amount numeric(10,2),
  add column if not exists commission_locked_at timestamptz,
  add column if not exists commission_locked_event text,
  add column if not exists service_price_snapshot numeric(10,2),
  add column if not exists service_name_snapshot text,
  add column if not exists service_category_snapshot text,
  add column if not exists service_type_snapshot service_type,
  add column if not exists minimum_price_snapshot numeric(10,2);
do $ begin
  if not exists (select 1 from pg_constraint where conrelid = 'public.bookings'::regclass and conname = 'bookings_service_category_snapshot_check') then
    alter table public.bookings add constraint bookings_service_category_snapshot_check
      check (service_category_snapshot is null or service_category_snapshot in ('lashes', 'nails', 'brows'));
  end if;
end $;

-- Fase 2:
-- Para reservas combinadas, crear booking_items con snapshots por servicio:
-- booking_id, service_id, service_name_snapshot, category_snapshot,
-- public_price_snapshot, base_price_snapshot, belu_commission_amount_snapshot,
-- beluer_payment_amount_snapshot, duration_minutes_snapshot.

-- =====================================================
-- PAYMENTS / PORTFOLIO / AUTOMATIONS
-- =====================================================

-- La app MVP no usa aun una tabla payments real; Admin Pagos lee bookings.
-- Esta tabla queda como base para Culqi/Niubiz/Yape/manual cuando se conecte pasarela.
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  client_profile_id uuid not null references public.profiles(id),
  provider payment_provider not null default 'manual',
  method payment_method not null default 'manual',
  status payment_status not null default 'pending',
  amount numeric(10,2) not null default 0,
  currency text not null default 'PEN',
  transaction_id text,
  receipt_url text,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Tabla futura/remota opcional para portafolio real + Supabase Storage.
-- AdminPhotosRealList tolera que no exista en remoto y muestra empty state.
create table if not exists public.beluer_photos (
  id uuid primary key default gen_random_uuid(),
  beluer_id uuid not null references public.beluer_profiles(id) on delete cascade,
  image_url text not null,
  category text not null check (category in ('lashes', 'nails', 'brows')),
  caption text,
  is_cover boolean not null default false,
  is_featured boolean not null default false,
  status photo_status not null default 'pending_review',
  review_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.automations_log (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references public.bookings(id) on delete set null,
  automation_type text not null,
  status text not null default 'pending',
  payload jsonb,
  error_message text,
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

-- =====================================================
-- INDEXES
-- =====================================================

create index if not exists idx_profiles_auth_user_id on public.profiles(auth_user_id);
create index if not exists idx_profiles_role on public.profiles(role);

create index if not exists idx_client_profiles_profile_id on public.client_profiles(profile_id);

create index if not exists idx_beluer_profiles_profile_id on public.beluer_profiles(profile_id);
create index if not exists idx_beluer_profiles_status on public.beluer_profiles(status);
create index if not exists idx_beluer_profiles_available on public.beluer_profiles(is_available);

create index if not exists idx_services_category on public.services(category);
create index if not exists idx_services_status on public.services(status);

create index if not exists service_images_service_id_idx
  on public.service_images(service_id);

create index if not exists service_images_sort_order_idx
  on public.service_images(service_id, sort_order);

create index if not exists idx_beluer_service_skills_beluer on public.beluer_service_skills(beluer_profile_id);
create index if not exists idx_beluer_service_skills_service on public.beluer_service_skills(service_id);
create index if not exists idx_beluer_service_skills_status on public.beluer_service_skills(status);
create index if not exists beluer_service_skills_service_status_price_idx
  on public.beluer_service_skills(service_id, status, beluer_price);
create index if not exists beluer_category_approvals_beluer_status_idx
  on public.beluer_category_approvals(beluer_profile_id, status);
create index if not exists beluer_category_approvals_category_status_idx
  on public.beluer_category_approvals(category, status);

create index if not exists idx_bookings_client_profile_id on public.bookings(client_profile_id);
create index if not exists idx_bookings_beluer_profile_id on public.bookings(beluer_profile_id);
create index if not exists idx_bookings_service_id on public.bookings(service_id);
create index if not exists idx_bookings_status on public.bookings(status);
create index if not exists idx_bookings_payment_status on public.bookings(payment_status);
create unique index if not exists bookings_client_idempotency_key_idx
  on public.bookings(client_profile_id, idempotency_key)
  where idempotency_key is not null;
create index if not exists idx_bookings_scheduled_date on public.bookings(scheduled_date);

create index if not exists idx_payments_booking_id on public.payments(booking_id);
create index if not exists idx_payments_status on public.payments(status);

create index if not exists idx_beluer_photos_beluer_id on public.beluer_photos(beluer_id);
create index if not exists idx_beluer_photos_status on public.beluer_photos(status);

-- =====================================================
-- UPDATED_AT TRIGGER
-- =====================================================

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_client_profiles_updated_at on public.client_profiles;
create trigger set_client_profiles_updated_at
before update on public.client_profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_beluer_profiles_updated_at on public.beluer_profiles;
create trigger set_beluer_profiles_updated_at
before update on public.beluer_profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_services_updated_at on public.services;
create trigger set_services_updated_at
before update on public.services
for each row execute function public.set_updated_at();

drop trigger if exists set_beluer_service_skills_updated_at on public.beluer_service_skills;
create trigger set_beluer_service_skills_updated_at
before update on public.beluer_service_skills
for each row execute function public.set_updated_at();

drop trigger if exists set_service_pricing_rules_updated_at on public.service_pricing_rules;
create trigger set_service_pricing_rules_updated_at
before update on public.service_pricing_rules
for each row execute function public.set_updated_at();

drop trigger if exists set_beluer_category_approvals_updated_at on public.beluer_category_approvals;
create trigger set_beluer_category_approvals_updated_at
before update on public.beluer_category_approvals
for each row execute function public.set_updated_at();

drop trigger if exists set_bookings_updated_at on public.bookings;
create trigger set_bookings_updated_at
before update on public.bookings
for each row execute function public.set_updated_at();

drop trigger if exists set_payments_updated_at on public.payments;
create trigger set_payments_updated_at
before update on public.payments
for each row execute function public.set_updated_at();

drop trigger if exists set_beluer_photos_updated_at on public.beluer_photos;
create trigger set_beluer_photos_updated_at
before update on public.beluer_photos
for each row execute function public.set_updated_at();
