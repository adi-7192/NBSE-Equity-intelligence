# Supabase Setup

This app currently uses Supabase as a hosted PostgreSQL provider only.

Important:

- Better Auth is handling authentication in the app.
- Supabase Auth is not required for Phase 1.
- The only required Supabase value right now is the Postgres connection string for `DATABASE_URL`.

## What To Do In Supabase

1. Create a new Supabase project.
2. Choose a region close to your users and save the database password you create.
3. Open the project dashboard and click `Connect`.
4. Copy the `Transaction pooler` Postgres connection string.
5. Put that value into `DATABASE_URL` in your local `.env`.
6. In Vercel, add the same `DATABASE_URL` plus the Better Auth variables from `.env.example`.
7. Run the generated SQL migration in [`drizzle/0000_slimy_naoko.sql`](./drizzle/0000_slimy_naoko.sql) against the Supabase database.
8. Start the app locally and use the bootstrap admin credentials once on `/login`.
9. After the first admin exists, create the remaining users from `/admin`.

## Required Local Values

```env
DATABASE_URL=
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=
BOOTSTRAP_ADMIN_EMAIL=
BOOTSTRAP_ADMIN_PASSWORD=
```

## Recommended Values

- `BETTER_AUTH_SECRET`: generate a long random secret, at least 32 bytes of entropy
- `BETTER_AUTH_URL`: `http://localhost:3000` locally, your production domain on Vercel in prod
- `BOOTSTRAP_ADMIN_EMAIL`: your own admin email
- `BOOTSTRAP_ADMIN_PASSWORD`: a strong temporary password you will use once for first bootstrap

## How To Apply The Migration

Option A: Supabase SQL Editor

1. Open `SQL Editor` in the Supabase dashboard.
2. Open [`drizzle/0000_slimy_naoko.sql`](./drizzle/0000_slimy_naoko.sql).
3. Paste the SQL into the editor.
4. Run it once.

Option B: psql

```bash
psql "$DATABASE_URL" -f drizzle/0000_slimy_naoko.sql
```

## After Setup

1. Run `npm run dev`
2. Open `http://localhost:3000/login`
3. Create the bootstrap admin using the `BOOTSTRAP_ADMIN_*` credentials
4. Sign in
5. Go to `/admin` and create the other approved users

## Notes

- Do not commit `.env`
- Do not expose any secret or service-role keys in the browser
- For this phase, you do not need RLS policies because the app is enforcing access at the app layer
