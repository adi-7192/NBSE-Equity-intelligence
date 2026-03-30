# Phase 2: Live Market Data - Context

**Gathered:** 2026-03-30
**Status:** Ready for planning

<domain>
## Phase Boundary

Introduce real-time market data delivery for the market overview and watchlist experience. This phase covers the live price relay, a shared starter watchlist, and the first market overview surface. It does not yet implement portfolio live-tracking, per-user watchlist CRUD, fundamentals ingestion, or broader stock-research workflows.

</domain>

<decisions>
## Implementation Decisions

### Live delivery model
- **D-01:** Phase 2 should target near-live updates every few seconds during market hours, not tick-perfect HFT-style rendering.
- **D-02:** Outside market hours, the UI should clearly switch into a frozen "market closed" state rather than pretending the stream is still live.
- **D-03:** The live Kite connection remains a separate always-on relay outside Vercel serverless infrastructure.

### Watchlist scope
- **D-04:** Phase 2 should not include portfolio-held names or live portfolio tracking; that remains in Phase 5.
- **D-05:** The first live watchlist should be a single shared starter watchlist, not user-specific watchlists.
- **D-06:** That shared starter watchlist should be editable only by the admin from inside the app.
- **D-07:** Full per-user watchlist management is explicitly deferred beyond this phase.

### Market overview scope
- **D-08:** The market overview in Phase 2 should be limited to four benchmark indices only: Nifty 50, Sensex, Nifty Bank, and Midcap 150.
- **D-09:** Sector proxies, India VIX, and broader market breadth signals are out of scope for this phase.

### Experience boundaries
- **D-10:** Phase 2 should prioritize reliable live data plumbing and a usable overview/watchlist surface over a broad UI redesign.
- **D-11:** Existing dashboard patterns can be reused so long as live-state freshness and market-hours status are clearly visible.

### the agent's Discretion
- Exact relay deployment details and cache shape between the live process and the app.
- Exact SSE polling/heartbeat behavior and reconnection strategy.
- Exact admin watchlist editing UX, so long as it stays minimal and Phase-2-sized.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Product and milestone scope
- `.planning/PROJECT.md` — overall terminal vision, Vercel-first constraint, and live-market-data direction.
- `.planning/REQUIREMENTS.md` — Phase 2 requirement IDs `LIVE-01`, `LIVE-02`, and `LIVE-03`.
- `.planning/ROADMAP.md` — Phase 2 goal, success criteria, and plan slots.
- `.planning/STATE.md` — current project position and carried architectural concerns.

### Project research
- `.planning/research/SUMMARY.md` — synthesized roadmap rationale and architecture priorities.
- `.planning/research/ARCHITECTURE.md` — Kite relay, SSE, cache, and deployment guidance.
- `.planning/research/STACK.md` — recommended runtime technologies for live data and caching.
- `.planning/research/PITFALLS.md` — known traps around Vercel, Kite, stale data, and user-data boundaries.

### Existing implementation context
- `.planning/phases/01-foundation-access/01-CONTEXT.md` — established Vercel + Supabase + separate-relay direction.
- `.planning/phases/01-foundation-access/01-02-SUMMARY.md` — auth, admin, and user-scope foundation that Phase 2 builds on.
- `app/page.tsx` — current dashboard entry point and server-side session gate.
- `components/dashboard-client.tsx` — current dashboard shell and section structure.
- `components/market-header.tsx` — current top-level market summary/header surface.
- `app/admin/page.tsx` — existing admin-only surface that can host minimal shared-watchlist management.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `components/market-header.tsx`: existing market overview/header surface that can be upgraded from static data to live values.
- `components/dashboard-client.tsx`: current dashboard shell with tab structure that can absorb a live watchlist/overview without a full rewrite.
- `app/admin/page.tsx`: existing admin-only page that can host minimal watchlist editing controls for the shared starter list.
- `lib/db/schema.ts`: already contains starter watchlist tables and durable persistence primitives.
- `lib/auth.ts` and `middleware.ts`: already enforce session scope and admin/non-admin separation.

### Established Patterns
- Next.js App Router pages and route handlers are the existing backend/UI pattern.
- User/session checks happen server-side before protected pages render.
- Database access is routed through `lib/db/*` helpers rather than page-local persistence logic.
- The repo already distinguishes durable persisted data from default display fallbacks.

### Integration Points
- The live relay will feed the main app rather than exposing Kite directly to the browser.
- The shared starter watchlist should connect cleanly to the existing admin-only route boundary.
- The market overview and watchlist UI should layer onto the current dashboard shell rather than introducing a parallel app surface.

</code_context>

<specifics>
## Specific Ideas

- Treat this phase as the "can we make live market data reliable?" phase, not the "complete watchlist product" phase.
- Keep the watchlist intentionally small and shared so the phase can validate the relay and UI without pulling in full CRUD scope.
- Make market-hours status and freshness explicit so users can tell when data is live versus frozen.

</specifics>

<deferred>
## Deferred Ideas

- Per-user watchlist CRUD and personalization — later phase or inserted phase after Phase 2.
- Live portfolio-held names and P&L overlays — Phase 5.
- Sector proxies, India VIX, and broader breadth indicators — later market-overview expansion.
- Fundamentals-backed stock analysis and screening — Phases 3 and 4.

</deferred>

---

*Phase: 02-live-market-data*
*Context gathered: 2026-03-30*
