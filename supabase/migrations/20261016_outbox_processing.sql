begin;

alter table public.integration_outbox
  add column locked_at timestamptz,
  add column locked_by text,
  add column last_error_safe text,
  add constraint integration_outbox_locked_by_check
    check (locked_by is null or length(btrim(locked_by)) between 1 and 128),
  add constraint integration_outbox_last_error_safe_check
    check (last_error_safe is null or length(last_error_safe) <= 128),
  add constraint integration_outbox_lock_pair_check
    check ((locked_at is null) = (locked_by is null));

-- Replaces the older delivery index; processed rows stay out of this partial index.
drop index if exists public.integration_outbox_delivery_idx;
create index integration_outbox_claim_idx
  on public.integration_outbox (status, available_at, created_at, attempts)
  where status in ('pending', 'failed', 'processing');

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

commit;
