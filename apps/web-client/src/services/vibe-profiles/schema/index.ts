import {
  pgTable,
  text,
  timestamp,
  uuid,
  boolean,
  jsonb,
  pgEnum,
  index,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "@/services/users/schema";

// ============================================================================
// Enums
// ============================================================================
export const vibeEnergyEnum = pgEnum("vibe_energy", [
  "chill",
  "moderate",
  "high",
  "chaotic",
]);

// ============================================================================
// Vibe Profiles Table
// ============================================================================
export const vibeProfiles = pgTable(
  "vibe_profiles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" })
      .unique(),
    // AI-generated vibe card
    vibeName: text("vibe_name").notNull(),
    vibeSummary: text("vibe_summary"),
    energy: vibeEnergyEnum("energy").notNull().default("moderate"),
    // Structured data
    moodTags: text("mood_tags")
      .array()
      .default(sql`'{}'`),
    styleTags: text("style_tags")
      .array()
      .default(sql`'{}'`),
    interestTags: text("interest_tags")
      .array()
      .default(sql`'{}'`),
    quizAnswers: jsonb("quiz_answers").default({}),
    photoUrls: text("photo_urls")
      .array()
      .default(sql`'{}'`),
    // Note: pgvector column managed via raw SQL migration (Drizzle doesn't natively support vector)
    // The `embedding vector(1536)` column exists in the DB but is queried via raw SQL
    // Metadata
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("idx_vibe_profiles_user_id").on(table.userId),
    index("idx_vibe_profiles_energy").on(table.energy),
  ],
);

export type VibeProfile = typeof vibeProfiles.$inferSelect;
export type NewVibeProfile = typeof vibeProfiles.$inferInsert;
