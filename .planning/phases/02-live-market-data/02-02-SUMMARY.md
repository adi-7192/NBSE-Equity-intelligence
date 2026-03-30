---
phase: 02-live-market-data
plan: 02
subsystem: live-market-ui
tags: [dashboard, admin, watchlist, sse, live-market]
requires:
  - phase: 02-live-market-data
    provides: Relay scaffolding, authenticated market routes, and shared watchlist persistence
provides:
  - Live market header with explicit disconnected/closed/stale states
  - Shared live watchlist surface inside the dashboard
  - Admin-managed shared watchlist controls inside the app
affects: [dashboard, admin, app-routes, phase-02]
tech-stack:
  added: []
  patterns: [live-market-layer-plus-weekly-intelligence-layer, snapshot-and-sse-client-state, admin-triggered-relay-sync]
key-files:
  created:
    [
      components/live-market-status.tsx,
      components/live-watchlist.tsx,
    ]
  modified:
    [
      app/page.tsx,
      app/admin/page.tsx,
      components/dashboard-client.tsx,
      components/market-header.tsx,
      components/update-button.tsx,
    ]
key-decisions:
  - "Kept the existing dashboard shell but split the top of the page into an explicit live-market layer and left the lower content as weekly intelligence."
  - "Removed silent live-market fallback to sample dashboard data and replaced it with a typed disconnected fallback snapshot."
  - "Made admin watchlist entries relay-ready by requiring exchange, symbol, display name, and instrument token."
  - "Used best-effort relay sync after admin mutations and surfaced 'sync pending' honestly when the relay is not running."
patterns-established:
  - "Server-rendered first snapshot plus client-side EventSource updates during open sessions."
  - "Slow snapshot refresh when the market is closed instead of pretending a stream is still live."
  - "Watchlist management lives inside `/admin` and reuses the existing Better Auth admin boundary."
requirements-completed: []
duration: 45min
completed: 2026-03-30
---

# Phase 2: Live Market Data Summary

**The dashboard now has a real live-market layer, shared watchlist management, and explicit trust states on top of the new relay foundation**

## Performance

- **Duration:** 45 min
- **Completed:** 2026-03-30
- **Tasks:** 3
- **Files modified:** 7

## Accomplishments

- Reworked the home page to load an initial market snapshot from the new live-market foundation instead of using the old sample market header data as the authoritative source.
- Updated the header to show the locked Phase 2 benchmark set and explicit status messaging for disconnected, delayed, closed, and live states.
- Split the product framing more clearly: the top of the page is now live market data, while the lower tabs remain the weekly intelligence layer.
- Replaced the old weekly `Watch Next Week` surface on the dashboard with a shared live watchlist panel.
- Extended `/admin` so the admin can add and remove relay-ready shared watchlist entries from inside the app.
- Added best-effort relay resync on admin watchlist mutations and surfaced pending-sync messaging when the relay is not running.

## Files Created/Modified

- `app/page.tsx` - Loads the initial live-market snapshot and passes it to the dashboard.
- `components/dashboard-client.tsx` - Owns the snapshot/SSE client state and switches the watch tab to the live watchlist.
- `components/market-header.tsx` - Renders the four benchmark live header plus explicit market/freshness state.
- `components/live-market-status.tsx` - Visual trust layer for live, delayed, stale, closed, and disconnected states.
- `components/live-watchlist.tsx` - Shared tracked-instrument watchlist surface.
- `components/update-button.tsx` - Relabeled the weekly update action so it no longer looks like a live-price refresh button.
- `app/admin/page.tsx` - Adds shared watchlist management and relay-sync messaging.

## Decisions Made

- Kept the weekly alert/macro/picks tabs intact so Phase 2 remains a live-market layer on top of the existing product rather than a full dashboard rewrite.
- Chose explicit disconnected-state rendering instead of quietly substituting old sample market numbers.
- Allowed watchlist saves to succeed even when the relay is down, because Postgres remains the source of truth and the next authenticated market request can resync subscriptions.

## Issues Encountered

- Real browser smoke exposed a missing-table runtime failure because the new `shared_watchlist_items` migration had not yet been applied to Supabase; applying `drizzle-kit push` fixed that.
- The live watchlist mutation smoke correctly reported `relay sync is pending` because the relay was not left running during the browser test. That is expected and preferable to pretending the feed is live.

## Verification

- `npm run lint`
- `npx tsc --noEmit`
- `npx drizzle-kit generate`
- Relay startup smoke on `http://localhost:4001`
- Browser smoke:
  - admin login succeeds
  - dashboard renders the new live/disconnected header
  - `/admin` renders shared watchlist controls
  - add/remove tracked symbol works and surfaces pending relay sync honestly

## User Setup Required

Real live-data validation still requires operational setup:

- Run the relay with `LIVE_RELAY_*`, `KITE_API_KEY`, `KITE_ACCESS_TOKEN`, and the benchmark token env vars configured.
- Refresh `KITE_ACCESS_TOKEN` before market open.
- Keep the relay running while testing the dashboard during market hours.

## Next Phase Readiness

Phase 2 implementation is in place, but one validation gap remains: the dashboard still needs a real market-hours test with the relay running and valid Kite credentials so `LIVE-01`, `LIVE-02`, and `LIVE-03` can be confirmed on real data. After that, the next logical milestone move is Phase 3.

---
*Phase: 02-live-market-data*
*Completed: 2026-03-30*
