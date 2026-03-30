# Phase 2: Live Market Data - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-30
**Phase:** 02-Live Market Data
**Areas discussed:** Live scope boundary, update behavior, watchlist ownership, market overview scope

---

## Live scope boundary

| Option | Description | Selected |
|--------|-------------|----------|
| Market overview + manual watchlist only | Focus Phase 2 on relay, benchmarks, and watchlist live prices | ✓ |
| Include live portfolio-held names too | Expand the phase to also cover live portfolio tracking | |

**User's choice:** Market overview + manual watchlist only
**Notes:** Portfolio live-tracking was explicitly deferred to Phase 5 to keep this phase focused on validating the live-data architecture first.

---

## Update behavior

| Option | Description | Selected |
|--------|-------------|----------|
| Near-live during market hours + explicit frozen closed-market state | Refresh every few seconds while markets are open and clearly show when the market is closed | ✓ |
| Tick-perfect streaming everywhere | Optimize for maximum update frequency regardless of product need | |

**User's choice:** Near-live during market hours + explicit closed-market state
**Notes:** Chosen because the product is for investing workflow, not HFT, and clarity around market-hours state matters more than ultra-low latency.

---

## Watchlist ownership

| Option | Description | Selected |
|--------|-------------|----------|
| User-specific watchlists from day one | Each user manages their own live watchlist immediately | |
| Shared starter watchlist | Keep the first live watchlist shared to avoid full watchlist CRUD scope in Phase 2 | ✓ |

**User's choice:** Shared starter watchlist
**Notes:** Selected after recognizing that user-specific watchlists would implicitly require add/remove/manage flows that would broaden Phase 2 too much.

---

## Shared watchlist management

| Option | Description | Selected |
|--------|-------------|----------|
| Hardcoded fixed list | Keep the watchlist static in code for this phase | |
| Editable only by admin inside the app | Keep the list shared, but let the admin adjust it from the product | ✓ |

**User's choice:** Editable only by admin inside the app
**Notes:** Chosen as the smallest management surface that still avoids a hardcoded-only experience.

---

## Market overview scope

| Option | Description | Selected |
|--------|-------------|----------|
| Four benchmarks only | Limit to Nifty 50, Sensex, Nifty Bank, and Midcap 150 | ✓ |
| Add extras now | Include sector proxies, India VIX, or broader breadth metrics in Phase 2 | |

**User's choice:** Four benchmarks only
**Notes:** Keeps the first market-overview surface intentionally tight and aligned with the roadmap requirement.

## Deferred Ideas

- Per-user watchlist CRUD
- Live portfolio overlays
- Sector proxies and India VIX

