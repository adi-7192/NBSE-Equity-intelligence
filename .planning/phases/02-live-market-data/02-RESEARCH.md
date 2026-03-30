# Phase 2: Live Market Data - Research

**Researched:** 2026-03-30
**Domain:** Zerodha Kite live market delivery for a private Next.js dashboard
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Phase 2 covers live market data delivery only for the market overview and a shared starter watchlist.
- Live updates should be near-live every few seconds during market hours, not tick-perfect HFT streaming.
- Outside market hours, the product should clearly show a frozen "market closed" state.
- The Kite connection must live in a separate always-on relay outside Vercel serverless infrastructure.
- Portfolio-held names and portfolio live-tracking are explicitly out of scope for this phase.
- The first watchlist is a single shared starter watchlist, not per-user watchlists.
- Only the admin should be able to edit that shared watchlist from inside the app.
- The market overview is limited to four benchmarks: Nifty 50, Sensex, Nifty Bank, and Midcap 150.
- Phase 2 should prioritize reliable live plumbing and clear freshness indicators over a broad UI redesign.

### the agent's Discretion
- Exact relay implementation shape inside the repo.
- Exact app-to-relay contract, including whether the app reads snapshots, SSE, or both.
- Exact minimal admin UX for editing the shared watchlist.
- Whether a separate cache service is required in Phase 2, so long as the design stays compatible with later expansion.

### Deferred Ideas (OUT OF SCOPE)
- Per-user watchlist CRUD and personalization.
- Live portfolio P&L or holdings overlays.
- Sector proxies, India VIX, broader breadth, or macro overlays in the live header.
- Reworking the AI update flow to consume live prices directly.

</user_constraints>

<research_summary>
## Summary

Phase 2 should solve one problem cleanly: make trusted live market data appear inside the existing private dashboard without pretending Vercel can host the entire stream lifecycle. The best fit for this repo is a small sidecar Kite relay that runs as a separate long-lived Node service, owns the upstream WebSocket connection, keeps an in-memory latest-tick cache for the tracked instruments, and exposes narrow service endpoints for health, snapshots, event streaming, and subscription sync.

Inside the Next.js app, Phase 2 should avoid overloading the existing per-user watchlist tables for what is explicitly a shared admin-managed starter list. A dedicated single-table `shared_watchlist_items` model is cleaner, prevents awkward "special owner" hacks, avoids coupling this phase to the current user-scoped `watchlists` tables, and leaves the current per-user watchlist schema free for a later personalization phase.

On the UI side, the existing dashboard shell is strong enough to reuse. The key change is not visual reinvention; it is replacing the current stale sample market header and watchlist tab with live benchmark and watchlist surfaces that communicate freshness, connection state, and market-hours state clearly. The top of the dashboard should become an explicit live-market layer, while the existing weekly digest/archive experience remains a separate analysis layer beneath it.

**Primary recommendation:** Implement a dedicated relay boundary plus a shared-watchlist persistence path first, define the browser contract as `snapshot + SSE` rather than a vague "live route," and then wire the dashboard/admin page onto that contract with explicit market, freshness, and connection states and no silent fallback to mock market data.
</research_summary>

<standard_stack>
## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 16.1.6 | Protected app shell, route handlers, server components | Already the repo foundation and still the right place for authenticated dashboard delivery. |
| `kiteconnect` | 3.x | Zerodha REST/WebSocket connectivity | Official client path for tracked live instruments. |
| Node.js service | 20+ | Always-on Kite relay | Required because Vercel serverless cannot own a persistent upstream Kite socket. |
| PostgreSQL | 16 | Shared watchlist metadata and market configuration persistence | Already established in Phase 1 and enough for the admin-managed shared list. |
| Drizzle ORM | 0.44.x | Shared watchlist schema and query layer | Keeps market metadata typed and reviewable in the same persistence layer. |
| Better Auth | 1.x | App-side auth and admin gating | Already in place and the correct trust boundary for watchlist management. |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `pino` | 9.x | Relay/service logs | Useful for relay connection, reconnect, token-refresh, and stale-feed diagnostics. |
| `zod` | 3.24.1 | Payload validation between relay and app | Use to validate relay snapshots and prevent malformed live payloads from reaching the UI. |
| Native `EventSource` | Browser API | One-way live browser updates | Best fit for server-to-client market pushes with reconnection. |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Separate relay service in repo | Browser talking straight to a relay | Simpler to prototype, but weaker auth/control boundaries and less room for app-side policy. |
| Dedicated shared-watchlist table | Reusing per-user watchlists with a magic owner | Faster initially, but muddies the later per-user watchlist story. |
| In-memory relay cache only | Upstash/Redis cache | Redis is useful later, but Phase 2 does not need the extra infrastructure if one relay instance already exposes the latest market snapshot/events. |

**Installation:**
```bash
npm install kiteconnect
```
</standard_stack>

<architecture_patterns>
## Architecture Patterns

### Recommended Project Structure
```text
relay/
├── package.json
├── tsconfig.json
└── src/
    ├── index.ts            # relay bootstrap + health/snapshot/events/subscription-sync HTTP surface
    ├── kite.ts             # KiteTicker connection + subscriptions
    └── store.ts            # latest tick cache + freshness metadata

lib/
├── live-market/
│   ├── contracts.ts        # shared payload types and validators
│   ├── instruments.ts      # four benchmarks + starter watchlist metadata
│   └── relay-client.ts     # server-side fetch helpers from app to relay
└── db/queries/
    └── shared-watchlist.ts # admin-managed shared watchlist persistence (`shared_watchlist_items`)

app/
├── api/market/
│   ├── stream/route.ts     # authenticated SSE stream to the dashboard
│   └── snapshot/route.ts   # authenticated latest-market JSON snapshot
└── admin/page.tsx          # shared watchlist management UI
```

### Pattern 1: Relay owns the upstream socket, app owns the product boundary
**What:** The relay process maintains the Kite connection and latest tick cache; the Next app reads from that relay and re-exposes authenticated app-facing snapshot and SSE routes to the dashboard.
**When to use:** Any Vercel-first setup where the product wants live data but should not expose broker connectivity directly to the browser.
**Example:**
```typescript
// lib/live-market/relay-client.ts
export async function fetchRelaySnapshot() {
  const response = await fetch(`${process.env.LIVE_RELAY_URL}/snapshot`, {
    headers: {
      Authorization: `Bearer ${process.env.LIVE_RELAY_SECRET}`,
    },
    cache: "no-store",
  })

  return response.json()
}
```

### Pattern 2: Shared watchlist as its own bounded concept
**What:** Store the Phase 2 starter watchlist in one dedicated `shared_watchlist_items` table instead of pretending it is a user-owned watchlist or introducing an unnecessary parent-list abstraction.
**When to use:** When the current phase explicitly wants one admin-managed list for everyone, while later phases still need per-user watchlists.
**Example:**
```typescript
// lib/db/queries/shared-watchlist.ts
export async function listSharedWatchlistItems() {
  return db.select().from(sharedWatchlistItems).orderBy(sharedWatchlistItems.sortOrder)
}
```

### Pattern 3: Freshness and market-hours metadata travel with the live payload
**What:** Every live payload should include explicit market, freshness, and connection state, not just raw prices.
**When to use:** Financial UI where the biggest trust risk is showing stale or frozen values as if they are live.
**Example:**
```typescript
type MarketSnapshot = {
  sequence: number
  asOf: string
  market: {
    phase: "preopen" | "open" | "postclose" | "closed" | "holiday"
    isOpen: boolean
    sessionDate: string
    timezone: "Asia/Kolkata"
  }
  freshness: {
    state: "fresh" | "lagging" | "stale"
    ageMs: number
    staleAfterMs: number
  }
  connection: {
    state: "connected" | "degraded" | "disconnected"
    lastHeartbeatAt: string
  }
  source: "kite-relay"
  benchmarks: Record<string, { lastPrice: number; changePercent: number; volume?: number }>
}
```

### Anti-Patterns to Avoid
- **Proxying Kite directly from a route handler:** It will be fragile in production and fight the deployment model.
- **Reusing current sample data silently once live plumbing exists:** It blurs the line between demo and real values and becomes a product-trust failure.
- **Treating the shared starter watchlist like a user watchlist:** It creates messy ownership semantics that will hurt later phases.
- **Flattening `closed`, `stale`, and `disconnected` into one UI state:** It makes the interface look trustworthy while hiding the real failure mode.
</architecture_patterns>

<dont_hand_roll>
## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Broker WebSocket protocol | Custom Zerodha socket parsing | `kiteconnect` / KiteTicker | The official client already handles the protocol edge cases. |
| Live-market trust model | UI-only "live" badges with no payload metadata | Relay/app freshness metadata | Users need to know if a value is fresh, closed, or stale. |
| Shared starter watchlist ownership | "Admin user owns the list" hack | Dedicated `shared_watchlist_items` table/query layer | Keeps Phase 2 clean and protects future per-user watchlists. |

**Key insight:** Phase 2 should introduce one trustworthy live-data path, not a pile of temporary shortcuts that later phases must unwind.
</dont_hand_roll>

<common_pitfalls>
## Common Pitfalls

### Pitfall 1: Shipping live-looking UI without a real freshness contract
**What goes wrong:** The dashboard shows prices and green/red deltas, but users cannot tell whether they are current, delayed, or frozen after market close.
**Why it happens:** Teams treat live data as just numbers instead of numbers plus provenance.
**How to avoid:** Carry `asOf`, `isMarketOpen`, and connection health through the whole stack and render those states visibly in the header/watchlist.
**Warning signs:** Users ask whether the screen is really live or whether values changed today.

### Pitfall 2: Letting the relay become the public app surface
**What goes wrong:** The relay ends up serving browser clients directly, duplicating auth, authorization, and product logic away from the main app.
**Why it happens:** It feels faster to hook the browser straight to the live service.
**How to avoid:** Keep the relay narrow: ingest, cache, expose authenticated machine endpoints, and let the Next app remain the user-facing product boundary.
**Warning signs:** Relay routes start needing user/session logic instead of simple service authentication.

### Pitfall 3: Mixing shared live watchlist data with the old narrative "watch next week" content
**What goes wrong:** The UI retains the old weekly watchlist copy but now also claims to be a live watchlist, confusing what the tab means.
**Why it happens:** Brownfield products often layer new data onto old labels.
**How to avoid:** Re-scope the watchlist tab for Phase 2 and make the live shared watchlist unmistakably about tracked instruments and current market state.
**Warning signs:** A tab contains both calendar/event text and live price rows.

### Pitfall 4: Treating the Kite access token like a durable secret
**What goes wrong:** The relay works briefly and then fails the next day because the access token lifecycle was treated like a static env var instead of an operationally refreshed credential.
**Why it happens:** It is easy to think of all `.env` values as stable configuration, but Kite access tokens have their own session lifecycle.
**How to avoid:** Document and implement a clear refresh workflow for the relay before Phase 2 execution is considered complete, even if the first version is manually operated.
**Warning signs:** Relay startup succeeds once, then every later attempt fails until someone re-generates credentials by hand.
</common_pitfalls>

<code_examples>
## Code Examples

Verified patterns for the chosen Phase 2 direction:

### Relay-side latest tick cache
```typescript
// relay/src/store.ts
const latestTicks = new Map<number, TickPayload>()

export function upsertTick(tick: TickPayload) {
  latestTicks.set(tick.instrumentToken, tick)
}
```

### App-side authenticated SSE route
```typescript
// app/api/market/stream/route.ts
export async function GET() {
  const session = await getRequiredSession()
  void session

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
    },
  })
}
```

### Admin-only shared watchlist mutation
```typescript
// app/admin/page.tsx (server action)
if (!hasAdminRole(session.user.role)) {
  redirect("/")
}

await addSharedWatchlistItem({
  symbol: "RELIANCE",
  instrumentToken: 738561,
})
```
</code_examples>

<sota_updates>
## State of the Art (2024-2026)

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Serverless-everything assumption for live feeds | Split live socket ownership into a persistent sidecar or worker | 2024-2026 | Directly relevant because Kite is not a good fit for Vercel-only hosting. |
| WebSocket-first browser delivery by default | Hybrid `snapshot + SSE` contract for one-way browser consumption | Ongoing | Cleaner first paint, reconnect behavior, and market-closed handling for this app. |
| Ad hoc mock/live coexistence during migration | Explicit provenance and freshness from the start | 2025+ | Important because this repo already has sample/stale fallback data. |

**New tools/patterns to consider:**
- A minimal co-located relay folder in the repo is enough for Phase 2; this does not require a full microservices platform.
- Shared live payload contracts should live in the app repo so UI, route handlers, and relay stay aligned.

**Deprecated/outdated:**
- Treating mock dashboard baseline data as a silent production fallback once live delivery exists.
- Building authenticated multi-user market views on top of implicit global state.
</sota_updates>

<open_questions>
## Open Questions

1. **Where will the relay be hosted first?**
   - What we know: it must be outside Vercel serverless.
   - What's unclear: whether the first deployment target is Railway, Fly.io, Render, or a small VPS.
   - Recommendation: keep the relay as a plain Node service in-repo so the hosting target can stay flexible.

2. **How should the Kite access token be refreshed operationally?**
   - What we know: the Phase 2 product needs a working access token for the relay, and that token should not be treated as a forever-stable env secret.
   - What's unclear: whether the first version uses a manual refresh runbook or a more automated internal flow.
   - Recommendation: Phase 2 should include a documented manual refresh workflow in `relay/README.md` at minimum, rather than leaving token expiry as tribal knowledge.
</open_questions>

<sources>
## Sources

### Primary (HIGH confidence)
- `.planning/phases/02-live-market-data/02-CONTEXT.md` - locked Phase 2 scope and decisions.
- `.planning/research/ARCHITECTURE.md` - live relay, SSE, and deployment constraints.
- `.planning/research/STACK.md` - recommended stack additions and live-data patterns.
- `.planning/research/PITFALLS.md` - known pitfalls around Vercel, stale data, and cross-surface confusion.
- `.planning/research/SUMMARY.md` - roadmap-level rationale for Phase 2 ordering.

### Secondary (MEDIUM confidence)
- `app/page.tsx` - current authenticated dashboard entry point.
- `components/dashboard-client.tsx` - existing tab shell to reuse instead of rewriting.
- `components/market-header.tsx` - existing market overview surface currently fed by sample values.
- `app/admin/page.tsx` - existing admin boundary that can host starter watchlist management.
- `lib/db/schema.ts` - current schema state and the need to avoid overloading per-user watchlists for shared-list behavior.
</sources>

---
*Phase: 02-live-market-data*
*Research completed: 2026-03-30*
