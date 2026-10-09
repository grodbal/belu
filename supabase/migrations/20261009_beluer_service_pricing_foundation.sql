-- B4.2A: additive catalog and Beluer-specific pricing foundation.
-- Local migration only; do not run against production without explicit review.
-- Legacy services and booking financial columns remain intact.

begin;

-- Explicit catalog item type. Existing services receive the legacy-safe default.
do $$ begin
  create type public.service_type as enum ('primary', 'addon');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.beluer_category_approval_status as enum ('pending', 'approved', 'rejected', 'revoked');
exception when duplicate_object then null;
end $$;

alter table public.services
  add column if not exists service_type public.service_type not null default 'primary';

-- Remote services.category is TEXT. Replace its legacy lashes/nails-only check
-- without changing any existing rows.
alter table public.services
  drop constraint if exists services_category_check;
alter table public.services
  add constraint services_category_check
  check (category in ('lashes', 'nails', 'brows'));

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
  category text not null
    constraint beluer_category_approvals_category_check check (category in ('lashes', 'nails', 'brows')),
  status public.beluer_category_approval_status not null default 'pending',
  approved_by uuid references public.profiles(id) on delete set null,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint beluer_category_approvals_beluer_category_key unique (beluer_profile_id, category)
);

alter table public.beluer_service_skills
  add column if not exists beluer_price numeric(10,2);

do $$ begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.beluer_service_skills'::regclass
      and conname = 'beluer_service_skills_beluer_price_check'
  ) then
    alter table public.beluer_service_skills
      add constraint beluer_service_skills_beluer_price_check
      check (beluer_price is null or beluer_price > 0);
  end if;
end $$;

-- Nullable snapshots preserve all historical booking rows without backfill.
alter table public.bookings
  add column if not exists service_price_snapshot numeric(10,2),
  add column if not exists service_name_snapshot text,
  add column if not exists service_category_snapshot text,
  add column if not exists service_type_snapshot public.service_type,
  add column if not exists minimum_price_snapshot numeric(10,2);

do $$ begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.bookings'::regclass
      and conname = 'bookings_service_category_snapshot_check'
  ) then
    alter table public.bookings
      add constraint bookings_service_category_snapshot_check
      check (service_category_snapshot is null or service_category_snapshot in ('lashes', 'nails', 'brows'));
  end if;
end $$;

create index if not exists beluer_category_approvals_beluer_status_idx
  on public.beluer_category_approvals(beluer_profile_id, status);
create index if not exists beluer_category_approvals_category_status_idx
  on public.beluer_category_approvals(category, status);
create index if not exists beluer_service_skills_service_status_price_idx
  on public.beluer_service_skills(service_id, status, beluer_price);

-- Updated-at function required by the new table triggers.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_service_pricing_rules_updated_at on public.service_pricing_rules;
create trigger set_service_pricing_rules_updated_at
before update on public.service_pricing_rules
for each row execute function public.set_updated_at();

drop trigger if exists set_beluer_category_approvals_updated_at on public.beluer_category_approvals;
create trigger set_beluer_category_approvals_updated_at
before update on public.beluer_category_approvals
for each row execute function public.set_updated_at();

alter table public.service_pricing_rules enable row level security;
alter table public.beluer_category_approvals enable row level security;

revoke all on table public.service_pricing_rules from anon, authenticated;
grant select on table public.service_pricing_rules to authenticated;
grant all on table public.service_pricing_rules to service_role;

drop policy if exists service_pricing_rules_select_admin_or_approved_beluer
  on public.service_pricing_rules;
create policy service_pricing_rules_select_admin_or_approved_beluer
on public.service_pricing_rules
for select
to authenticated
using (
  public.is_admin()
  or exists (
    select 1
    from public.services s
    join public.beluer_category_approvals a on a.category = s.category
    where s.id = service_pricing_rules.service_id
      and a.beluer_profile_id = public.current_beluer_profile_id()
      and a.status = 'approved'
  )
);

revoke all on table public.beluer_category_approvals from anon, authenticated;
grant select on table public.beluer_category_approvals to authenticated;
grant all on table public.beluer_category_approvals to service_role;

drop policy if exists beluer_category_approvals_select_own_or_admin
  on public.beluer_category_approvals;
create policy beluer_category_approvals_select_own_or_admin
on public.beluer_category_approvals
for select
to authenticated
using (
  public.is_admin()
  or beluer_profile_id = public.current_beluer_profile_id()
);

-- No direct authenticated writes. Server Actions must authorize writes server-side.
-- No pricing rules or category approvals are seeded/backfilled in this migration.

commit;
