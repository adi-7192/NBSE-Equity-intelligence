import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres"
import { Pool } from "pg"
import * as schema from "./schema"

type EquityDatabase = NodePgDatabase<typeof schema>

const DATABASE_URL = process.env.DATABASE_URL

const globalForDatabase = globalThis as typeof globalThis & {
  __equityPool?: Pool
  __equityDb?: EquityDatabase
}

function createPool() {
  if (!DATABASE_URL) {
    return null
  }

  const shouldUseSsl =
    DATABASE_URL.includes("sslmode=require") || DATABASE_URL.includes("supabase.co")

  return new Pool({
    connectionString: DATABASE_URL,
    ssl: shouldUseSsl ? { rejectUnauthorized: false } : undefined,
  })
}

export const pool = globalForDatabase.__equityPool ?? createPool()

export const db =
  globalForDatabase.__equityDb ??
  (pool
    ? drizzle({
        client: pool,
        schema,
        casing: "snake_case",
      })
    : null)

if (process.env.NODE_ENV !== "production") {
  if (pool) {
    globalForDatabase.__equityPool = pool
  }

  if (db) {
    globalForDatabase.__equityDb = db
  }
}

export function isDatabaseConfigured() {
  return Boolean(DATABASE_URL)
}

export function requireDatabase() {
  if (!db) {
    throw new Error("DATABASE_URL is not configured. Add it before using durable archive storage.")
  }

  return db
}

export type DatabaseClient = EquityDatabase
