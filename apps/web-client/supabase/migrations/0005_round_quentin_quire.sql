CREATE TABLE "academy_levels" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"min_points" integer DEFAULT 0 NOT NULL,
	"badge_icon" text DEFAULT '🏅' NOT NULL,
	"perks" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "academy_levels_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "academy_rewards" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"cost" integer NOT NULL,
	"category" text DEFAULT 'badge' NOT NULL,
	"icon" text DEFAULT '🎁' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_rewards" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"reward_id" uuid NOT NULL,
	"redeemed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_rewards" ADD CONSTRAINT "user_rewards_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_rewards" ADD CONSTRAINT "user_rewards_reward_id_academy_rewards_id_fk" FOREIGN KEY ("reward_id") REFERENCES "public"."academy_rewards"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_user_rewards_user_id" ON "user_rewards" USING btree ("user_id");