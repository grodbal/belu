-- B4.3A: database integrity and safe visibility for the new Beluer offer model.
-- Local migration only. Review and apply to Supabase separately.

begin;

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
  -- Skills without a pricing rule are legacy assignments and retain their
  -- existing semantics, including active rows whose beluer_price is NULL.
  select s.category
  into service_category
  from public.services s
  where s.id = new.service_id;

  if not found then
    return new;
  end if;

  -- Inactive rows are allowed to retain any valid saved price and deliberately
  -- do not depend on current approvals or minimums.
  if new.status <> 'active' then
    return new;
  end if;

  -- Detect the new catalog before applying its stricter checks. Legacy active
  -- assignments still pass with a NULL beluer_price.
  if not exists (
    select 1 from public.service_pricing_rules rule
    where rule.service_id = new.service_id
  ) then
    return new;
  end if;

  -- Lock the approval first, matching the category-revocation transaction's
  -- lock order and preventing an offer from racing a revocation.
  select a.status
    into approval_status
  from public.beluer_category_approvals a
  where a.beluer_profile_id = new.beluer_profile_id
    and a.category = service_category
  for share;

  if approval_status is distinct from 'approved' then
    raise exception using
      errcode = '23514',
      message = 'ACTIVE_OFFER_REQUIRES_APPROVED_CATEGORY';
  end if;

  select bp.status
    into beluer_status
  from public.beluer_profiles bp
  where bp.id = new.beluer_profile_id
  for share;

  if beluer_status is distinct from 'approved' then
    raise exception using
      errcode = '23514',
      message = 'ACTIVE_OFFER_REQUIRES_APPROVED_BELUER';
  end if;

  select s.category, s.status
    into locked_service_category, service_status
  from public.services s
  where s.id = new.service_id
  for share of s;

  if not found or locked_service_category is distinct from service_category then
    raise exception using
      errcode = '23514',
      message = 'ACTIVE_OFFER_SERVICE_CHANGED_RETRY';
  end if;

  if service_status is distinct from 'active' then
    raise exception using
      errcode = '23514',
      message = 'ACTIVE_OFFER_REQUIRES_SERVICE_ACTIVE';
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
    raise exception using
      errcode = '23514',
      message = 'ACTIVE_OFFER_REQUIRES_PRICE';
  end if;

  if new.beluer_price < minimum_price then
    raise exception using
      errcode = '23514',
      message = 'ACTIVE_OFFER_PRICE_BELOW_MINIMUM';
  end if;

  return new;
end;
$$;

drop trigger if exists beluer_service_skills_offer_integrity
  on public.beluer_service_skills;
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
    select 1
    from public.beluer_service_skills skill
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

drop trigger if exists service_pricing_rules_minimum_price_guard
  on public.service_pricing_rules;
create trigger service_pricing_rules_minimum_price_guard
before update of minimum_price on public.service_pricing_rules
for each row execute function public.prevent_invalid_minimum_price_increase();

-- Keep category approval and deactivation of new-catalog offers atomic. The
-- function is callable only by service_role; the Server Action authenticates
-- the Admin and supplies the profile id recorded as approver.
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
    beluer_profile_id,
    category,
    status,
    approved_by,
    approved_at
  )
  values (
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
        select 1
        from public.service_pricing_rules rule
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

-- RLS policies cannot directly inspect rules/approvals for other Beluers,
-- because those tables have their own restrictive policies. This predicate
-- runs with a fixed search_path and exposes only the eligibility boolean for
-- the skill row currently being evaluated.
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

-- A Beluer may read all of her own rows, including inactive offers and their
-- saved price. Admin may read every row. Public/client visibility is stricter
-- for the new catalog, while the legacy branch retains the old visibility
-- until those assignments are migrated/retired.
drop policy if exists "beluer_service_skills_select_related_or_admin"
  on public.beluer_service_skills;
drop policy if exists beluer_service_skills_select_visible_owner_or_admin
  on public.beluer_service_skills;
create policy beluer_service_skills_select_visible_owner_or_admin
on public.beluer_service_skills
for select
to anon, authenticated
using (
  public.is_admin()
  or (
    auth.role() = 'authenticated'
    and exists (
      select 1
      from public.beluer_profiles own_beluer
      where own_beluer.id = beluer_service_skills.beluer_profile_id
        and own_beluer.profile_id = public.current_profile_id()
    )
  )
  or public.is_publicly_visible_beluer_service_skill(beluer_service_skills.id)
);

-- Minimums are visible only to Admins and globally-approved Beluers whose
-- category is approved. They are not exposed to anon/client roles.
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
    from public.services service
    join public.beluer_category_approvals approval
      on approval.category = service.category
    join public.beluer_profiles bp
      on bp.id = approval.beluer_profile_id
    where service.id = service_pricing_rules.service_id
      and bp.profile_id = public.current_profile_id()
      and bp.status = 'approved'
      and approval.status = 'approved'
  )
);

commit;
