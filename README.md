# NBSE Equity Intelligence

Private Indian equities research workspace built on Next.js, Drizzle, PostgreSQL, and Better Auth.

## Current Scope

Phase 1 is implemented:

- Durable PostgreSQL-backed dashboard state and archive storage
- Private email/password authentication with Better Auth
- One bootstrap admin account
- Admin-managed account creation inside the app
- User-scoped dashboard and archive data

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Fill in `.env` with real values.

3. Run the generated migration against your Supabase database.

4. Start the app:

```bash
npm run dev
```

## Environment Variables

- `DATABASE_URL`: Supabase Postgres connection string
- `BETTER_AUTH_SECRET`: long random secret for Better Auth
- `BETTER_AUTH_URL`: app base URL, for example `http://localhost:3000`
- `BOOTSTRAP_ADMIN_EMAIL`: one-time first admin email
- `BOOTSTRAP_ADMIN_PASSWORD`: one-time first admin password

## Supabase Setup

Detailed Supabase setup lives in [SUPABASE_SETUP.md](./SUPABASE_SETUP.md).

## Verification

These commands passed locally during Phase 1:

```bash
npm run lint
npx tsc --noEmit
npx drizzle-kit generate
```
