CREATE TYPE "public"."user_gender" AS ENUM('male', 'female', 'non-binary', 'prefer-not-to-say');--> statement-breakpoint
CREATE TYPE "public"."gender_identity" AS ENUM('male', 'female', 'non-binary', 'prefer-not-to-say');--> statement-breakpoint
CREATE TYPE "public"."interested_in" AS ENUM('male', 'female', 'non-binary', 'everyone');--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "gender" "user_gender";--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "is_verified" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "last_verified_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "vibe_profiles" ADD COLUMN "bio" text;--> statement-breakpoint
ALTER TABLE "vibe_profiles" ADD COLUMN "gender" "gender_identity";--> statement-breakpoint
ALTER TABLE "vibe_profiles" ADD COLUMN "interested_in" "interested_in";--> statement-breakpoint
ALTER TABLE "verifications" ADD COLUMN "last_verified_at" timestamp with time zone;