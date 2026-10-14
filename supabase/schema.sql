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
  hold_expires_at timestamptz,
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
  updated_at timestamptz not null default now(),
  constraint bookings_id_client_owner_key unique (id, client_profile_id),
  constraint bookings_status_check check (status in ('pending', 'payment_pending', 'assigned', 'confirmed', 'in_progress', 'completed', 'cancelled', 'redo_requested', 'redo_approved')),
  constraint bookings_payment_status_check check (payment_status in ('pending', 'paid', 'failed', 'refunded')),
  constraint bookings_payment_pending_hold_check check (status <> 'payment_pending' or (payment_status = 'pending' and hold_expires_at is not null))
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
  add column if not exists minimum_price_snapshot numeric(10,2),
  add column if not exists hold_expires_at timestamptz;

alter table public.bookings
  drop constraint if exists bookings_status_check;
alter table public.bookings
  add constraint bookings_status_check
  check (status in ('pending', 'payment_pending', 'assigned', 'confirmed', 'in_progress', 'completed', 'cancelled', 'redo_requested', 'redo_approved'));
alter table public.bookings
  drop constraint if exists bookings_payment_pending_hold_check;
alter table public.bookings
  add constraint bookings_payment_pending_hold_check
  check (status <> 'payment_pending' or (payment_status = 'pending' and hold_expires_at is not null));
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

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null,
  client_profile_id uuid not null references public.profiles(id) on delete restrict,
  provider text not null check (length(btrim(provider)) > 0),
  provider_order_id text,
  provider_payment_id text,
  amount_minor bigint not null check (amount_minor > 0),
  currency text not null default 'PEN' check (currency = 'PEN'),
  method text,
  status text not null default 'pending' check (status in ('pending', 'processing', 'paid', 'failed', 'expired', 'refunded')),
  idempotency_key uuid not null,
  failure_code text,
  failure_message_safe text,
  expires_at timestamptz,
  paid_at timestamptz,
  refunded_amount_minor bigint not null default 0 check (refunded_amount_minor >= 0 and refunded_amount_minor <= amount_minor),
  refunded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (client_profile_id, idempotency_key),
  foreign key (booking_id, client_profile_id)
    references public.bookings(id, client_profile_id) on delete restrict
);

create table if not exists public.payment_webhook_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null check (length(btrim(provider)) > 0),
  provider_event_id text not null check (length(btrim(provider_event_id)) > 0),
  payment_id uuid references public.payments(id) on delete set null,
  event_type text,
  payload_hash text check (payload_hash is null or payload_hash ~ '^[0-9a-f]{64}$'),
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  processing_status text not null default 'received' check (processing_status in ('received', 'processing', 'processed', 'failed', 'ignored')),
  error_safe text,
  unique (provider, provider_event_id)
);

create table if not exists public.integration_outbox (
  id uuid primary key default gen_random_uuid(),
  event_type text not null check (length(btrim(event_type)) > 0),
  aggregate_type text not null check (length(btrim(aggregate_type)) > 0),
  aggregate_id uuid not null,
  payload jsonb not null default '{}'::jsonb,
  deduplication_key text not null unique,
  status text not null default 'pending' check (status in ('pending', 'processing', 'processed', 'failed')),
  attempts integer not null default 0 check (attempts >= 0),
  available_at timestamptz not null default now(),
  locked_at timestamptz,
  locked_by text check (locked_by is null or (length(btrim(locked_by)) between 1 and 128)),
  last_error_safe text check (last_error_safe is null or length(last_error_safe) <= 128),
  processed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint integration_outbox_lock_pair_check check ((locked_at is null) = (locked_by is null))
);

create unique index if not exists payments_provider_order_id_idx on public.payments(provider, provider_order_id) where provider_order_id is not null;
create unique index if not exists payments_provider_payment_id_idx on public.payments(provider, provider_payment_id) where provider_payment_id is not null;
create unique index if not exists payments_one_active_attempt_per_booking_idx on public.payments(booking_id) where status in ('pending', 'processing');
create index if not exists payments_booking_created_at_idx on public.payments(booking_id, created_at desc);
create index if not exists integration_outbox_claim_idx
  on public.integration_outbox(status, available_at, created_at, attempts)
  where status in ('pending', 'failed', 'processing');

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
create index if not exists bookings_beluer_schedule_status_idx
  on public.bookings (beluer_profile_id, scheduled_date, scheduled_time, status);
create index if not exists idx_bookings_service_id on public.bookings(service_id);
create index if not exists idx_bookings_status on public.bookings(status);
create index if not exists idx_bookings_payment_status on public.bookings(payment_status);
create unique index if not exists bookings_client_idempotency_key_idx
  on public.bookings(client_profile_id, idempotency_key)
  where idempotency_key is not null;
create index if not exists idx_bookings_scheduled_date on public.bookings(scheduled_date);

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

  select booking.id
    into v_existing_booking_id
  from public.bookings booking
  where booking.client_profile_id = v_client_profile_id
    and booking.idempotency_key = v_idempotency_key;

  if found then
    return v_existing_booking_id;
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(v_beluer_profile_id::text, 811477)
  );

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
      and (
        existing_booking.status in ('assigned', 'confirmed', 'in_progress')
        or (existing_booking.status = 'payment_pending' and existing_booking.hold_expires_at > now())
      )
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
    client_profile_id, beluer_profile_id, service_id, booking_mode,
    scheduled_date, scheduled_time, address, district, notes,
    is_express, express_fee, status, hold_expires_at, public_price, logistic_fee, base_price,
    payment_status, service_price_snapshot, service_name_snapshot,
    service_category_snapshot, service_type_snapshot, minimum_price_snapshot,
    beluer_level_snapshot, commission_rate_snapshot, belu_commission_rate,
    belu_commission_amount, beluer_service_payout_amount,
    beluer_logistic_payout_amount, beluer_express_payout_amount,
    beluer_total_payout_amount, beluer_payment_amount,
    commission_locked_at, commission_locked_event, idempotency_key
  ) values (
    v_client_profile_id, v_beluer_profile_id, v_service_id, 'libre',
    v_scheduled_date, v_scheduled_time,
    p_booking ->> 'address', p_booking ->> 'district', p_booking ->> 'notes',
    (p_booking ->> 'is_express')::boolean,
    (p_booking ->> 'express_fee')::numeric, 'payment_pending', now() + interval '15 minutes',
    (p_booking ->> 'public_price')::numeric,
    (p_booking ->> 'logistic_fee')::numeric,
    (p_booking ->> 'base_price')::numeric, 'pending',
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
    'client_selected_beluer', v_idempotency_key
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

create or replace function public.expire_booking_payment_hold(p_booking_id uuid)
returns boolean
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_beluer_profile_id uuid;
begin
  select beluer_profile_id into v_beluer_profile_id
  from public.bookings where id = p_booking_id;
  if not found or v_beluer_profile_id is null then return false; end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(v_beluer_profile_id::text, 811477)
  );

  update public.bookings
  set status = 'cancelled', updated_at = now()
  where id = p_booking_id
    and beluer_profile_id = v_beluer_profile_id
    and status = 'payment_pending'
    and payment_status <> 'paid'
    and hold_expires_at <= now();

  if not found then return false; end if;

  update public.payments
  set status = 'expired', updated_at = now()
  where booking_id = p_booking_id and status in ('pending', 'processing');
  return true;
end;
$$;
revoke all on function public.expire_booking_payment_hold(uuid) from public, anon, authenticated;
grant execute on function public.expire_booking_payment_hold(uuid) to service_role;

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


-- B5.1D: atomically record a provider-confirmed payment and enqueue its domain event.


create or replace function public.confirm_booking_payment(
  p_payment_attempt_id uuid,
  p_provider text,
  p_provider_payment_id text,
  p_provider_order_id text default null,
  p_paid_at timestamptz default null
)
returns table (
  result_code text,
  booking_id uuid,
  payment_attempt_id uuid,
  booking_status text,
  booking_payment_status text,
  payment_status text,
  outbox_event_id uuid
)
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_payment public.payments%rowtype;
  v_booking public.bookings%rowtype;
  v_amount_minor bigint;
  v_total numeric;
  v_now timestamptz := pg_catalog.clock_timestamp();
  v_late boolean := false;
  v_deduplication_key text;
begin
  result_code := 'PAYMENT_ATTEMPT_NOT_FOUND';
  booking_id := null;
  payment_attempt_id := p_payment_attempt_id;
  booking_status := null;
  booking_payment_status := null;
  payment_status := null;
  outbox_event_id := null;

  if p_payment_attempt_id is null or p_provider is null or btrim(p_provider) = ''
    or p_provider_payment_id is null or btrim(p_provider_payment_id) = '' then
    result_code := 'INVALID_REQUEST';
    return next;
    return;
  end if;

  -- Read the immutable relationship, then lock booking before payment, matching
  -- create_payment_attempt_with_hold_lock and expire_booking_payment_hold.
  select p.* into v_payment from public.payments p where p.id = p_payment_attempt_id;
  if not found then return next; return; end if;
  booking_id := v_payment.booking_id;

  select b.* into v_booking from public.bookings b where b.id = v_payment.booking_id for update;
  if not found then result_code := 'BOOKING_NOT_FOUND'; return next; return; end if;

  select p.* into v_payment from public.payments p where p.id = p_payment_attempt_id for update;
  if not found or v_payment.booking_id is distinct from v_booking.id then
    result_code := 'PAYMENT_ATTEMPT_NOT_FOUND'; return next; return;
  end if;

  booking_status := v_booking.status;
  booking_payment_status := v_booking.payment_status;
  payment_status := v_payment.status;
  v_now := pg_catalog.clock_timestamp();

  if v_payment.provider is distinct from p_provider then
    result_code := 'PAYMENT_PROVIDER_MISMATCH'; return next; return;
  end if;
  if v_payment.currency is distinct from 'PEN' or v_payment.amount_minor <= 0 then
    result_code := 'PAYMENT_ATTEMPT_NOT_CONFIRMABLE'; return next; return;
  end if;

  v_late := v_booking.payment_status = 'pending'
    and (v_booking.status = 'cancelled'
      or (v_booking.hold_expires_at is not null and v_booking.hold_expires_at <= v_now));

  if v_payment.status = 'paid' then
    if v_payment.provider_payment_id is distinct from p_provider_payment_id
      or (p_provider_order_id is not null and v_payment.provider_order_id is distinct from p_provider_order_id) then
      result_code := 'PAYMENT_ATTEMPT_NOT_CONFIRMABLE'; return next; return;
    end if;
    if v_booking.payment_status = 'paid' then
      v_deduplication_key := 'booking.payment_confirmed:' || v_booking.id::text;
      select o.id into outbox_event_id from public.integration_outbox o where o.deduplication_key = v_deduplication_key;
      result_code := 'PAYMENT_ALREADY_CONFIRMED'; return next; return;
    end if;
    if v_late then
      v_deduplication_key := 'payment.late_paid_requires_review:' || v_payment.id::text;
      select o.id into outbox_event_id from public.integration_outbox o where o.deduplication_key = v_deduplication_key;
      result_code := 'PAYMENT_LATE_AFTER_EXPIRY'; return next; return;
    end if;
    result_code := 'PAYMENT_ATTEMPT_NOT_CONFIRMABLE'; return next; return;
  end if;

  if v_payment.status = 'refunded' then
    result_code := 'PAYMENT_ATTEMPT_NOT_CONFIRMABLE'; return next; return;
  end if;

  if v_payment.status not in ('pending', 'processing') and not v_late then
    result_code := 'PAYMENT_ATTEMPT_NOT_CONFIRMABLE'; return next; return;
  end if;
  if not v_late then
    if v_booking.client_profile_id is distinct from v_payment.client_profile_id
      or v_booking.beluer_profile_id is null
      or v_booking.status is distinct from 'payment_pending'
      or v_booking.payment_status is distinct from 'pending'
      or v_booking.hold_expires_at is null then
      result_code := 'BOOKING_PAYMENT_STATE_INVALID'; return next; return;
    end if;

    v_total := coalesce(v_booking.service_price_snapshot, v_booking.base_price, 0)
      + coalesce(v_booking.logistic_fee, 0) + coalesce(v_booking.express_fee, 0);
    if v_total <= 0 or v_total::text in ('NaN', 'Infinity', '-Infinity') then
      result_code := 'PAYMENT_AMOUNT_MISMATCH'; return next; return;
    end if;
    v_amount_minor := pg_catalog.round(v_total * 100)::bigint;
    if v_payment.amount_minor is distinct from v_amount_minor then
      result_code := 'PAYMENT_AMOUNT_MISMATCH'; return next; return;
    end if;

    -- The hold can expire while validation runs, so check immediately before writes.
    v_now := pg_catalog.clock_timestamp();
    v_late := v_booking.payment_status = 'pending'
      and (v_booking.status = 'cancelled'
        or (v_booking.hold_expires_at is not null and v_booking.hold_expires_at <= v_now));

    if not v_late then
      begin
        update public.payments p set status = 'paid', provider_payment_id = p_provider_payment_id,
          provider_order_id = coalesce(p_provider_order_id, p.provider_order_id),
          paid_at = coalesce(p_paid_at, v_now), updated_at = v_now
        where p.id = v_payment.id;
      exception when unique_violation then
        result_code := 'PAYMENT_PROVIDER_ID_CONFLICT'; return next; return;
      end;

      update public.bookings b set payment_status = 'paid', status = 'assigned',
        hold_expires_at = null, updated_at = v_now where b.id = v_booking.id;

      v_deduplication_key := 'booking.payment_confirmed:' || v_booking.id::text;
      insert into public.integration_outbox (event_type, aggregate_type, aggregate_id, payload, deduplication_key)
      values ('booking.payment_confirmed', 'booking', v_booking.id,
        jsonb_build_object('booking_id', v_booking.id, 'payment_attempt_id', v_payment.id,
          'client_profile_id', v_booking.client_profile_id, 'beluer_profile_id', v_booking.beluer_profile_id,
          'service_id', v_booking.service_id, 'scheduled_date', v_booking.scheduled_date,
          'scheduled_time', v_booking.scheduled_time, 'district', v_booking.district,
          'amount_minor', v_payment.amount_minor, 'currency', v_payment.currency,
          'provider', v_payment.provider, 'method', v_payment.method), v_deduplication_key)
      on conflict (deduplication_key) do nothing returning id into outbox_event_id;
      if outbox_event_id is null then
        select o.id into outbox_event_id from public.integration_outbox o where o.deduplication_key = v_deduplication_key;
      end if;

      booking_status := 'assigned';
      booking_payment_status := 'paid';
      payment_status := 'paid';
      result_code := 'OK';
      return next; return;
    end if;
  end if;

  -- A verified late capture is recorded as paid without reviving the booking.
  update public.bookings b set status = 'cancelled', updated_at = v_now
  where b.id = v_booking.id and b.payment_status = 'pending'
    and b.hold_expires_at is not null and b.hold_expires_at <= v_now;
  booking_status := case when v_booking.payment_status = 'pending' then 'cancelled' else v_booking.status end;
  update public.payments p set status = 'paid', provider_payment_id = p_provider_payment_id,
    provider_order_id = coalesce(p_provider_order_id, p.provider_order_id),
    paid_at = coalesce(p_paid_at, v_now), updated_at = v_now where p.id = v_payment.id;
  v_deduplication_key := 'payment.late_paid_requires_review:' || v_payment.id::text;
  insert into public.integration_outbox (event_type, aggregate_type, aggregate_id, payload, deduplication_key)
  values ('payment.late_paid_requires_review', 'payment', v_payment.id,
    jsonb_build_object('booking_id', v_booking.id, 'payment_attempt_id', v_payment.id,
      'amount_minor', v_payment.amount_minor, 'provider', v_payment.provider,
      'provider_payment_id', p_provider_payment_id), v_deduplication_key)
  on conflict (deduplication_key) do nothing returning id into outbox_event_id;
  if outbox_event_id is null then
    select o.id into outbox_event_id from public.integration_outbox o where o.deduplication_key = v_deduplication_key;
  end if;
  payment_status := 'paid';
  result_code := 'PAYMENT_LATE_AFTER_EXPIRY';
  return next;
exception when unique_violation then
  result_code := 'PAYMENT_PROVIDER_ID_CONFLICT';
  return next;
end;
$$;

revoke all on function public.confirm_booking_payment(uuid, text, text, text, timestamptz)
  from public, anon, authenticated;
grant execute on function public.confirm_booking_payment(uuid, text, text, text, timestamptz)
  to service_role;

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

drop trigger if exists set_integration_outbox_updated_at on public.integration_outbox;
create trigger set_integration_outbox_updated_at
before update on public.integration_outbox
for each row execute function public.set_updated_at();

-- Outbox processing RPCs are defined in the B5.1F migration below.

drop trigger if exists set_beluer_photos_updated_at on public.beluer_photos;
create trigger set_beluer_photos_updated_at
before update on public.beluer_photos
for each row execute function public.set_updated_at();

-- B4.3A: integrity rules for new-catalog Beluer offers.
create or replace function public.enforce_beluer_service_offer_integrity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  service_category text;
  locked_service_category text;
  service_status text;
  minimum_price numeric(10,2);
  beluer_status text;
  approval_status public.beluer_category_approval_status;
begin
  select s.category
  into service_category
  from public.services s
  where s.id = new.service_id;

  if not found then
    return new;
  end if;

  if new.status <> 'active' then
    return new;
  end if;

  if not exists (
    select 1 from public.service_pricing_rules rule
    where rule.service_id = new.service_id
  ) then
    return new;
  end if;

  select a.status into approval_status
  from public.beluer_category_approvals a
  where a.beluer_profile_id = new.beluer_profile_id
    and a.category = service_category
  for share;
  if approval_status is distinct from 'approved' then
    raise exception using errcode = '23514', message = 'ACTIVE_OFFER_REQUIRES_APPROVED_CATEGORY';
  end if;

  select bp.status into beluer_status
  from public.beluer_profiles bp
  where bp.id = new.beluer_profile_id
  for share;
  if beluer_status is distinct from 'approved' then
    raise exception using errcode = '23514', message = 'ACTIVE_OFFER_REQUIRES_APPROVED_BELUER';
  end if;

  select s.category, s.status
    into locked_service_category, service_status
  from public.services s
  where s.id = new.service_id
  for share of s;

  if not found or locked_service_category is distinct from service_category then
    raise exception using errcode = '23514', message = 'ACTIVE_OFFER_SERVICE_CHANGED_RETRY';
  end if;
  if service_status is distinct from 'active' then
    raise exception using errcode = '23514', message = 'ACTIVE_OFFER_REQUIRES_SERVICE_ACTIVE';
  end if;

  select rule.minimum_price
    into minimum_price
  from public.service_pricing_rules rule
  where rule.service_id = new.service_id
  for share;

  if not found or minimum_price is null then
    return new;
  end if;

  if new.beluer_price is null then
    raise exception using errcode = '23514', message = 'ACTIVE_OFFER_REQUIRES_PRICE';
  end if;
  if new.beluer_price < minimum_price then
    raise exception using errcode = '23514', message = 'ACTIVE_OFFER_PRICE_BELOW_MINIMUM';
  end if;

  return new;
end;
$$;

drop trigger if exists beluer_service_skills_offer_integrity on public.beluer_service_skills;
create trigger beluer_service_skills_offer_integrity
before insert or update of beluer_profile_id, service_id, status, beluer_price
on public.beluer_service_skills
for each row execute function public.enforce_beluer_service_offer_integrity();

create or replace function public.prevent_invalid_minimum_price_increase()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.minimum_price > old.minimum_price and exists (
    select 1 from public.beluer_service_skills skill
    where skill.service_id = new.service_id
      and skill.status = 'active'
      and (skill.beluer_price is null or skill.beluer_price < new.minimum_price)
  ) then
    raise exception using
      errcode = '23514',
      message = 'MINIMUM_PRICE_UPDATE_CONFLICTS_WITH_ACTIVE_OFFERS';
  end if;
  return new;
end;
$$;

drop trigger if exists service_pricing_rules_minimum_price_guard on public.service_pricing_rules;
create trigger service_pricing_rules_minimum_price_guard
before update of minimum_price on public.service_pricing_rules
for each row execute function public.prevent_invalid_minimum_price_increase();

create or replace function public.set_beluer_category_approval(
  p_beluer_profile_id uuid,
  p_category text,
  p_status public.beluer_category_approval_status,
  p_approved_by uuid
)
returns void
language plpgsql
security invoker
set search_path = public
as $$
begin
  if p_category not in ('lashes', 'nails', 'brows') then
    raise exception using errcode = '22023', message = 'INVALID_CATEGORY';
  end if;

  insert into public.beluer_category_approvals (
    beluer_profile_id, category, status, approved_by, approved_at
  ) values (
    p_beluer_profile_id,
    p_category,
    p_status,
    case when p_status = 'approved' then p_approved_by else null end,
    case when p_status = 'approved' then now() else null end
  )
  on conflict (beluer_profile_id, category)
  do update set
    status = excluded.status,
    approved_by = excluded.approved_by,
    approved_at = excluded.approved_at,
    updated_at = now();

  if p_status <> 'approved' then
    update public.beluer_service_skills skill
    set status = 'inactive'
    from public.services service
    where skill.service_id = service.id
      and skill.beluer_profile_id = p_beluer_profile_id
      and skill.status = 'active'
      and service.category = p_category
      and exists (
        select 1 from public.service_pricing_rules rule
        where rule.service_id = service.id
      );
  end if;
end;
$$;

revoke all on function public.set_beluer_category_approval(
  uuid, text, public.beluer_category_approval_status, uuid
) from public, anon, authenticated;
grant execute on function public.set_beluer_category_approval(
  uuid, text, public.beluer_category_approval_status, uuid
) to service_role;

create or replace function public.is_publicly_visible_beluer_service_skill(
  p_skill_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.beluer_service_skills skill
    join public.beluer_profiles bp on bp.id = skill.beluer_profile_id
    join public.services service on service.id = skill.service_id
    where skill.id = p_skill_id
      and skill.status = 'active'
      and bp.status = 'approved'
      and (
        not exists (
          select 1 from public.service_pricing_rules rule
          where rule.service_id = service.id
        )
        or (
          service.status = 'active'
          and exists (
            select 1
            from public.beluer_category_approvals approval
            where approval.beluer_profile_id = bp.id
              and approval.category = service.category
              and approval.status = 'approved'
          )
        )
      )
  );
$$;

revoke all on function public.is_publicly_visible_beluer_service_skill(uuid)
  from public;
grant execute on function public.is_publicly_visible_beluer_service_skill(uuid)
  to anon, authenticated;

create or replace function public.claim_integration_outbox_events(
  p_limit integer,
  p_worker_id text
)
returns table (
  result_code text,
  id uuid,
  event_type text,
  aggregate_type text,
  aggregate_id uuid,
  payload jsonb,
  attempts integer,
  available_at timestamptz
)
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_now timestamptz := pg_catalog.clock_timestamp();
begin
  if p_limit is null or p_limit < 1 or p_limit > 100
    or p_worker_id is null or length(btrim(p_worker_id)) = 0
    or length(btrim(p_worker_id)) > 128 then
    result_code := 'INVALID_REQUEST';
    id := null;
    event_type := null;
    aggregate_type := null;
    aggregate_id := null;
    payload := null;
    attempts := null;
    available_at := null;
    return next;
    return;
  end if;

  -- Exhausted stale leases become terminal failures instead of remaining locked forever.
  update public.integration_outbox o
  set status = 'failed', locked_at = null, locked_by = null,
      last_error_safe = 'WORKER_LEASE_EXPIRED', available_at = v_now
  where o.status = 'processing'
    and o.attempts >= 5
    and (o.locked_at is null or o.locked_at <= v_now - interval '5 minutes');

  return query
  with eligible as (
    select o.id
    from public.integration_outbox o
    where o.attempts < 5
      and (
        (o.status in ('pending', 'failed') and o.available_at <= v_now)
        or (o.status = 'processing'
          and (o.locked_at is null or o.locked_at <= v_now - interval '5 minutes'))
      )
    order by o.available_at asc, o.created_at asc, o.id asc
    for update of o skip locked
    limit p_limit
  ), claimed as (
    update public.integration_outbox o
    set status = 'processing', attempts = o.attempts + 1,
        locked_at = v_now, locked_by = btrim(p_worker_id),
        last_error_safe = null
    from eligible e
    where o.id = e.id
    returning o.id, o.event_type, o.aggregate_type, o.aggregate_id,
      o.payload, o.attempts, o.available_at
  )
  select 'OK'::text, c.id, c.event_type, c.aggregate_type, c.aggregate_id,
    c.payload, c.attempts, c.available_at
  from claimed c;
end;
$$;

create or replace function public.mark_integration_outbox_processed(
  p_event_id uuid,
  p_worker_id text
)
returns table (result_code text)
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_event public.integration_outbox%rowtype;
begin
  if p_event_id is null or p_worker_id is null
    or length(btrim(p_worker_id)) = 0 or length(btrim(p_worker_id)) > 128 then
    return query select 'INVALID_REQUEST'::text;
    return;
  end if;

  select * into v_event from public.integration_outbox where integration_outbox.id = p_event_id for update;
  if not found then
    return query select 'EVENT_NOT_FOUND'::text;
  elsif v_event.status = 'processed' then
    return query select 'ALREADY_PROCESSED'::text;
  elsif v_event.status <> 'processing' then
    return query select 'EVENT_NOT_PROCESSING'::text;
  elsif v_event.locked_by is distinct from btrim(p_worker_id) then
    return query select 'WORKER_MISMATCH'::text;
  else
    update public.integration_outbox
    set status = 'processed', processed_at = pg_catalog.clock_timestamp(),
        locked_at = null, locked_by = null, last_error_safe = null
    where integration_outbox.id = p_event_id;
    return query select 'OK'::text;
  end if;
end;
$$;

create or replace function public.mark_integration_outbox_failed(
  p_event_id uuid,
  p_worker_id text,
  p_safe_error text
)
returns table (result_code text)
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_event public.integration_outbox%rowtype;
  v_safe_error text;
  v_next_available_at timestamptz;
begin
  if p_event_id is null or p_worker_id is null
    or length(btrim(p_worker_id)) = 0 or length(btrim(p_worker_id)) > 128
    or p_safe_error is null or p_safe_error not in (
      'DELIVERY_TIMEOUT', 'DELIVERY_REJECTED', 'INVALID_RESPONSE',
      'PROCESSING_FAILED', 'WORKER_LEASE_EXPIRED'
    ) then
    return query select 'INVALID_REQUEST'::text;
    return;
  end if;

  select * into v_event from public.integration_outbox where integration_outbox.id = p_event_id for update;
  if not found then
    return query select 'EVENT_NOT_FOUND'::text;
  elsif v_event.status <> 'processing' then
    return query select 'EVENT_NOT_PROCESSING'::text;
  elsif v_event.locked_by is distinct from btrim(p_worker_id) then
    return query select 'WORKER_MISMATCH'::text;
  else
    v_safe_error := p_safe_error;
    v_next_available_at := case v_event.attempts
      when 1 then pg_catalog.clock_timestamp() + interval '1 minute'
      when 2 then pg_catalog.clock_timestamp() + interval '5 minutes'
      when 3 then pg_catalog.clock_timestamp() + interval '15 minutes'
      when 4 then pg_catalog.clock_timestamp() + interval '1 hour'
      else pg_catalog.clock_timestamp()
    end;
    update public.integration_outbox
    set status = 'failed', locked_at = null, locked_by = null,
        last_error_safe = v_safe_error, available_at = v_next_available_at
    where integration_outbox.id = p_event_id;
    if v_event.attempts >= 5 then
      return query select 'MAX_ATTEMPTS_REACHED'::text;
    else
      return query select 'OK'::text;
    end if;
  end if;
end;
$$;

revoke all on function public.claim_integration_outbox_events(integer, text)
  from public, anon, authenticated;
grant execute on function public.claim_integration_outbox_events(integer, text)
  to service_role;
revoke all on function public.mark_integration_outbox_processed(uuid, text)
  from public, anon, authenticated;
grant execute on function public.mark_integration_outbox_processed(uuid, text)
  to service_role;
revoke all on function public.mark_integration_outbox_failed(uuid, text, text)
  from public, anon, authenticated;
grant execute on function public.mark_integration_outbox_failed(uuid, text, text)
  to service_role;
