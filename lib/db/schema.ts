import {
  boolean,
  integer,
  index,
  jsonb,
  numeric,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core"

export const users = pgTable(
  "user",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    emailVerified: boolean("email_verified").notNull().default(false),
    image: text("image"),
    role: text("role").notNull().default("user"),
    banned: boolean("banned"),
    banReason: text("ban_reason"),
    banExpires: timestamp("ban_expires", { mode: "date", withTimezone: true }),
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    emailUniqueIdx: uniqueIndex("user_email_idx").on(table.email),
  })
)

export const sessions = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    token: text("token").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at", { mode: "date", withTimezone: true }).notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    impersonatedBy: text("impersonated_by"),
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    tokenUniqueIdx: uniqueIndex("session_token_idx").on(table.token),
    userIdx: index("session_user_idx").on(table.userId),
  })
)

export const accounts = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", {
      mode: "date",
      withTimezone: true,
    }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", {
      mode: "date",
      withTimezone: true,
    }),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    providerAccountUniqueIdx: uniqueIndex("account_provider_account_idx").on(
      table.providerId,
      table.accountId
    ),
    userIdx: index("account_user_idx").on(table.userId),
  })
)

export const verifications = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at", { mode: "date", withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    identifierIdx: index("verification_identifier_idx").on(table.identifier),
  })
)

export const liveDashboardState = pgTable("live_dashboard_state", {
  ownerUserId: text("owner_user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  payload: jsonb("payload").$type<unknown>().notNull(),
  sourceModel: text("source_model"),
  updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true }).notNull().defaultNow(),
})

export const intelligenceSnapshots = pgTable(
  "intelligence_snapshots",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    ownerUserId: text("owner_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    filename: text("filename").notNull(),
    dateKey: text("date_key").notNull(),
    sourceModel: text("source_model"),
    payload: jsonb("payload").$type<unknown>().notNull(),
    archivedAt: timestamp("archived_at", { mode: "date", withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    ownerArchivedAtIdx: index("intelligence_snapshots_owner_archived_at_idx").on(
      table.ownerUserId,
      table.archivedAt
    ),
    filenameUniqueIdx: uniqueIndex("intelligence_snapshots_filename_idx").on(table.filename),
  })
)

export const stocks = pgTable(
  "stocks",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    symbol: text("symbol").notNull(),
    companyName: text("company_name").notNull(),
    exchange: text("exchange").notNull().default("NSE"),
    sector: text("sector"),
    metadata: jsonb("metadata").$type<Record<string, unknown> | null>(),
    updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    symbolUniqueIdx: uniqueIndex("stocks_symbol_idx").on(table.symbol),
  })
)

export const watchlists = pgTable(
  "watchlists",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    ownerUserId: text("owner_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    ownerNameUniqueIdx: uniqueIndex("watchlists_owner_name_idx").on(table.ownerUserId, table.name),
  })
)

export const sharedWatchlistItems = pgTable(
  "shared_watchlist_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    exchange: text("exchange").notNull().default("NSE"),
    symbol: text("symbol").notNull(),
    displayName: text("display_name").notNull(),
    instrumentToken: integer("instrument_token").notNull(),
    notes: text("notes"),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    exchangeSymbolUniqueIdx: uniqueIndex("shared_watchlist_exchange_symbol_idx").on(
      table.exchange,
      table.symbol
    ),
    instrumentTokenUniqueIdx: uniqueIndex("shared_watchlist_instrument_token_idx").on(
      table.instrumentToken
    ),
    sortOrderIdx: index("shared_watchlist_sort_order_idx").on(table.sortOrder),
  })
)

export const userIntegrations = pgTable(
  "user_integrations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    ownerUserId: text("owner_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    provider: text("provider").notNull(),
    encryptedConfig: text("encrypted_config").notNull(),
    encryptionIv: text("encryption_iv").notNull(),
    encryptionAuthTag: text("encryption_auth_tag").notNull(),
    maskedSummary: jsonb("masked_summary").$type<Record<string, string>>().notNull(),
    connectionState: text("connection_state").notNull().default("saved"),
    lastValidatedAt: timestamp("last_validated_at", { mode: "date", withTimezone: true }),
    lastError: text("last_error"),
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    ownerProviderUniqueIdx: uniqueIndex("user_integrations_owner_provider_idx").on(
      table.ownerUserId,
      table.provider
    ),
    ownerIdx: index("user_integrations_owner_idx").on(table.ownerUserId),
  })
)

export const watchlistItems = pgTable(
  "watchlist_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    watchlistId: uuid("watchlist_id")
      .notNull()
      .references(() => watchlists.id, { onDelete: "cascade" }),
    stockId: uuid("stock_id")
      .notNull()
      .references(() => stocks.id, { onDelete: "cascade" }),
    notes: text("notes"),
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    watchlistStockUniqueIdx: uniqueIndex("watchlist_items_watchlist_stock_idx").on(
      table.watchlistId,
      table.stockId
    ),
  })
)

export const portfolioHoldings = pgTable(
  "portfolio_holdings",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    ownerUserId: text("owner_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    stockId: uuid("stock_id")
      .notNull()
      .references(() => stocks.id, { onDelete: "restrict" }),
    quantity: numeric("quantity", { precision: 18, scale: 4 }).notNull().default("0"),
    averageCost: numeric("average_cost", { precision: 18, scale: 4 }).notNull().default("0"),
    updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    ownerStockUniqueIdx: uniqueIndex("portfolio_holdings_owner_stock_idx").on(
      table.ownerUserId,
      table.stockId
    ),
  })
)
