# Pitfalls Research

**Domain:** Personal financial terminal for Indian equity markets
**Researched:** 2026-03-30
**Confidence:** HIGH

## Critical Pitfalls

### Pitfall 1: Treating Vercel like a place to host the Kite WebSocket

**What goes wrong:**
The app appears to have "live data" in development, but the Kite connection quietly breaks in production because serverless functions cannot hold a persistent upstream socket. Price streams stall, reconnect logic becomes flaky, and browser updates degrade into delayed or missing ticks.

**Why it happens:**
It is easy to assume that a route handler or cron job can own the full live-data pipeline. In reality, KiteTicker needs a long-lived Node process, while Vercel is optimized for request-scoped execution. Teams also underestimate the difference between a demo tick feed and a production relay.

**How to avoid:**
Keep the Kite connection in a dedicated always-on process and treat Vercel as the presentation/API layer. Use SSE only for browser delivery, write ticks into a shared store, and make the deployment model explicit in the architecture docs and runtime checks. Add a startup health check that fails loudly if the relay is not connected.

**Warning signs:**
Live prices update in local dev but freeze after deployment, reconnects happen every few minutes, SSE clients show stale values, or the app works only when a route is actively being hit.

**Phase to address:**
Real-Time Market Data foundation.

---

### Pitfall 2: Letting brittle fundamentals ingestion become "mostly fresh"

**What goes wrong:**
Fundamentals look available, but one broken scrape, format change, or source outage leaves rows partially updated, silently stale, or internally inconsistent. Screens then rank stocks using a mix of old and new statements, which is worse than obviously missing data.

**Why it happens:**
Exchange files, Screener-style HTML, and third-party exports change without notice. It is tempting to accept partial success, fall back to stale cache values, or parse loosely to keep ETL green. That creates fragile data that appears valid enough to trust.

**How to avoid:**
Use strict source-specific parsers, store source timestamps and ingestion run IDs, and reject partial writes unless the batch is explicitly marked incomplete. Validate row counts, currency units, and statement period alignment before upserting. Prefer source quarantine over silent fallback when a feed shape changes.

**Warning signs:**
Sudden drops in populated fields, weird jumps in PE or margins across a full sector, many nulls after a source change, or "successful" ETL runs with suspiciously low write counts.

**Phase to address:**
Fundamentals ETL and Screener Engine.

---

### Pitfall 3: Leaking one user's data into another user's session

**What goes wrong:**
Watchlists, portfolios, alerts, or cached live values become visible across the 2-5 user group. Even a small leak here is severe because the app handles personal investing data and could expose holdings, risk preferences, or alert thresholds.

**Why it happens:**
The project starts with simple auth and then layers on shared caches, SSE endpoints, and server-side aggregation. If any of those layers rely on implicit session state, query-string trust, or unscoped cache keys, data separation collapses quietly.

**How to avoid:**
Scope every read/write by authenticated user ID, never by only ticker or route name. Include user identity in cache keys, validate sessions in middleware and route handlers, and treat portfolio and alert records as private by default. Add explicit tests for cross-user isolation, especially around SSE streams and cached API responses.

**Warning signs:**
One user sees another user's holdings or alerts, cached screens show impossible portfolio values, or an admin/debug session accidentally "fixes" another user's view.

**Phase to address:**
Foundation, then Portfolio Monitor.

---

### Pitfall 4: Leaving fake data paths alive after real data arrives

**What goes wrong:**
Mock prices, simulated fundamentals, and real Kite data coexist in the UI. The dashboard looks complete, but users cannot tell which numbers are live, delayed, or invented. Decisions start being made against blended truth.

**Why it happens:**
Brownfield projects often keep old demo data around as a fallback "just in case." That is useful during migration, but dangerous once the terminal is meant to be trusted. Without a strict cutover rule, the UI can drift into a permanent hybrid state.

**How to avoid:**
Define a single source of truth per field and display provenance in the UI for any value that can be delayed, estimated, or cached. Remove simulation paths from production screens once real feeds are available, or gate them behind a clearly labeled dev-only flag. Add schema-level flags such as `data_origin`, `as_of`, and `is_live`.

**Warning signs:**
Different tabs show different prices for the same stock, "live" views match old seed data too closely, or users ask whether a number is real because the interface does not say.

**Phase to address:**
Real-Time Market Data and AI Intelligence Layer migration.

---

### Pitfall 5: Turning alerts and weekly intelligence into noise

**What goes wrong:**
The system becomes busy instead of useful. Too many news hits, weak signal matching, and overly eager red flags train users to ignore alerts, including the rare ones that matter.

**Why it happens:**
Financial data is abundant, but not all of it is actionable. It is easy to wire every filing, headline, or price move into an alert channel without ranking by importance, deduplicating, or suppressing repeats. AI summaries can also overstate confidence when the underlying event is minor.

**How to avoid:**
Define alert tiers, debounce repeated events, group related items by stock and theme, and require clear severity thresholds for push-style alerts. Show why an alert fired, not just that it fired. For weekly AI output, cap the number of "picks" or "red flags" and compare them against prior weeks to avoid repetition.

**Warning signs:**
Alert counts rise while user engagement falls, the same filing appears multiple times, summaries read like generic market commentary, or important portfolio alerts are buried under low-value news.

**Phase to address:**
News Intelligence and AI Intelligence Layer.

---

### Pitfall 6: Losing archive integrity and provenance

**What goes wrong:**
Historical intelligence snapshots become impossible to trust because archives are incomplete, overwritten, unvalidated, or missing the metadata needed to compare them. The app claims to preserve history, but the archive is really just a fragile cache of blobs.

**Why it happens:**
It is convenient to store generated objects without versioning, source references, or schema checks. But financial archives need reproducibility: what was generated, from which inputs, with which model, and at what market timestamp.

**How to avoid:**
Persist immutable archive records with version IDs, creation timestamps, model and prompt metadata, and a hash or checksum for the stored payload. Validate on read and write, never mutate historical snapshots in place, and keep a retention policy that preserves comparability across time. If a snapshot cannot be rendered exactly, mark it invalid instead of repairing it silently.

**Warning signs:**
Old archives look different after a redeploy, comparisons fail because fields are missing, there is no way to tell which model produced a snapshot, or users cannot explain why a past pick existed.

**Phase to address:**
Archive persistence, then AI Intelligence Layer.

---

## Technical Debt Patterns

Shortcuts that help a demo ship quickly but create long-term problems in this project.

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Keep mock market data alongside real feeds | Faster UI migration | Users cannot trust what is live vs simulated | Only in local development or behind a strict dev flag |
| Parse fundamentals loosely and fill gaps later | Higher ETL pass rate | Bad valuations and silent data corruption | Never for production writes |
| Store live ticks only in memory | Simple relay implementation | Data loss, stale views after restart | Only as a transient cache in an always-on process |
| Cache by ticker alone | Fewer cache keys | Cross-user leakage and stale portfolio views | Never for authenticated data |
| Fire alerts on every new filing or headline | Maximum recall | Alert fatigue and ignored warnings | Never without dedupe and severity scoring |

## Integration Gotchas

Common mistakes when connecting external services.

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Vercel + Kite WebSocket | Expecting a serverless route handler to own a persistent socket | Run KiteTicker in a separate always-on Node service and fan out to Vercel via shared storage or SSE |
| Kite market data | Forgetting instrument-token mapping and paise-to-rupee conversion | Normalize tokens centrally and convert units at the relay boundary |
| Exchange or Screener-style fundamentals sources | Assuming HTML or CSV structure is stable | Version source parsers, validate row shapes, and fail closed on schema drift |
| PostgreSQL + auth sessions | Reusing generic cache keys or sessionless queries | Scope every record and cache entry by user ID and authorization context |
| News/RSS filing feeds | Treating every event as equally important | Deduplicate, cluster, and rank by user relevance before surfacing alerts |

## Performance Traps

Patterns that work at small scale but fail as the terminal becomes useful.

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Per-request live pricing polling | Slow pages and spiky API usage | Use SSE with a shared tick store and heartbeat updates | Breaks as soon as the watchlist grows beyond a few symbols per user |
| Full-table fundamental scans on every filter change | Slow screeners and high DB load | Precompute metrics, index filter columns, and cache repeated query shapes | Breaks around thousands of stocks and multiple concurrent filter edits |
| Recomputing alert logic on every page load | Duplicate alerts and wasted CPU | Persist alert state and suppress already-seen events | Breaks once news and filings arrive multiple times per day |
| Loading all archive history into one response | Slow archive page and memory spikes | Paginate archives and keep immutable snapshots | Breaks once archives accumulate across weeks or months |

## Security Mistakes

Domain-specific security issues beyond generic web app concerns.

| Mistake | Risk | Prevention |
|---------|------|------------|
| Publicly reachable update or ingest endpoints | Cost spikes and unauthorized data mutation | Require auth, a secret, and rate limits on every write path |
| Mixed-user caching for portfolio or alerts | Private holdings leak across the fixed user group | Include user identity in all cache keys and DB queries |
| Storing secrets or session state in client-visible data | Token exposure or session forgery | Keep broker and API credentials server-side only |
| Trusting source data without provenance | Fake or stale numbers get treated as truth | Attach source, timestamp, and ingestion metadata to every persisted record |

## UX Pitfalls

Common user experience mistakes in this domain.

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Showing live, delayed, and simulated values without labels | Users cannot tell what is safe to act on | Label provenance and freshness directly in the UI |
| Surfacing too many red flags at once | Users stop paying attention | Rank, group, and suppress low-severity repeats |
| Hiding stale data after an ingestion failure | Users assume everything is current | Show explicit freshness status and last successful sync time |
| Rendering archive history without context | Past snapshots are hard to interpret | Show source date, model version, and key deltas alongside each archive |

## "Looks Done But Isn't" Checklist

- [ ] **Live watchlist:** Verify updates still work after a deployment restart and after idle periods.
- [ ] **Fundamentals screener:** Verify every displayed metric has a source date, not just a value.
- [ ] **Auth-protected portfolio:** Verify two users cannot see each other's holdings, watchlists, or alerts.
- [ ] **Archives:** Verify snapshots are immutable, renderable after redeploy, and tied to model/input metadata.

## Recovery Strategies

When pitfalls happen despite prevention, recover in a controlled way.

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Kite relay or SSE outage | HIGH | Pause live UI indicators, surface stale-data banners, restart the relay, and backfill from the latest persisted tick state |
| Fundamentals ingestion corruption | HIGH | Quarantine the bad batch, restore the last known good dataset, and replay only the verified source files |
| Auth or cache leakage | HIGH | Invalidate all sessions, clear user-scoped caches, audit access logs, and patch all unscoped reads before re-enabling access |
| Archive corruption | MEDIUM | Rebuild from immutable source records if available, otherwise mark affected snapshots unavailable and document the gap |
| Alert fatigue | MEDIUM | Tighten thresholds, collapse duplicates, and move low-priority items out of push-like surfaces |

## Pitfall-to-Phase Mapping

How roadmap phases should address these pitfalls.

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Treating Vercel like the Kite host | Real-Time Market Data | Live prices survive deploys, restarts, and idle windows |
| Brittle fundamentals ingestion | Fundamentals ETL | A source-format change fails closed and does not poison existing rows |
| Auth and cross-user leakage | Foundation | Two test users cannot read or cache each other's private data |
| Fake-vs-real data drift | Real-Time Market Data and AI Intelligence Layer | UI visibly labels provenance and no production screen reads mock data |
| Alert fatigue | News Intelligence and Portfolio Monitor | Repeated low-signal events are deduped and severity-ranked |
| Archive integrity loss | Archive persistence and AI Intelligence Layer | Old snapshots render identically after redeploy with metadata intact |

## Sources

- `.planning/PROJECT.md`
- `.planning/research/ARCHITECTURE.md`
- `.planning/codebase/CONCERNS.md`
- `.codex/get-shit-done/templates/research-project/PITFALLS.md`

---
*Pitfalls research for: Indian equity market personal terminal*
*Researched: 2026-03-30*
