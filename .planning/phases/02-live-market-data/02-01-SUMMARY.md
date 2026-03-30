---
phase: 02-live-market-data
plan: 01
subsystem: live-market-foundation
tags: [kiteconnect, relay, sse, market-data, shared-watchlist]
requires:
  - phase: 01-foundation-access
    provides: Authenticated app boundary and durable Postgres persistence
provides:
  - Separate always-on relay scaffold for Kite market data
  - Authenticated app-facing market snapshot and SSE routes
  - Dedicated shared watchlist persistence for the Phase 2 starter list
affects: [dashboard, admin, api, relay, phase-02]
tech-stack:
  added: [kiteconnect]
  patterns: [snapshot-plus-sse, relay-side latest-state cache, shared-watchlist-items table]
key-files:
  created:
    [
      lib/db/queries/shared-watchlist.ts,
      lib/live-market/contracts.ts,
      lib/live-market/instruments.ts,
      lib/live-market/relay-client.ts,
      app/api/market/snapshot/route.ts,
      app/api/market/stream/route.ts,
      relay/package.json,
      relay/tsconfig.json,
      relay/src/store.ts,
      relay/src/kite.ts,
      relay/src/index.ts,
      relay/README.md,
      drizzle/0001_warm_mercury.sql,
    ]
  modified:
    [
      package.json,
      package-lock.json,
      .env.example,
      lib/db/schema.ts,
    ]
key-decisions:
  - "Kept the live-feed architecture as a separate Node relay instead of forcing Kite into Vercel serverless."
  - "Used a dedicated `shared_watchlist_items` table instead of overloading the existing per-user watchlist schema."
  - "Defined the app contract as snapshot for first paint/recovery plus SSE for near-live updates."
  - "Made the app routes resync relay subscriptions from Postgres so a relay restart does not leave the feed set stale."
patterns-established:
  - "Relay endpoints stay narrow: health, snapshot, events, and subscription sync."
  - "Authenticated app routes remain the product boundary even though the relay owns the upstream broker connection."
  - "Disconnected live states use an explicit typed fallback snapshot rather than silent sample market data."
requirements-completed: []
duration: 45min
completed: 2026-03-30
---

# Phase 2: Live Market Data Summary

**Relay, shared-watchlist persistence, and authenticated market routes now exist as the foundation for the live dashboard**

## Performance

- **Duration:** 45 min
- **Completed:** 2026-03-30
- **Tasks:** 3
- **Files modified:** 16

## Accomplishments

- Added the `kiteconnect` dependency, relay environment scaffolding, and root helper scripts for the standalone live-market service.
- Created a dedicated `shared_watchlist_items` schema and query layer for the admin-managed starter list.
- Added `lib/live-market/*` contracts, benchmark metadata, disconnected fallback snapshot generation, and authenticated relay client helpers.
- Added authenticated `GET /api/market/snapshot` and `GET /api/market/stream` routes that keep the relay subscription set synced from Postgres.
- Built the standalone relay service with health, snapshot, SSE events, and subscription sync endpoints.
- Generated the next Drizzle migration for the shared watchlist table.

## Files Created/Modified

- `lib/db/schema.ts` - Added the `shared_watchlist_items` table with relay-ready fields and indexes.
- `lib/db/queries/shared-watchlist.ts` - Shared watchlist CRUD and ordering helpers.
- `lib/live-market/contracts.ts` - Typed snapshot/SSE contracts, market-status metadata, and shared validation schemas.
- `lib/live-market/instruments.ts` - Four benchmark definitions, env-backed token resolution, and disconnected fallback snapshot builder.
- `lib/live-market/relay-client.ts` - Authenticated server-side relay fetch and subscription-sync helpers.
- `app/api/market/snapshot/route.ts` - Authenticated JSON market snapshot route.
- `app/api/market/stream/route.ts` - Authenticated SSE market stream route.
- `relay/src/index.ts` - Relay HTTP surface and SSE fan-out.
- `relay/src/kite.ts` - KiteTicker lifecycle and subscription management.
- `relay/src/store.ts` - In-memory latest-state cache and event publishing.
- `relay/README.md` - Relay runtime instructions and token-refresh notes.
- `drizzle/0001_warm_mercury.sql` - Migration for `shared_watchlist_items`.

## Decisions Made

- Deferred Redis/Upstash and kept the Phase 2 relay cache in-memory because the benchmark/watchlist scope is still small.
- Treated app-side SSE proxying as acceptable for Phase 2, but not as the final forever architecture.
- Required explicit disconnected fallback snapshots so the live-market surface does not silently reuse old sample dashboard data.
- Added relay subscription sync to the app boundary so shared-watchlist changes and relay restarts converge on the same tracked instrument set.

## Issues Encountered

- Relay startup smoke could not be verified inside the default sandbox because `tsx` IPC pipe binding was blocked there; running it once outside the sandbox confirmed the relay boots and listens correctly.

## User Setup Required

External live-market setup is still required before the relay can deliver real data:

- Set `LIVE_RELAY_URL`, `LIVE_RELAY_SECRET`, `LIVE_RELAY_PORT`, `KITE_API_KEY`, `KITE_ACCESS_TOKEN`, and the four benchmark token env vars.
- Refresh `KITE_ACCESS_TOKEN` operationally before market open.
- Run the new Drizzle migration against the target database.

## Next Phase Readiness

The Phase 2 foundation is now in place: the relay exists, the app has authenticated market routes, and the shared starter watchlist has a durable model. The next step is `02-02`, which can now focus on turning the current weekly shell into a trustworthy live market surface instead of inventing the plumbing first.

---
*Phase: 02-live-market-data*
*Completed: 2026-03-30*
