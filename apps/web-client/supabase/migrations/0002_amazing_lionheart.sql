ALTER TABLE "analyzer_sessions" ADD COLUMN "city" text;--> statement-breakpoint
ALTER TABLE "analyzer_sessions" ADD COLUMN "weather_context" jsonb;--> statement-breakpoint
ALTER TABLE "analyzer_sessions" ADD COLUMN "location_context" jsonb;--> statement-breakpoint
ALTER TABLE "analyzer_sessions" ADD COLUMN "nearby_places" jsonb DEFAULT '[]'::jsonb;