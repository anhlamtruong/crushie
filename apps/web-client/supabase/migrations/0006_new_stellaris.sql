CREATE TABLE "direct_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"match_id" uuid NOT NULL,
	"sender_id" text NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "direct_messages" ADD CONSTRAINT "direct_messages_match_id_vibe_matches_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."vibe_matches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "direct_messages" ADD CONSTRAINT "direct_messages_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_dm_match_id" ON "direct_messages" USING btree ("match_id");--> statement-breakpoint
CREATE INDEX "idx_dm_created_at" ON "direct_messages" USING btree ("match_id","created_at");