CREATE TYPE "public"."academy_mission_status" AS ENUM('available', 'in_progress', 'completed');--> statement-breakpoint
CREATE TYPE "public"."academy_mission_type" AS ENUM('solo_practice', 'live_quest');--> statement-breakpoint
CREATE TABLE "academy_missions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"mission_type" "academy_mission_type" NOT NULL,
	"status" "academy_mission_status" DEFAULT 'available' NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"target_skill" text,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "interaction_grades" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"mission_id" uuid,
	"target_vibe_label" text NOT NULL,
	"transcript" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"siq_delta" integer DEFAULT 0 NOT NULL,
	"initiation_delta" integer DEFAULT 0 NOT NULL,
	"empathy_delta" integer DEFAULT 0 NOT NULL,
	"planning_delta" integer DEFAULT 0 NOT NULL,
	"consistency_delta" integer DEFAULT 0 NOT NULL,
	"feedback_summary" text NOT NULL,
	"skill_metrics" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"llm_meta" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_stats" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"siq_score" integer DEFAULT 0 NOT NULL,
	"initiation" integer DEFAULT 0 NOT NULL,
	"empathy" integer DEFAULT 0 NOT NULL,
	"planning" integer DEFAULT 0 NOT NULL,
	"consistency" integer DEFAULT 0 NOT NULL,
	"persona_narrative" text,
	"persona_updated_at" timestamp with time zone,
	"last_graded_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_stats_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "academy_missions" ADD CONSTRAINT "academy_missions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interaction_grades" ADD CONSTRAINT "interaction_grades_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interaction_grades" ADD CONSTRAINT "interaction_grades_mission_id_academy_missions_id_fk" FOREIGN KEY ("mission_id") REFERENCES "public"."academy_missions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_stats" ADD CONSTRAINT "user_stats_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_academy_missions_user" ON "academy_missions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_academy_missions_status" ON "academy_missions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_academy_missions_type" ON "academy_missions" USING btree ("mission_type");--> statement-breakpoint
CREATE INDEX "idx_interaction_grades_user" ON "interaction_grades" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_interaction_grades_mission" ON "interaction_grades" USING btree ("mission_id");--> statement-breakpoint
CREATE INDEX "idx_interaction_grades_created" ON "interaction_grades" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_user_stats_user" ON "user_stats" USING btree ("user_id");