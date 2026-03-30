CREATE TABLE "shared_watchlist_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"exchange" text DEFAULT 'NSE' NOT NULL,
	"symbol" text NOT NULL,
	"display_name" text NOT NULL,
	"instrument_token" integer NOT NULL,
	"notes" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "shared_watchlist_exchange_symbol_idx" ON "shared_watchlist_items" USING btree ("exchange","symbol");--> statement-breakpoint
CREATE UNIQUE INDEX "shared_watchlist_instrument_token_idx" ON "shared_watchlist_items" USING btree ("instrument_token");--> statement-breakpoint
CREATE INDEX "shared_watchlist_sort_order_idx" ON "shared_watchlist_items" USING btree ("sort_order");