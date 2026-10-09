-- B4.2B: insert the approved BELU master catalog and canonical minimum prices.
-- This migration preserves the legacy catalog and uses compatibility-only
-- services.public_price/base_price values approved for the transition.

begin;

create temporary table _belu_b42b_catalog_seed (
  id uuid primary key,
  category text not null check (category in ('lashes', 'nails', 'brows')),
  service_type public.service_type not null,
  name text not null unique,
  minimum_price numeric(10,2) not null check (minimum_price > 0),
  duration_minutes integer not null check (duration_minutes > 0)
) on commit drop;

insert into _belu_b42b_catalog_seed (
  id, category, service_type, name, minimum_price, duration_minutes
)
values
  ('2752237b-ec40-463d-8f1f-8fc8e11f30ed', 'lashes', 'primary'::public.service_type, 'Clásicas', 80.00, 120),
  ('ffd83fb0-7f3d-4375-b322-0725e08215f2', 'lashes', 'primary'::public.service_type, 'Rímel', 90.00, 120),
  ('d7f63eb1-b6b3-4969-8a4c-6dc8baf4eea2', 'lashes', 'primary'::public.service_type, 'Volumen 3D', 110.00, 135),
  ('80a7065a-66ab-4811-bcac-4c942eea7cd0', 'lashes', 'primary'::public.service_type, 'Volumen 4D', 130.00, 150),
  ('57325932-16b8-4537-ac62-52bfe302b556', 'lashes', 'primary'::public.service_type, 'Mega volumen', 150.00, 165),
  ('d2423c3b-0bef-41f7-9cb2-91c6c9c0c19a', 'lashes', 'primary'::public.service_type, 'Efecto Whispy', 130.00, 135),
  ('fde82ae3-3ff5-4ec5-8e9e-76990858bf12', 'lashes', 'primary'::public.service_type, 'Efecto Aura', 100.00, 135),
  ('60b6f1e9-0c65-4219-872d-5c888eaa96ba', 'lashes', 'primary'::public.service_type, 'Lifting de pestañas', 70.00, 75),
  ('aaf34c85-b708-4dee-ac9b-060703e73ea2', 'lashes', 'addon'::public.service_type, 'Retiro de extensiones', 20.00, 30),
  ('6a1a7bfa-fe56-48bc-b8f4-a5fe7195e8ae', 'brows', 'primary'::public.service_type, 'Planchado de cejas', 55.00, 60),
  ('0d2a5d07-6806-47bb-938e-6472b2b45d67', 'brows', 'primary'::public.service_type, 'Depilación de cejas con cera', 20.00, 20),
  ('5f850e7f-45a9-42d4-859c-227f2fc010ea', 'brows', 'primary'::public.service_type, 'Depilación con hilo', 20.00, 20),
  ('6aa3c36c-9a3d-4483-8541-aa7bce9a19fd', 'brows', 'primary'::public.service_type, 'Depilación con navaja', 15.00, 15),
  ('dd16ac22-7fe9-4d97-bbf6-588098ba06ae', 'nails', 'primary'::public.service_type, 'Esmaltado gel', 60.00, 75),
  ('b45271df-8677-4e91-85ef-7f30036e7229', 'nails', 'primary'::public.service_type, 'Rubber', 70.00, 90),
  ('3f68a4b1-c452-4ef9-8c76-35ad83768804', 'nails', 'primary'::public.service_type, 'Gel de construcción / Builder gel', 80.00, 105),
  ('6cb4109f-82c0-406d-a7a4-d7e8816fc5f2', 'nails', 'primary'::public.service_type, 'Acrílicas', 100.00, 120),
  ('3343bb11-874f-4472-afcf-0a378aca2026', 'nails', 'primary'::public.service_type, 'Polygel', 100.00, 120),
  ('522ebac4-aa12-4be1-a628-f9f7f0a22a1e', 'nails', 'primary'::public.service_type, 'Softgel', 90.00, 90),
  ('f681fe3e-70d4-4d13-83c1-30b128458b72', 'nails', 'primary'::public.service_type, 'Manicura tradicional', 50.00, 60),
  ('e6931a0a-1373-45a8-b131-f679ea3035fc', 'nails', 'primary'::public.service_type, 'Pedicura tradicional', 50.00, 60),
  ('8f7cd42f-cb6a-4c44-80f4-c6728ccffde0', 'nails', 'primary'::public.service_type, 'Pedicura gel', 60.00, 60),
  ('813e128f-3d21-43f2-8af9-61ac574b26fe', 'nails', 'primary'::public.service_type, 'Acripie', 100.00, 90),
  ('9394045e-6f33-4d4f-92d9-884a8032b858', 'nails', 'addon'::public.service_type, 'Retiro gel', 15.00, 15),
  ('5303b856-e863-4ee5-9608-6ae6ef80a0d7', 'nails', 'addon'::public.service_type, 'Retiro Rubber / gel de construcción', 20.00, 25),
  ('aa6ab94b-2491-490f-b70e-8be07b37b1cd', 'nails', 'addon'::public.service_type, 'Retiro acrílico / polygel', 25.00, 30);

-- Validate seed cardinality and protect legacy rows before inserting anything.
do $$
declare
  catalog_count integer;
  primary_count integer;
  addon_count integer;
  lashes_count integer;
  brows_count integer;
  nails_count integer;
  collisions text;
begin
  select count(*) into catalog_count from pg_temp._belu_b42b_catalog_seed;
  select count(*) into primary_count from pg_temp._belu_b42b_catalog_seed where service_type = 'primary';
  select count(*) into addon_count from pg_temp._belu_b42b_catalog_seed where service_type = 'addon';
  select count(*) into lashes_count from pg_temp._belu_b42b_catalog_seed where category = 'lashes';
  select count(*) into brows_count from pg_temp._belu_b42b_catalog_seed where category = 'brows';
  select count(*) into nails_count from pg_temp._belu_b42b_catalog_seed where category = 'nails';

  if catalog_count <> 26 or primary_count <> 22 or addon_count <> 4
     or lashes_count <> 9 or brows_count <> 4 or nails_count <> 13 then
    raise exception 'Unexpected B4.2B catalog counts: total %, primary %, addon %, lashes %, brows %, nails %',
      catalog_count, primary_count, addon_count, lashes_count, brows_count, nails_count;
  end if;

  select string_agg(seed.name, ', ' order by seed.name)
    into collisions
  from pg_temp._belu_b42b_catalog_seed seed
  join public.services existing on existing.name = seed.name
  where existing.id <> seed.id;
  if collisions is not null then
    raise exception 'B4.2B service name collision with existing IDs: %', collisions;
  end if;

  select string_agg(seed.name, ', ' order by seed.name)
    into collisions
  from pg_temp._belu_b42b_catalog_seed seed
  join public.services existing on existing.id = seed.id
  where existing.name is distinct from seed.name
     or existing.category is distinct from seed.category
     or existing.service_type is distinct from seed.service_type
     or existing.duration_minutes is distinct from seed.duration_minutes
     or existing.public_price is distinct from (seed.minimum_price + 10)
     or existing.base_price is distinct from seed.minimum_price
     or existing.logistic_fee is distinct from 10::numeric
     or existing.status::text is distinct from 'active';
  if collisions is not null then
    raise exception 'B4.2B UUID already belongs to a different service or values: %', collisions;
  end if;

  select string_agg(seed.name, ', ' order by seed.name)
    into collisions
  from pg_temp._belu_b42b_catalog_seed seed
  join public.service_pricing_rules rule on rule.service_id = seed.id
  where rule.minimum_price is distinct from seed.minimum_price;
  if collisions is not null then
    raise exception 'B4.2B UUID already has a different minimum price rule: %', collisions;
  end if;
end;
$$;

-- Conflict handling is limited to the stable UUID. A name conflict on another
-- ID is rejected by the preflight above and is never updated or reused.
do $$
declare
  catalog_row record;
begin
  for catalog_row in
    select * from pg_temp._belu_b42b_catalog_seed order by id
  loop
    insert into public.services (
      id,
      category,
      service_type,
      name,
      public_price,
      logistic_fee,
      duration_minutes,
      status
    )
    values (
      catalog_row.id,
      catalog_row.category,
      catalog_row.service_type,
      catalog_row.name,
      catalog_row.minimum_price + 10,
      10,
      catalog_row.duration_minutes,
      'active'
    )
    on conflict (id) do nothing;
  end loop;
end;
$$;

insert into public.service_pricing_rules (service_id, minimum_price)
select seed.id, seed.minimum_price
from pg_temp._belu_b42b_catalog_seed seed
on conflict (service_id) do nothing;

-- Verify the exact expected rows and canonical minimums before committing.
do $$
declare
  service_count integer;
  rule_count integer;
  mismatched_services text;
  mismatched_rules text;
begin
  select count(*) into service_count
  from public.services service
  join pg_temp._belu_b42b_catalog_seed seed on seed.id = service.id;
  select count(*) into rule_count
  from public.service_pricing_rules rule
  join pg_temp._belu_b42b_catalog_seed seed on seed.id = rule.service_id;

  if service_count <> 26 then
    raise exception 'B4.2B expected 26 catalog services for stable IDs, found %', service_count;
  end if;
  if rule_count <> 26 then
    raise exception 'B4.2B expected 26 minimum-price rules, found %', rule_count;
  end if;

  select string_agg(seed.name, ', ' order by seed.name)
    into mismatched_services
  from pg_temp._belu_b42b_catalog_seed seed
  left join public.services service on service.id = seed.id
  where service.id is null
     or service.name is distinct from seed.name
     or service.category is distinct from seed.category
     or service.service_type is distinct from seed.service_type
     or service.duration_minutes is distinct from seed.duration_minutes
     or service.public_price is distinct from (seed.minimum_price + 10)
     or service.base_price is distinct from seed.minimum_price
     or service.logistic_fee is distinct from 10::numeric
     or service.status::text is distinct from 'active';
  if mismatched_services is not null then
    raise exception 'B4.2B service verification failed: %', mismatched_services;
  end if;

  select string_agg(seed.name, ', ' order by seed.name)
    into mismatched_rules
  from pg_temp._belu_b42b_catalog_seed seed
  left join public.service_pricing_rules rule on rule.service_id = seed.id
  where rule.service_id is null
     or rule.minimum_price is distinct from seed.minimum_price;
  if mismatched_rules is not null then
    raise exception 'B4.2B pricing-rule verification failed: %', mismatched_rules;
  end if;
end;
$$;

commit;
