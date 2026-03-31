CREATE TABLE "user_integrations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_user_id" text NOT NULL,
	"provider" text NOT NULL,
	"encrypted_config" text NOT NULL,
	"encryption_iv" text NOT NULL,
	"encryption_auth_tag" text NOT NULL,
	"masked_summary" jsonb NOT NULL,
	"connection_state" text DEFAULT 'saved' NOT NULL,
	"last_validated_at" timestamp with time zone,
	"last_error" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_integrations" ADD CONSTRAINT "user_integrations_owner_user_id_user_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "user_integrations_owner_provider_idx" ON "user_integrations" USING btree ("owner_user_id","provider");--> statement-breakpoint
CREATE INDEX "user_integrations_owner_idx" ON "user_integrations" USING btree ("owner_user_id");