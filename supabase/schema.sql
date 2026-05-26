-- =====================================================
-- BELU ✦ SUPABASE BASE SCHEMA
-- MVP database structure for Clienta, Beluer and Admin panels
-- =====================================================

-- Required extension for UUID generation
create extension if not exists "pgcrypto";

-- =====================================================
-- ENUMS
-- =====================================================

do $$ begin
  create type user_role as enum ('clienta', 'beluer', 'admin');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type beluer_level as enum ('nueva', 'verificada', 'top');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type beluer_status as enum ('pending_review', 'approved', 'rejected', 'paused', 'disabled');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type service_category as enum ('lashes', 'nails', 'brows', 'addon');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type booking_assignment_mode as enum ('gestionado', 'libre');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type booking_status as enum (
    'pending_payment',
    'paid',
    'pending_beluer_assignment',
    'assigned',
    'confirmed',
    'in_progress',
    'completed',
    'cancelled',
    'rescheduled',
    'refunded'
  );
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type payment_provider as enum ('culqi', 'niubiz', 'manual');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type payment_method as enum ('card', 'yape', 'plin');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type payment_status as enum ('pending', 'paid', 'failed', 'refunded', 'partially_refunded');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type photo_status as enum ('pending_review', 'approved', 'rejected');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type payout_status as enum ('pending', 'scheduled', 'paid', 'held', 'cancelled');
exception
  when duplicate_object then null;
end $$;

-- =====================================================
-- CORE USER TABLES
-- =====================================================

create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique,
  role user_role not null,
  full_name text not null,
  email text unique,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists client_profiles (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references profiles(id) on delete cascade,
  district text,
  main_address text,
  beauty_preference text,
  whatsapp_notifications_enabled boolean not null default true,
  day_21_reminder_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists beluer_profiles (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references profiles(id) on delete cascade,
  public_name text not null,
  bio text,
  instagram text,
  phone text,
  profile_photo_url text,
  districts text[] not null default '{}',
  experience_years int not null default 0,
  level beluer_level not null default 'nueva',
  status beluer_status not null default 'pending_review',
  rating_average numeric(3,2) not null default 0,
  total_bookings int not null default 0,
  is_available boolean not null default true,
  review_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =====================================================
-- SERVICES
-- =====================================================

create table if not exists services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category service_category not null,
  description text,
  minimum_price numeric(10,2) not null default 0,
  estimated_duration_minutes int not null default 60,
  image_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists beluer_services (
  id uuid primary key default gen_random_uuid(),
  beluer_id uuid not null references beluer_profiles(id) on delete cascade,
  service_id uuid not null references services(id) on delete cascade,
  price numeric(10,2) not null,
  duration_minutes int,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (beluer_id, service_id)
);

create table if not exists service_addons (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category service_category not null,
  description text,
  price numeric(10,2) not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =====================================================
-- BELUER PHOTOS AND AVAILABILITY
-- =====================================================

create table if not exists beluer_photos (
  id uuid primary key default gen_random_uuid(),
  beluer_id uuid not null references beluer_profiles(id) on delete cascade,
  image_url text not null,
  category service_category not null,
  caption text,
  is_cover boolean not null default false,
  is_featured boolean not null default false,
  status photo_status not null default 'pending_review',
  review_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists beluer_availability (
  id uuid primary key default gen_random_uuid(),
  beluer_id uuid not null references beluer_profiles(id) on delete cascade,
  day_of_week int not null check (day_of_week between 0 and 6),
  start_time time not null,
  end_time time not null,
  is_available boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =====================================================
-- BOOKINGS
-- =====================================================

create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references client_profiles(id),
  beluer_id uuid references beluer_profiles(id),
  assignment_mode booking_assignment_mode not null default 'gestionado',
  status booking_status not null default 'pending_payment',
  scheduled_date date not null,
  scheduled_time time not null,
  district text not null,
  address text not null,
  instructions text,
  subtotal numeric(10,2) not null default 0,
  logistics_fee numeric(10,2) not null default 0,
  express_fee numeric(10,2) not null default 0,
  total numeric(10,2) not null default 0,
  payment_status payment_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists booking_services (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references bookings(id) on delete cascade,
  service_id uuid references services(id),
  beluer_service_id uuid references beluer_services(id),
  name_snapshot text not null,
  price_snapshot numeric(10,2) not null,
  created_at timestamptz not null default now()
);

create table if not exists booking_addons (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references bookings(id) on delete cascade,
  addon_id uuid references service_addons(id),
  name_snapshot text not null,
  price_snapshot numeric(10,2) not null,
  created_at timestamptz not null default now()
);

-- =====================================================
-- PAYMENTS AND EARNINGS
-- =====================================================

create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references bookings(id) on delete cascade,
  client_id uuid not null references client_profiles(id),
  provider payment_provider not null default 'manual',
  method payment_method not null,
  status payment_status not null default 'pending',
  amount numeric(10,2) not null default 0,
  currency text not null default 'PEN',
  transaction_id text,
  receipt_url text,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists beluer_earnings (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references bookings(id) on delete cascade,
  beluer_id uuid not null references beluer_profiles(id),
  gross_amount numeric(10,2) not null default 0,
  platform_commission_percentage numeric(5,2) not null default 20,
  platform_commission_amount numeric(10,2) not null default 0,
  net_amount numeric(10,2) not null default 0,
  payout_status payout_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =====================================================
-- FAVORITES AND REVIEWS
-- =====================================================

create table if not exists favorites (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references client_profiles(id) on delete cascade,
  beluer_id uuid not null references beluer_profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (client_id, beluer_id)
);

create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null unique references bookings(id) on delete cascade,
  client_id uuid not null references client_profiles(id),
  beluer_id uuid not null references beluer_profiles(id),
  rating int not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now()
);

-- =====================================================
-- AUTOMATIONS LOG
-- =====================================================

create table if not exists automations_log (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references bookings(id) on delete set null,
  automation_type text not null,
  status text not null default 'pending',
  sent_at timestamptz,
  payload jsonb,
  error_message text,
  created_at timestamptz not null default now()
);

-- =====================================================
-- INDEXES
-- =====================================================

create index if not exists idx_profiles_auth_user_id on profiles(auth_user_id);
create index if not exists idx_profiles_role on profiles(role);

create index if not exists idx_beluer_profiles_status on beluer_profiles(status);
create index if not exists idx_beluer_profiles_level on beluer_profiles(level);

create index if not exists idx_services_category on services(category);
create index if not exists idx_services_active on services(is_active);

create index if not exists idx_beluer_services_beluer_id on beluer_services(beluer_id);
create index if not exists idx_beluer_services_service_id on beluer_services(service_id);

create index if not exists idx_beluer_photos_beluer_id on beluer_photos(beluer_id);
create index if not exists idx_beluer_photos_status on beluer_photos(status);

create index if not exists idx_bookings_client_id on bookings(client_id);
create index if not exists idx_bookings_beluer_id on bookings(beluer_id);
create index if not exists idx_bookings_status on bookings(status);
create index if not exists idx_bookings_scheduled_date on bookings(scheduled_date);

create index if not exists idx_payments_booking_id on payments(booking_id);
create index if not exists idx_payments_status on payments(status);

create index if not exists idx_beluer_earnings_beluer_id on beluer_earnings(beluer_id);
create index if not exists idx_beluer_earnings_payout_status on beluer_earnings(payout_status);

-- =====================================================
-- UPDATED_AT TRIGGER
-- =====================================================

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_profiles_updated_at on profiles;
create trigger set_profiles_updated_at
before update on profiles
for each row execute function set_updated_at();

drop trigger if exists set_client_profiles_updated_at on client_profiles;
create trigger set_client_profiles_updated_at
before update on client_profiles
for each row execute function set_updated_at();

drop trigger if exists set_beluer_profiles_updated_at on beluer_profiles;
create trigger set_beluer_profiles_updated_at
before update on beluer_profiles
for each row execute function set_updated_at();

drop trigger if exists set_services_updated_at on services;
create trigger set_services_updated_at
before update on services
for each row execute function set_updated_at();

drop trigger if exists set_beluer_services_updated_at on beluer_services;
create trigger set_beluer_services_updated_at
before update on beluer_services
for each row execute function set_updated_at();

drop trigger if exists set_bookings_updated_at on bookings;
create trigger set_bookings_updated_at
before update on bookings
for each row execute function set_updated_at();

drop trigger if exists set_payments_updated_at on payments;
create trigger set_payments_updated_at
before update on payments
for each row execute function set_updated_at();

drop trigger if exists set_beluer_earnings_updated_at on beluer_earnings;
create trigger set_beluer_earnings_updated_at
before update on beluer_earnings
for each row execute function set_updated_at();