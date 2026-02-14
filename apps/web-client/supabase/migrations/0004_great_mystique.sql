CREATE TABLE "match_plan_cache" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"match_id" uuid NOT NULL,
	"mission_instance_id" uuid,
	"plan" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"generated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "match_plan_cache_match_id_unique" UNIQUE("match_id")
);
--> statement-breakpoint
ALTER TABLE "match_plan_cache" ADD CONSTRAINT "match_plan_cache_match_id_vibe_matches_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."vibe_matches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_match_plan_cache_match" ON "match_plan_cache" USING btree ("match_id");--> statement-breakpoint
CREATE INDEX "idx_match_plan_cache_expires" ON "match_plan_cache" USING btree ("expires_at");