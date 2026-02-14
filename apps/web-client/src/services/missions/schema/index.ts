import {
  pgTable,
  text,
  timestamp,
  uuid,
  boolean,
  doublePrecision,
  jsonb,
  pgEnum,
  integer,
  index,
} from "drizzle-orm/pg-core";
import { vibeMatches } from "@/services/social/schema";
import { users } from "@/services/users/schema";

// ============================================================================
// Enums
// ============================================================================
export const missionTypeEnum = pgEnum("mission_type", [
  "icebreaker",
  "mini_date",
  "adventure",
  "challenge",
]);

export const missionDifficultyEnum = pgEnum("mission_difficulty", [
  "easy",
  "medium",
  "hard",
]);

export const missionInstanceStatusEnum = pgEnum("mission_instance_status", [
  "proposed",
  "accepted",
  "active",
  "completed",
  "expired",
  "declined",
]);

// ============================================================================
// Mission Templates (reusable catalogue)
// ============================================================================
export const missionTemplates = pgTable(
  "mission_templates",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    missionType: missionTypeEnum("mission_type").notNull(),
    difficulty: missionDifficultyEnum("difficulty").notNull().default("easy"),
    // Location / context
    locationQuery: text("location_query"),
    weatherFilter: jsonb("weather_filter").default({}),
    // Gamification
    basePoints: integer("base_points").notNull().default(100),
    durationMin: integer("duration_min").notNull().default(60),
    // Task definition
    objectives: jsonb("objectives").notNull().default([]),
    // AI generation metadata
    generatedBy: text("generated_by"),
    promptHash: text("prompt_hash"),
    // Metadata
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("idx_mission_templates_type").on(table.missionType),
    index("idx_mission_templates_difficulty").on(table.difficulty),
  ],
);

export type MissionTemplate = typeof missionTemplates.$inferSelect;
export type NewMissionTemplate = typeof missionTemplates.$inferInsert;

// ============================================================================
// Mission Instances (per matched pair, per mission)
// ============================================================================
export const missionInstances = pgTable(
  "mission_instances",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    templateId: uuid("template_id")
      .notNull()
      .references(() => missionTemplates.id, { onDelete: "restrict" }),
    matchId: uuid("match_id")
      .notNull()
      .references(() => vibeMatches.id, { onDelete: "cascade" }),
    // Instance-specific overrides
    customTitle: text("custom_title"),
    customObjectives: jsonb("custom_objectives"),
    locationName: text("location_name"),
    locationLat: doublePrecision("location_lat"),
    locationLng: doublePrecision("location_lng"),
    locationPlaceId: text("location_place_id"),
    // State machine
    status: missionInstanceStatusEnum("status").notNull().default("proposed"),
    proposedAt: timestamp("proposed_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    acceptedAt: timestamp("accepted_at", { withTimezone: true }),
    startedAt: timestamp("started_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    // Gamification
    pointsAwarded: integer("points_awarded").default(0),
    partnerDiscount: text("partner_discount"),
    // Checkin verification
    checkinProof: jsonb("checkin_proof").default({}),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("idx_mission_instances_match").on(table.matchId),
    index("idx_mission_instances_status").on(table.status),
    index("idx_mission_instances_template").on(table.templateId),
  ],
);

export type MissionInstance = typeof missionInstances.$inferSelect;
export type NewMissionInstance = typeof missionInstances.$inferInsert;

// ============================================================================
// User Mission Progress
// ============================================================================
export const userMissionProgress = pgTable(
  "user_mission_progress",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    instanceId: uuid("instance_id")
      .notNull()
      .references(() => missionInstances.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    hasAccepted: boolean("has_accepted").default(false).notNull(),
    objectivesDone: jsonb("objectives_done").default([]),
    checkedIn: boolean("checked_in").default(false).notNull(),
    pointsEarned: integer("points_earned").default(0),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("idx_user_mission_progress_user").on(table.userId),
    index("idx_user_mission_progress_instance").on(table.instanceId),
  ],
);

export type UserMissionProgress = typeof userMissionProgress.$inferSelect;
export type NewUserMissionProgress = typeof userMissionProgress.$inferInsert;
