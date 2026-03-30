# Equity Intelligence — Personal Bloomberg Terminal for Indian Markets

## What This Is

A personal Bloomberg Terminal for Indian markets built as a modular financial operating system. It replaces a scattered workflow across TradingView, Screener.in, Moneycontrol, and broker apps with a single web dashboard covering five pillars: real-time market data, fundamentals & analytics, macroeconomic data, news intelligence, and (eventually) trade execution. Built for a small circle of 2–5 users (family/friends) with basic auth.

## Core Value

A stock screener + portfolio monitor that lets you go from 5,000+ Indian stocks to a conviction-ready shortlist — with real fundamentals, live Kite prices, and AI-powered weekly intelligence — in one tab.

## Current Milestone: v1.0 Screener + Portfolio Monitor

**Goal:** Turn the existing weekly intelligence dashboard into a persistent, authenticated Indian-market terminal centered on screening and portfolio monitoring with real data.

**Target features:**
- PostgreSQL persistence and lightweight auth for a fixed 2-5 user group
- Zerodha-backed live market data, fundamentals screening, and stock research workflows
- Portfolio monitoring, macro/news ingestion, and AI weekly intelligence powered by real stored data

## Requirements

### Validated

<!-- Inferred from existing codebase (brownfield) -->

- ✓ Tabbed dashboard layout (alerts, sectors, picks, macro) — existing
- ✓ AI-generated weekly market intelligence (summaries, picks, alerts via Claude) — existing
- ✓ Archive history for past intelligence snapshots — existing
- ✓ Dark/light theme switching — existing
- ✓ Recharts-based data visualization — existing
- ✓ Zod-validated structured AI output schema — existing

### Active

<!-- V1 milestone: Screener + Portfolio Monitor -->

**Foundation:**
- [ ] PostgreSQL persistence layer (replace in-memory session storage)
- [ ] Basic authentication for 2–5 users

**Pillar 1 — Real-Time Market Data:**
- [ ] Zerodha Kite WebSocket integration for live price feeds (NSE/BSE)
- [ ] Live watchlist with real-time price updates, % change, volume
- [ ] Market overview (indices: Nifty 50, Sensex, Nifty Bank, Midcap 150)

**Pillar 2 — Fundamentals & Analytics (Core Pillar):**
- [ ] Stock screener with fundamental filters (PE, PB, ROE, ROCE, revenue growth, profit margins, debt/equity, dividend yield)
- [ ] Individual stock page: full financials (P&L, balance sheet, cash flow — historical + TTM)
- [ ] Peer comparison table (within sector)
- [ ] Valuation metrics and scoring (e.g. quality + momentum composite)

**Pillar 3 — Portfolio Monitor:**
- [ ] Portfolio holdings with live P&L (Kite API positions or manual entry)
- [ ] Red flag alerts (earnings miss, margin deterioration, pledge increase, governance issues)
- [ ] Portfolio-level analytics (sector concentration, XIRR, beta)

**Pillar 4 — Macroeconomic Data:**
- [ ] RBI key rates (repo, reverse repo, CRR, SLR)
- [ ] CPI / WPI inflation trends
- [ ] IIP data
- [ ] FII/DII flows (daily/monthly)
- [ ] Sector rotation view

**Pillar 5 — News Intelligence:**
- [ ] Curated news feed filtered by portfolio + watchlist stocks
- [ ] Regulatory filings alerts (BSE/NSE exchange filings)
- [ ] AI-powered weekly summary with key market themes (keep existing Claude integration)

### Out of Scope

- **Trade execution** — not a priority yet; Kite API included for data only in v1
- **Mobile native app** — web dashboard only; responsive is fine but native app is not planned
- **Public SaaS / multi-tenant** — personal tool for a fixed small group; not designed for open signups
- **Sub-second tick data / HFT** — fundamental investing workflow doesn't need it; Kite WebSocket is sufficient
- **Options chain / F&O analytics** — equity focus only for v1
- **Social features** — no sharing, commenting, or collaboration features

## Context

**Existing codebase (brownfield):**
- Next.js 16 + TypeScript + shadcn/ui + Radix UI + Recharts
- Vercel AI SDK with Claude integration for market intelligence generation
- Currently uses AI to *simulate* all market data — this will be replaced with real data; AI stays as the intelligence/summary layer
- No auth, no database, in-memory session storage (data lost on restart)
- pnpm, deployed to Vercel

**Data sources:**
- Zerodha Kite API — user already has account; handles live prices (WebSocket), historical OHLCV, and positions
- Fundamentals: BSE/NSE bulk data, Screener.in scraping, or a dedicated fundamentals API (e.g. Ticker Tape, Groww API, or bulk CSV downloads from exchanges)
- Macro: RBI website, MOSPI, SEBI DRHP feeds
- News: NSE/BSE exchange filing feeds, RSS from ET/Mint/Bloomberg Quint, optionally a news API

**Architecture direction:**
- PostgreSQL as primary store (Supabase or self-hosted)
- Kite WebSocket → server-side → client via SSE or WebSocket
- Fundamentals data: scheduled ETL jobs (daily/weekly) into PostgreSQL
- AI layer remains for weekly intelligence generation on top of real data

## Constraints

- **Auth**: Keep auth simple — no OAuth, no enterprise SSO; basic email/password or invite-only for 2–5 users
- **Data cost**: Zerodha Kite API is free with a brokerage account; avoid paid data subscriptions where free alternatives exist
- **Stack**: Stay on Next.js + TypeScript — existing codebase, no framework switch
- **Deployment**: Vercel-compatible (or self-hostable on a small VPS); not designed for Kubernetes-scale infra
- **Fundamentals freshness**: Fundamental data updated daily/weekly is acceptable — not real-time required

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| PostgreSQL over SQLite | Multi-user support (2–5 users), portfolio history, screener queries need a proper DB | — Pending |
| Zerodha Kite API for data | User already has account; covers live prices, historical, and potential future execution | — Pending |
| Keep AI layer alongside real data | Real data for the live terminal; Claude generates weekly summaries and curated picks on top of real data | — Pending |
| Web dashboard, not native | Lower friction for small group; existing Next.js codebase; no install required | — Pending |
| Extend existing codebase | Strong foundation (component library, charts, AI SDK); avoid rewrite cost | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd:transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-03-30 after GSD state reconstruction*
