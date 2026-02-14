CREATE TYPE "public"."vibe_energy" AS ENUM('chill', 'moderate', 'high', 'chaotic');--> statement-breakpoint
CREATE TYPE "public"."connection_status" AS ENUM('pending', 'accepted', 'blocked');--> statement-breakpoint
CREATE TYPE "public"."vouch_tag" AS ENUM('looks_like_photos', 'safe_vibes', 'great_conversation', 'funny', 'respectful', 'adventurous', 'good_listener', 'creative');--> statement-breakpoint
CREATE TYPE "public"."mission_difficulty" AS ENUM('easy', 'medium', 'hard');--> statement-breakpoint
CREATE TYPE "public"."mission_instance_status" AS ENUM('proposed', 'accepted', 'active', 'completed', 'expired', 'declined');--> statement-breakpoint
CREATE TYPE "public"."mission_type" AS ENUM('icebreaker', 'mini_date', 'adventure', 'challenge');--> statement-breakpoint
CREATE TYPE "public"."analyzer_style" AS ENUM('direct', 'playful', 'intellectual', 'shy', 'adventurous');--> statement-breakpoint
CREATE TYPE "public"."verification_status" AS ENUM('pending', 'verified', 'rejected', 'expired');--> statement-breakpoint
CREATE TYPE "public"."verification_type" AS ENUM('selfie_liveness', 'photo_match', 'phone', 'social_vouch');--> statement-breakpoint
CREATE TABLE "vibe_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"vibe_name" text NOT NULL,
	"vibe_summary" text,
	"energy" "vibe_energy" DEFAULT 'moderate' NOT NULL,
	"mood_tags" text[] DEFAULT '{}',
	"style_tags" text[] DEFAULT '{}',
	"interest_tags" text[] DEFAULT '{}',
	"quiz_answers" jsonb DEFAULT '{}'::jsonb,
	"photo_urls" text[] DEFAULT '{}',
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "vibe_profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "connections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"requester_id" text NOT NULL,
	"addressee_id" text NOT NULL,
	"status" "connection_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "crush_list" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"crush_user_id" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vibe_matches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_a_id" text NOT NULL,
	"user_b_id" text NOT NULL,
	"similarity" double precision NOT NULL,
	"compatibility" jsonb DEFAULT '{}'::jsonb,
	"is_mutual" boolean DEFAULT false NOT NULL,
	"matched_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "vibe_points_ledger" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"delta" integer NOT NULL,
	"reason" text NOT NULL,
	"reference_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vibe_vouches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"voucher_id" text NOT NULL,
	"subject_id" text NOT NULL,
	"tag" "vouch_tag" NOT NULL,
	"is_anonymous" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mission_instances" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"template_id" uuid NOT NULL,
	"match_id" uuid NOT NULL,
	"custom_title" text,
	"custom_objectives" jsonb,
	"location_name" text,
	"location_lat" double precision,
	"location_lng" double precision,
	"location_place_id" text,
	"status" "mission_instance_status" DEFAULT 'proposed' NOT NULL,
	"proposed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"accepted_at" timestamp with time zone,
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"expires_at" timestamp with time zone,
	"points_awarded" integer DEFAULT 0,
	"partner_discount" text,
	"checkin_proof" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mission_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"mission_type" "mission_type" NOT NULL,
	"difficulty" "mission_difficulty" DEFAULT 'easy' NOT NULL,
	"location_query" text,
	"weather_filter" jsonb DEFAULT '{}'::jsonb,
	"base_points" integer DEFAULT 100 NOT NULL,
	"duration_min" integer DEFAULT 60 NOT NULL,
	"objectives" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"generated_by" text,
	"prompt_hash" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_mission_progress" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"instance_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"has_accepted" boolean DEFAULT false NOT NULL,
	"objectives_done" jsonb DEFAULT '[]'::jsonb,
	"checked_in" boolean DEFAULT false NOT NULL,
	"points_earned" integer DEFAULT 0,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "analyzer_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"image_hash" text NOT NULL,
	"hint_tags" text[] DEFAULT '{}',
	"predicted_style" "analyzer_style",
	"vibe_prediction" jsonb DEFAULT '{}'::jsonb,
	"conversation_openers" text[] DEFAULT '{}',
	"date_suggestions" jsonb DEFAULT '[]'::jsonb,
	"model_version" text,
	"latency_ms" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "verifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"type" "verification_type" NOT NULL,
	"status" "verification_status" DEFAULT 'pending' NOT NULL,
	"proof_hash" text,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"requested_at" timestamp with time zone DEFAULT now() NOT NULL,
	"verified_at" timestamp with time zone,
	"expires_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "vibe_profiles" ADD CONSTRAINT "vibe_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "connections" ADD CONSTRAINT "connections_requester_id_users_id_fk" FOREIGN KEY ("requester_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "connections" ADD CONSTRAINT "connections_addressee_id_users_id_fk" FOREIGN KEY ("addressee_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crush_list" ADD CONSTRAINT "crush_list_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crush_list" ADD CONSTRAINT "crush_list_crush_user_id_users_id_fk" FOREIGN KEY ("crush_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vibe_matches" ADD CONSTRAINT "vibe_matches_user_a_id_users_id_fk" FOREIGN KEY ("user_a_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vibe_matches" ADD CONSTRAINT "vibe_matches_user_b_id_users_id_fk" FOREIGN KEY ("user_b_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vibe_points_ledger" ADD CONSTRAINT "vibe_points_ledger_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vibe_vouches" ADD CONSTRAINT "vibe_vouches_voucher_id_users_id_fk" FOREIGN KEY ("voucher_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vibe_vouches" ADD CONSTRAINT "vibe_vouches_subject_id_users_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mission_instances" ADD CONSTRAINT "mission_instances_template_id_mission_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."mission_templates"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mission_instances" ADD CONSTRAINT "mission_instances_match_id_vibe_matches_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."vibe_matches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_mission_progress" ADD CONSTRAINT "user_mission_progress_instance_id_mission_instances_id_fk" FOREIGN KEY ("instance_id") REFERENCES "public"."mission_instances"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_mission_progress" ADD CONSTRAINT "user_mission_progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "analyzer_sessions" ADD CONSTRAINT "analyzer_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "verifications" ADD CONSTRAINT "verifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_vibe_profiles_user_id" ON "vibe_profiles" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_vibe_profiles_energy" ON "vibe_profiles" USING btree ("energy");--> statement-breakpoint
CREATE INDEX "idx_connections_requester" ON "connections" USING btree ("requester_id");--> statement-breakpoint
CREATE INDEX "idx_connections_addressee" ON "connections" USING btree ("addressee_id");--> statement-breakpoint
CREATE INDEX "idx_connections_status" ON "connections" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_crush_list_user" ON "crush_list" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_crush_list_crush" ON "crush_list" USING btree ("crush_user_id");--> statement-breakpoint
CREATE INDEX "idx_vibe_matches_user_a" ON "vibe_matches" USING btree ("user_a_id");--> statement-breakpoint
CREATE INDEX "idx_vibe_matches_user_b" ON "vibe_matches" USING btree ("user_b_id");--> statement-breakpoint
CREATE INDEX "idx_vibe_points_user" ON "vibe_points_ledger" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_vibe_points_created" ON "vibe_points_ledger" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_vibe_vouches_subject" ON "vibe_vouches" USING btree ("subject_id");--> statement-breakpoint
CREATE INDEX "idx_vibe_vouches_voucher" ON "vibe_vouches" USING btree ("voucher_id");--> statement-breakpoint
CREATE INDEX "idx_mission_instances_match" ON "mission_instances" USING btree ("match_id");--> statement-breakpoint
CREATE INDEX "idx_mission_instances_status" ON "mission_instances" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_mission_instances_template" ON "mission_instances" USING btree ("template_id");--> statement-breakpoint
CREATE INDEX "idx_mission_templates_type" ON "mission_templates" USING btree ("mission_type");--> statement-breakpoint
CREATE INDEX "idx_mission_templates_difficulty" ON "mission_templates" USING btree ("difficulty");--> statement-breakpoint
CREATE INDEX "idx_user_mission_progress_user" ON "user_mission_progress" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_user_mission_progress_instance" ON "user_mission_progress" USING btree ("instance_id");--> statement-breakpoint
CREATE INDEX "idx_analyzer_sessions_user" ON "analyzer_sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_verifications_user" ON "verifications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_verifications_status" ON "verifications" USING btree ("status");