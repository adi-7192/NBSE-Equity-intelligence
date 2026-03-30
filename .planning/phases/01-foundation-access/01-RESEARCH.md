# Phase 1: Foundation & Access - Research

**Researched:** 2026-03-30
**Domain:** Next.js 16 app foundation with Supabase Postgres, Drizzle ORM, and Better Auth
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- The main Next.js application will remain Vercel-first.
- PostgreSQL and auth state will be backed by Supabase rather than a self-hosted database/VPS stack.
- The live Kite connection is assumed to run in a separate always-on service when that work lands, not inside Vercel serverless infrastructure.
- Authentication should stay simple: email/password with invite-only access for a fixed 2-5 user group.
- One authenticated admin user should be able to create or invite the other approved accounts from inside the app.
- Phase 1 will use app-layer authorization as the required baseline; Supabase Row Level Security is deferred unless later needed as defense in depth.
- OAuth, enterprise SSO, and public signups are explicitly out of scope for this phase.
- The dashboard and data-mutating API routes must be protected in Phase 1; this is not a later hardening pass.
- Phase 1 must replace `lib/archive.ts` session-memory storage with durable PostgreSQL-backed persistence for live dashboard state and archived intelligence snapshots.
- Archive records should become immutable stored snapshots with enough metadata to support later comparison and provenance work, rather than remaining anonymous blobs in memory.
- The existing AI update/archive workflow should keep working through the migration so the current dashboard remains usable while the data layer is modernized.
- Phase 1 should optimize for a stable backend foundation and route protection, not for visible UI redesign.
- The separate Kite relay deployment is a confirmed architectural direction, but implementing that relay belongs to Phase 2.

### the agent's Discretion
- Exact Better Auth + Drizzle + Supabase integration details.
- Exact table names, schema boundaries, and migration sequencing.
- Minimal test strategy for this phase, so long as persistence and auth isolation are verified.

### Deferred Ideas (OUT OF SCOPE)
- Implementing the dedicated Kite relay service.
- Fundamentals ETL source selection and parser hardening.
- News, macro, and alert-ranking pipelines.

</user_constraints>

<research_summary>
## Summary

Phase 1 is an infrastructure migration with a hard trust boundary: move the dashboard away from in-memory state and protect every private surface without destabilizing the current AI-update flow. The cleanest approach is to keep the existing Next.js App Router shape, add a small `lib/db` layer with Drizzle + `pg` against Supabase Postgres, and preserve the current `lib/archive.ts` API as the compatibility boundary while swapping its implementation underneath.

For auth, Better Auth is the right fit because the product needs credentials-only access for a tiny invited group, not a consumer OAuth matrix. The safest implementation pattern is server-side session verification plus middleware gating for page routes, with explicit checks inside mutating API handlers so auth is not only "visual," and a small admin-managed invite/account creation path rather than self-serve signup. User-owned records should be scoped by a stable user ID in the database layer from this phase onward.

**Primary recommendation:** Build a durable Postgres-backed archive/dashboard store behind the current `lib/archive.ts` interface first, then layer Better Auth and route protection on top of that same database foundation.
</research_summary>

<standard_stack>
## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 16.1.6 | App Router pages, route handlers, middleware | Already the repo foundation and the right shell for this phase. |
| PostgreSQL | 16 | Durable system of record | Fits user-scoped persistence and future screener/portfolio queries. |
| `pg` | 8.x | Node Postgres driver | Simple, reliable connection layer for Drizzle and hosted Postgres. |
| Drizzle ORM | 0.44.x | Schema, migrations, typed queries | Strong fit for explicit SQL control without heavyweight ORM indirection. |
| Better Auth | 1.x | Email/password auth with sessions | Best match for invite-only, credentials-first access in a small private app. |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `drizzle-kit` | 0.30.x | Generate and run migrations | Use for schema evolution and repeatable local/prod migration flow. |
| `tsx` | 4.x | Run TS scripts directly | Useful for local migration/dev scripts if needed. |
| `zod` | 3.24.1 | Payload validation | Keep using it for database-bound payload validation and archive schema checks. |
| `pino` | 9.x | Structured logs | Helpful for auth failures, migration diagnostics, and persistence debugging. |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Drizzle ORM | Prisma | Prisma is friendlier for rapid CRUD, but Drizzle gives better control for migration-heavy and query-sensitive work. |
| Better Auth | Auth.js | Auth.js has broader ecosystem familiarity, but Better Auth fits credentials-first flows more naturally here. |
| App-layer session checks only | Supabase RLS + app checks | RLS can add defense in depth, but app-layer authorization is the locked Phase 1 baseline. |

**Installation:**
```bash
npm install drizzle-orm pg better-auth
npm install -D drizzle-kit tsx
```
</standard_stack>

<architecture_patterns>
## Architecture Patterns

### Recommended Project Structure
```text
lib/
├── db/
│   ├── index.ts          # Drizzle + pg client bootstrap
│   ├── schema.ts         # Tables and relations
│   └── queries/
│       └── archive.ts    # Archive/dashboard persistence helpers
├── auth.ts               # Better Auth config + session helpers
└── archive.ts            # Compatibility facade over durable storage

app/
├── api/
│   ├── auth/[...all]/route.ts
│   ├── archives/route.ts
│   └── update-data/route.ts
├── login/page.tsx
└── page.tsx
```

### Pattern 1: Compatibility facade over persistence
**What:** Keep `saveLiveData`, `getLiveData`, `archiveCurrentData`, `listArchives`, and `getArchive` as the public API while moving the actual implementation into database query helpers.
**When to use:** During brownfield migrations where callers already rely on a small module surface.
**Example:**
```typescript
// lib/archive.ts
import { saveDashboardState, loadDashboardState } from "@/lib/db/queries/archive";

export async function saveLiveData(data: unknown) {
  return saveDashboardState(data);
}

export async function getLiveData() {
  return loadDashboardState();
}
```

### Pattern 2: Session gate at middleware + handler boundary
**What:** Use middleware to protect dashboard pages, but also verify the session inside mutating or private API handlers.
**When to use:** Any authenticated App Router app where private data can also be accessed via fetch routes.
**Example:**
```typescript
// middleware.ts
import { NextResponse } from "next/server";

export function middleware(request: Request) {
  const hasSession = request.headers.get("cookie")?.includes("better-auth") ?? false;
  if (!hasSession) return NextResponse.redirect(new URL("/login", request.url));
  return NextResponse.next();
}
```

### Pattern 3: User-scoped persistence helpers
**What:** Database helpers accept an explicit `userId` and never infer ownership from route shape or cache key alone.
**When to use:** Any archive, watchlist, or portfolio read/write in this product.
**Example:**
```typescript
// lib/db/queries/archive.ts
export async function listArchivesForUser(userId: string) {
  return db.select().from(intelligenceSnapshots).where(eq(intelligenceSnapshots.ownerUserId, userId));
}
```

### Anti-Patterns to Avoid
- **In-memory production fallback:** It hides data loss instead of fixing persistence.
- **Public page gating without API checks:** It creates the illusion of auth while private data stays reachable via routes.
- **Adding RLS before app-layer authorization is stable:** It adds policy/debug complexity before the core auth boundary is proven.
</architecture_patterns>

<dont_hand_roll>
## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Credentials auth | Custom password hashing and session cookies | Better Auth | Edge cases around tokens, rotation, and session invalidation are not worth custom code here. |
| SQL migrations | Ad hoc SQL files with no typed schema source | Drizzle schema + migrations | Keeps schema changes reviewable and aligned with TypeScript types. |
| Archive persistence | JSON files or module-level state | Postgres-backed archive store | This product needs durable, queryable history and user scoping. |

**Key insight:** Phase 1 should remove improvisation, not introduce new bespoke infrastructure.
</dont_hand_roll>

<common_pitfalls>
## Common Pitfalls

### Pitfall 1: Breaking the current dashboard while migrating storage
**What goes wrong:** The UI or update route stops working because the migration changes call sites and data shapes at the same time.
**Why it happens:** Teams replace persistence and route contracts in one pass instead of preserving a compatibility seam.
**How to avoid:** Keep `lib/archive.ts` stable as the public boundary and move callers only after the DB-backed adapter works.
**Warning signs:** `app/page.tsx` or `/api/update-data` starts needing broad rewrites before persistence is proven.

### Pitfall 2: Protecting pages but not write APIs
**What goes wrong:** Unauthenticated users cannot see the dashboard, but can still trigger `/api/update-data` or browse archives directly.
**Why it happens:** Middleware is treated as the whole auth solution.
**How to avoid:** Check sessions inside `app/api/update-data/route.ts` and `app/api/archives/route.ts` in addition to middleware.
**Warning signs:** Private APIs remain callable from curl or browser devtools without a real session.

### Pitfall 3: Designing archive records without provenance
**What goes wrong:** Historical snapshots are durable but not trustworthy because they lack timestamps, model identifiers, or origin metadata.
**Why it happens:** The migration focuses on "save the blob" rather than "make history auditable."
**How to avoid:** Add metadata such as `archivedAt`, `updatedAt`, `sourceModel`, and owner/user scope from the start.
**Warning signs:** Old records cannot explain when or how they were created.
</common_pitfalls>

<code_examples>
## Code Examples

Verified patterns from the phase’s chosen approach:

### Database bootstrap
```typescript
// Source: project-aligned Drizzle/pg pattern
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool);
export { pool };
```

### Better Auth server config
```typescript
// Source: project-aligned Better Auth pattern
import { betterAuth } from "better-auth";

export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
  },
  trustedOrigins: [process.env.BETTER_AUTH_URL ?? "http://localhost:3000"],
});
```

### Route-level session enforcement
```typescript
// Source: project-aligned App Router handler pattern
export async function POST(request: Request) {
  const session = await getRequiredSession(request);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  return runProtectedMutation(session.user.id);
}
```
</code_examples>

<sota_updates>
## State of the Art (2024-2025)

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Lucia for lightweight auth | Better Auth for TS-first credentials/session flows | 2025 | Better Auth is the stronger default for new credentials-heavy apps. |
| ORM-heavy abstraction by default | More teams using Drizzle for explicit SQL + typed schema | 2024-2025 | Better fit for products with custom reporting and migration discipline. |
| Serverless-does-everything assumption | Split always-on services from the main app when live sockets are involved | Ongoing | Matters directly because Phase 2 will need the Kite relay split. |

**New tools/patterns to consider:**
- Hosted Postgres + app-layer typed ORM remains the cleanest small-team foundation.
- Credentials auth with explicit session checks is preferred over public-login complexity for fixed private-user tools.

**Deprecated/outdated:**
- Module-level in-memory state for durable app features.
- Mixing demo data paths with production truth without provenance labels.
</sota_updates>

<open_questions>
## Open Questions

1. **How much Phase 2 schema should be created now?**
   - What we know: later phases need stocks, watchlists, holdings, and archives in Postgres.
   - What's unclear: whether to add all future tables now or only the ones Phase 1 directly exercises.
   - Recommendation: create the archive/live-state tables and only the minimal future-facing scaffolding needed to satisfy `DATA-02` without speculative over-modeling.
</open_questions>

<sources>
## Sources

### Primary (HIGH confidence)
- `.planning/phases/01-foundation-access/01-CONTEXT.md` - locked phase decisions and scope.
- `.planning/research/SUMMARY.md` - project-wide stack and architecture synthesis.
- `.planning/research/STACK.md` - recommended libraries and deployment pattern.
- `.planning/research/PITFALLS.md` - phase-relevant failure modes.
- `.planning/codebase/CONCERNS.md` - current codebase persistence and auth risks.

### Secondary (MEDIUM confidence)
- Official Drizzle ORM docs - typed schema and migration patterns.
- Official Better Auth docs - credentials flow and App Router integration patterns.
- Official Supabase Postgres docs - hosted Postgres connection model.

</sources>

<metadata>
## Metadata

**Research scope:**
- Core technology: Supabase Postgres + Drizzle + Better Auth on Next.js
- Ecosystem: `pg`, `drizzle-kit`, Better Auth, App Router middleware/route checks
- Patterns: compatibility facade, user-scoped queries, route protection
- Pitfalls: migration safety, auth coverage, archive provenance

**Confidence breakdown:**
- Standard stack: HIGH - aligned with the existing repo and project research.
- Architecture: HIGH - clear separation between persistence/auth now and relay later.
- Pitfalls: HIGH - directly grounded in current codebase risks.
- Code examples: MEDIUM - project-aligned patterns, to be finalized during execution.

**Research date:** 2026-03-30
**Valid until:** 2026-04-29
</metadata>

---

*Phase: 01-foundation-access*
*Research completed: 2026-03-30*
*Ready for planning: yes*
