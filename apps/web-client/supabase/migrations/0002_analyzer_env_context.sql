-- Migration: Add environmental context columns to analyzer_sessions
-- Stores city name (privacy: no raw coords), weather snapshot, and nearby places

ALTER TABLE "analyzer_sessions"
  ADD COLUMN IF NOT EXISTS "city"              text,
  ADD COLUMN IF NOT EXISTS "weather_context"   jsonb,
  ADD COLUMN IF NOT EXISTS "location_context"  jsonb,
  ADD COLUMN IF NOT EXISTS "nearby_places"     jsonb DEFAULT '[]';
