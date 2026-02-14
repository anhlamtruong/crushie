-- Migration: Profile evolution + verification trust fields
-- Source of truth: apps/web-client/supabase/migrations

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'gender_identity') THEN
    CREATE TYPE gender_identity AS ENUM (
      'male',
      'female',
      'non-binary',
      'prefer-not-to-say'
    );
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'interested_in') THEN
    CREATE TYPE interested_in AS ENUM (
      'male',
      'female',
      'non-binary',
      'everyone'
    );
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_gender') THEN
    CREATE TYPE user_gender AS ENUM (
      'male',
      'female',
      'non-binary',
      'prefer-not-to-say'
    );
  END IF;
END$$;

ALTER TABLE "vibe_profiles"
  ADD COLUMN IF NOT EXISTS "bio" text,
  ADD COLUMN IF NOT EXISTS "gender" gender_identity,
  ADD COLUMN IF NOT EXISTS "interested_in" interested_in;

ALTER TABLE "users"
  ADD COLUMN IF NOT EXISTS "gender" user_gender,
  ADD COLUMN IF NOT EXISTS "is_verified" boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "last_verified_at" timestamp with time zone;

ALTER TABLE "verifications"
  ADD COLUMN IF NOT EXISTS "last_verified_at" timestamp with time zone;
