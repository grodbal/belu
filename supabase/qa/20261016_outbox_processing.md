# B5.1F outbox QA plan

Run only against a disposable local database after applying the migration. These checks are prepared, not executed against a database.

Create disposable `integration_outbox` rows with unique `deduplication_key` values and record their IDs. Use synthetic payloads only.

The partial `integration_outbox_claim_idx` covers `pending`, `failed`, and `processing` rows using `(status, available_at, created_at, attempts)`. It replaces the earlier delivery index and omits `processed` rows, keeping the index focused on claim candidates. The claim's stale-processing branch still applies its five-minute lease predicate after narrowing to the nonterminal statuses.

## Claim and concurrency

1. Insert three due `pending` rows. Call `claim_integration_outbox_events(3, 'worker-a')`; expect those three IDs, `OK`, `processing`, attempts `1`, and `locked_by = worker-a`.
2. While the first transaction is open, call `claim_integration_outbox_events(3, 'worker-b')` from a second SQL session. It must not return worker A's locked rows. Commit session A and call again; the rows remain unavailable because they are `processing` with a fresh lease.
3. Insert more due rows than the claim limit and verify ordering by `available_at`, then `created_at`, then `id`.

## State transitions

4. Mark a claimed row processed. Expect `OK`, a timestamp, and cleared lock/error fields. Repeat the call; expect `ALREADY_PROCESSED`. Verify it is never claimed again.
5. Mark a claimed row failed as `DELIVERY_TIMEOUT`. Expect `OK`, cleared lock, safe error code only, and `available_at` in the future. It must not claim before that time, then must claim when due.
6. Set an existing `processing` row's `locked_at` to more than five minutes ago. Claim it with another worker; expect it reclaimed and attempts incremented.
7. Try success and failure acknowledgements with a different worker ID; expect `WORKER_MISMATCH` and no row change.
8. From a `failed` row with attempts `4`, once `available_at` is due, claim it; expect `processing` and attempts `5`. If that fifth attempt fails, expect `failed`, `MAX_ATTEMPTS_REACHED`, and no future automatic claim. Backoff for attempts 1–4 is 1 minute, 5 minutes, 15 minutes, and 1 hour.
9. Verify `available_at > now()` is not claimable, and invalid limit/worker or unapproved error code returns `INVALID_REQUEST`.
10. A stale `processing` row at attempts `4` can be reclaimed and becomes attempts `5`. A stale `processing` row already at attempts `5` is first changed directly to terminal `failed`, with cleared lock, `WORKER_LEASE_EXPIRED`, and `available_at = now()`; it is excluded from that claim and all later claims.

For a true concurrency check, keep session A's transaction open after its claim, then issue the competing claim from session B before committing A. `FOR UPDATE SKIP LOCKED` must prevent overlapping claims. Do not use production or remote Supabase for this plan.
