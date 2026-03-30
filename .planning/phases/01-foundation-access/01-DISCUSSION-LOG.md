# Phase 1: Foundation & Access - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-30
**Phase:** 01-Foundation & Access
**Areas discussed:** Deployment topology, invite model, authorization depth

---

## Deployment topology

| Option | Description | Selected |
|--------|-------------|----------|
| Supabase + Vercel + separate relay | Keep the main app on Vercel, use Supabase/Postgres for persistence and auth, and deploy the Kite relay separately | ✓ |
| Self-hosted Postgres/VPS | Move app and database closer together in a self-hosted environment | |
| Plan both, implement later | Keep planning deployment-agnostic for now and defer the concrete hosting choice | |

**User's choice:** Supabase + Vercel + separate relay
**Notes:** Selected because it matches the research recommendation and keeps the app Vercel-first while acknowledging that the Kite live connection must run outside serverless infrastructure.

---

## the agent's Discretion

- Exact Better Auth + Drizzle + Supabase wiring
- Schema design and migration strategy
- Minimal verification/test approach for persistence and auth isolation

---

## Invite model

| Option | Description | Selected |
|--------|-------------|----------|
| Manual allowlist | Only preconfigured emails can be used; no in-app admin management | |
| One authenticated admin manages invites/accounts in-app | A bootstrap admin user can create or invite the other approved accounts from inside the product | ✓ |
| Public self-serve signup | Anyone can create an account | |

**User's choice:** One authenticated admin manages invites/accounts in-app
**Notes:** This keeps the product private while avoiding a brittle static allowlist as the long-term workflow.

---

## Authorization depth

| Option | Description | Selected |
|--------|-------------|----------|
| App-layer authorization only in Phase 1 | Route handlers and server logic enforce access; RLS can come later if needed | ✓ |
| App-layer authorization plus Supabase RLS now | Add defense-in-depth policies immediately | |

**User's choice:** App-layer authorization only in Phase 1
**Notes:** Chosen as the default implementation baseline so the team can ship the auth/persistence foundation cleanly before adding policy complexity.

## Deferred Ideas

- Dedicated live Kite relay implementation is acknowledged but deferred to Phase 2.
