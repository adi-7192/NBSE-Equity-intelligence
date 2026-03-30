import { and, desc, eq, sql } from "drizzle-orm"
import { isDatabaseConfigured, requireDatabase } from "../index"
import { intelligenceSnapshots, liveDashboardState } from "../schema"

function requireOwnerUserId(ownerUserId?: string) {
  if (!ownerUserId) {
    throw new Error("Authenticated user scope is required for archive access.")
  }

  return ownerUserId
}

function readStringField(data: unknown, fieldName: string) {
  if (typeof data !== "object" || data === null) {
    return null
  }

  const value = (data as Record<string, unknown>)[fieldName]
  return typeof value === "string" ? value : null
}

function readDateField(data: unknown, fieldName: string) {
  const value = readStringField(data, fieldName)
  return value ? new Date(value) : null
}

function formatDateKey(date: Date) {
  return date.toISOString().split("T")[0]
}

export async function loadDashboardState(ownerUserId?: string): Promise<unknown | null> {
  if (!isDatabaseConfigured() || !ownerUserId) {
    return null
  }

  const database = requireDatabase()
  const [record] = await database
    .select({
      payload: liveDashboardState.payload,
    })
    .from(liveDashboardState)
    .where(eq(liveDashboardState.ownerUserId, requireOwnerUserId(ownerUserId)))
    .limit(1)

  return record?.payload ?? null
}

export async function saveDashboardState(
  payload: unknown,
  options?: {
    ownerUserId?: string
    sourceModel?: string | null
  }
): Promise<void> {
  const database = requireDatabase()
  const ownerUserId = requireOwnerUserId(options?.ownerUserId)
  const sourceModel = options?.sourceModel ?? readStringField(payload, "sourceModel")

  await database
    .insert(liveDashboardState)
    .values({
      ownerUserId,
      payload,
      sourceModel,
    })
    .onConflictDoUpdate({
      target: liveDashboardState.ownerUserId,
      set: {
        payload,
        sourceModel,
        updatedAt: sql`now()`,
      },
    })
}

export async function archiveSnapshot(
  payload: unknown,
  options?: {
    ownerUserId?: string
    filename?: string
    sourceModel?: string | null
    archivedAt?: Date
  }
): Promise<{ filename: string; dateStr: string }> {
  const database = requireDatabase()
  const ownerUserId = requireOwnerUserId(options?.ownerUserId)
  const archivedAt = options?.archivedAt ?? readDateField(payload, "archivedAt") ?? new Date()
  const dateStr = formatDateKey(archivedAt)
  const filename = options?.filename ?? `market-data-${dateStr}-${archivedAt.getTime()}.json`
  const sourceModel = options?.sourceModel ?? readStringField(payload, "sourceModel")

  await database.insert(intelligenceSnapshots).values({
    ownerUserId,
    filename,
    dateKey: dateStr,
    sourceModel,
    payload,
    archivedAt,
  })

  return {
    filename,
    dateStr,
  }
}

export async function listArchiveSnapshots(
  ownerUserId?: string
): Promise<{ filename: string; date: string }[]> {
  const database = requireDatabase()
  const records = await database
    .select({
      filename: intelligenceSnapshots.filename,
      date: intelligenceSnapshots.dateKey,
    })
    .from(intelligenceSnapshots)
    .where(eq(intelligenceSnapshots.ownerUserId, requireOwnerUserId(ownerUserId)))
    .orderBy(desc(intelligenceSnapshots.archivedAt))

  return records
}

export async function getArchiveSnapshot(
  filename: string,
  ownerUserId?: string
): Promise<{ data: unknown; date: string } | null> {
  const database = requireDatabase()
  const [record] = await database
    .select({
      data: intelligenceSnapshots.payload,
      date: intelligenceSnapshots.dateKey,
    })
    .from(intelligenceSnapshots)
    .where(
      and(
        eq(intelligenceSnapshots.filename, filename),
        eq(intelligenceSnapshots.ownerUserId, requireOwnerUserId(ownerUserId))
      )
    )
    .limit(1)

  return record ?? null
}
