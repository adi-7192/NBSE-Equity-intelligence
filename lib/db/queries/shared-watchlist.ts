import { asc, eq, sql } from "drizzle-orm"
import { requireDatabase } from "../index"
import { sharedWatchlistItems } from "../schema"
import type { ExchangeCode, SharedWatchlistInstrument } from "@/lib/live-market/contracts"

function normalizeExchange(exchange: string): ExchangeCode {
  return exchange.toUpperCase() === "BSE" ? "BSE" : "NSE"
}

function normalizeSymbol(symbol: string) {
  const value = symbol.trim().toUpperCase()
  if (!value) {
    throw new Error("Symbol is required.")
  }

  return value
}

function normalizeDisplayName(displayName: string, symbol: string) {
  const value = displayName.trim()
  return value.length > 0 ? value : symbol
}

function normalizeInstrumentToken(instrumentToken: number) {
  if (!Number.isInteger(instrumentToken) || instrumentToken <= 0) {
    throw new Error("Instrument token must be a positive integer.")
  }

  return instrumentToken
}

function mapRecord(record: {
  id: string
  exchange: string
  symbol: string
  displayName: string
  instrumentToken: number
  notes: string | null
  sortOrder: number
  createdAt: Date
  updatedAt: Date
}): SharedWatchlistInstrument {
  return {
    id: record.id,
    exchange: normalizeExchange(record.exchange),
    symbol: record.symbol,
    displayName: record.displayName,
    instrumentToken: record.instrumentToken,
    notes: record.notes,
    sortOrder: record.sortOrder,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  }
}

export async function listSharedWatchlistItems(): Promise<SharedWatchlistInstrument[]> {
  const database = requireDatabase()
  const records = await database
    .select()
    .from(sharedWatchlistItems)
    .orderBy(asc(sharedWatchlistItems.sortOrder), asc(sharedWatchlistItems.displayName))

  return records.map(mapRecord)
}

export async function addSharedWatchlistItem(input: {
  exchange: string
  symbol: string
  displayName: string
  instrumentToken: number
  notes?: string | null
  sortOrder?: number
}): Promise<SharedWatchlistInstrument> {
  const database = requireDatabase()
  const symbol = normalizeSymbol(input.symbol)
  const exchange = normalizeExchange(input.exchange)
  const instrumentToken = normalizeInstrumentToken(input.instrumentToken)
  const displayName = normalizeDisplayName(input.displayName, symbol)
  const notes = input.notes?.trim() ? input.notes.trim() : null

  let sortOrder = input.sortOrder
  if (sortOrder === undefined) {
    const [result] = await database
      .select({
        value: sql<number>`coalesce(max(${sharedWatchlistItems.sortOrder}), -1)`,
      })
      .from(sharedWatchlistItems)

    sortOrder = Number(result?.value ?? -1) + 1
  }

  const [record] = await database
    .insert(sharedWatchlistItems)
    .values({
      exchange,
      symbol,
      displayName,
      instrumentToken,
      notes,
      sortOrder,
    })
    .returning()

  return mapRecord(record)
}

export async function removeSharedWatchlistItem(id: string): Promise<void> {
  const database = requireDatabase()
  await database.delete(sharedWatchlistItems).where(eq(sharedWatchlistItems.id, id))
}

export async function reorderSharedWatchlistItems(itemIds: string[]): Promise<void> {
  const database = requireDatabase()
  await database.transaction(async (tx) => {
    for (const [index, id] of itemIds.entries()) {
      await tx
        .update(sharedWatchlistItems)
        .set({
          sortOrder: index,
          updatedAt: new Date(),
        })
        .where(eq(sharedWatchlistItems.id, id))
    }
  })
}
