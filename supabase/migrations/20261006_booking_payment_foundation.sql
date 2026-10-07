alter table if exists public.bookings
  add column if not exists idempotency_key uuid;

create unique index if not exists bookings_client_idempotency_key_idx
  on public.bookings(client_profile_id, idempotency_key)
  where idempotency_key is not null;
