# Phase 1: Foundation & Access - Context

**Gathered:** 2026-03-30
**Status:** Ready for planning

<domain>
## Phase Boundary

Replace the current in-memory dashboard/archive storage with PostgreSQL-backed persistence and protect the app for a small invited user group. This phase establishes the durable data and auth base for the existing dashboard; it does not yet implement the live Kite relay or broader market-data ingestion work that belongs to later phases.

</domain>

<decisions>
## Implementation Decisions

### Deployment topology
- **D-01:** The main Next.js application will remain Vercel-first.
- **D-02:** PostgreSQL and auth state will be backed by Supabase rather than a self-hosted database/VPS stack.
- **D-03:** The live Kite connection is assumed to run in a separate always-on service when that work lands, not inside Vercel serverless infrastructure.

### Auth scope
- **D-04:** Authentication should stay simple: email/password with invite-only access for a fixed 2-5 user group.
- **D-05:** One authenticated admin user should be able to create or invite the other approved accounts from inside the app.
- **D-06:** Phase 1 will use app-layer authorization as the required baseline; Supabase Row Level Security is deferred unless later needed as defense in depth.
- **D-07:** OAuth, enterprise SSO, and public signups are explicitly out of scope for this phase.
- **D-08:** The dashboard and data-mutating API routes must be protected in Phase 1; this is not a later hardening pass.

### Persistence scope
- **D-09:** Phase 1 must replace `lib/archive.ts` session-memory storage with durable PostgreSQL-backed persistence for live dashboard state and archived intelligence snapshots.
- **D-10:** Archive records should become immutable stored snapshots with enough metadata to support later comparison and provenance work, rather than remaining anonymous blobs in memory.
- **D-11:** The existing AI update/archive workflow should keep working through the migration so the current dashboard remains usable while the data layer is modernized.

### Foundation boundaries
- **D-12:** Phase 1 should optimize for a stable backend foundation and route protection, not for visible UI redesign.
- **D-13:** The separate Kite relay deployment is a confirmed architectural direction, but implementing that relay belongs to Phase 2.

### the agent's Discretion
- Exact Better Auth + Drizzle + Supabase integration details.
- Exact table names, schema boundaries, and migration sequencing.
- Minimal test strategy for this phase, so long as persistence and auth isolation are verified.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Product and milestone scope
- `.planning/PROJECT.md` — milestone goal, constraints, and the locked Vercel-first product direction.
- `.planning/REQUIREMENTS.md` — Phase 1 requirement IDs `DATA-01`, `DATA-02`, `AUTH-01`, and `AUTH-02`.
- `.planning/ROADMAP.md` — Phase 1 goal, success criteria, plan slots, and dependency ordering.
- `.planning/STATE.md` — current phase position and carried concerns.

### Project research
- `.planning/research/SUMMARY.md` — synthesized guidance for stack, architecture, and roadmap ordering.
- `.planning/research/STACK.md` — recommended use of PostgreSQL 16, Better Auth, Drizzle, and Vercel-first deployment.
- `.planning/research/ARCHITECTURE.md` — auth-layer recommendation and separation between Vercel app shell and live relay.
- `.planning/research/PITFALLS.md` — pitfalls around auth leakage, archive integrity, and Vercel/Kite separation.

### Existing code and brownfield constraints
- `.planning/codebase/CONCERNS.md` — current persistence, auth, and data-integrity risks this phase must address.
- `.planning/codebase/STRUCTURE.md` — current file layout and likely integration points for auth/data changes.
- `lib/archive.ts` — current in-memory storage API that will be replaced or adapted.
- `app/api/update-data/route.ts` — current live-data update and archiving path that must survive the migration.
- `app/api/archives/route.ts` — current archive retrieval contract.
- `app/page.tsx` — current live-vs-default dashboard loading behavior.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `lib/archive.ts`: Existing persistence interface that can be preserved as an abstraction while swapping the implementation underneath.
- `app/api/update-data/route.ts`: Central orchestration point for archiving current state and saving refreshed intelligence.
- `app/api/archives/route.ts`: Existing route contract for listing and retrieving archived snapshots.
- `app/page.tsx`: Current server-side data load path that should continue to resolve live data with default fallback behavior.
- `lib/data.ts`: Existing domain defaults and market-data shape that can seed or validate persisted records during migration.

### Established Patterns
- Next.js App Router route handlers are the existing backend pattern.
- Zod schemas are already used for runtime validation in the update pipeline.
- The app already centralizes data access through small utility modules rather than embedding data logic directly into components.
- Path aliases via `@/*` are used consistently across the repo.

### Integration Points
- The current `lib/archive.ts` callers are the first compatibility layer to preserve while moving storage into PostgreSQL.
- Auth will need to protect dashboard routes and `app/api/*` write surfaces without breaking the current server-rendered home page.
- The archive and update routes should gain durable persistence before any later phases start reading from the database for screeners or portfolios.

</code_context>

<specifics>
## Specific Ideas

- Keep the existing dashboard UX largely intact during Phase 1; this is infrastructure-first work.
- Use Supabase for the database/auth backing while keeping the main web app deployed on Vercel.
- Use an admin-managed invite/account flow rather than a public or self-serve signup model.
- Treat the separate always-on Kite relay as an established future integration boundary, but do not fold that implementation into this phase.

</specifics>

<deferred>
## Deferred Ideas

- Implementing the dedicated Kite relay service — belongs to Phase 2.
- Fundamentals ETL source selection and parser hardening — belongs to Phase 3.
- News, macro, and alert-ranking pipelines — belong to later phases.

</deferred>

---

*Phase: 01-foundation-access*
*Context gathered: 2026-03-30*
