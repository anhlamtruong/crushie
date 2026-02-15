import {
  pgTable,
  text,
  timestamp,
  uuid,
  integer,
  jsonb,
  pgEnum,
  index,
} from "drizzle-orm/pg-core";
import { users } from "@/services/users/schema";

export const academyMissionTypeEnum = pgEnum("academy_mission_type", [
  "solo_practice",
  "live_quest",
]);

export const academyMissionStatusEnum = pgEnum("academy_mission_status", [
  "available",
  "in_progress",
  "completed",
]);

export const userStats = pgTable(
  "user_stats",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" })
      .unique(),
    siqScore: integer("siq_score").notNull().default(0),
    initiation: integer("initiation").notNull().default(0),
    empathy: integer("empathy").notNull().default(0),
    planning: integer("planning").notNull().default(0),
    consistency: integer("consistency").notNull().default(0),
    personaNarrative: text("persona_narrative"),
    personaUpdatedAt: timestamp("persona_updated_at", { withTimezone: true }),
    lastGradedAt: timestamp("last_graded_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index("idx_user_stats_user").on(table.userId)],
);

export const academyMissions = pgTable(
  "academy_missions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    missionType: academyMissionTypeEnum("mission_type").notNull(),
    status: academyMissionStatusEnum("status").notNull().default("available"),
    title: text("title").notNull(),
    description: text("description"),
    targetSkill: text("target_skill"),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("idx_academy_missions_user").on(table.userId),
    index("idx_academy_missions_status").on(table.status),
    index("idx_academy_missions_type").on(table.missionType),
  ],
);

export const interactionGrades = pgTable(
  "interaction_grades",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    missionId: uuid("mission_id").references(() => academyMissions.id, {
      onDelete: "set null",
    }),
    targetVibeLabel: text("target_vibe_label").notNull(),
    transcript: jsonb("transcript").notNull().default([]),
    siqDelta: integer("siq_delta").notNull().default(0),
    initiationDelta: integer("initiation_delta").notNull().default(0),
    empathyDelta: integer("empathy_delta").notNull().default(0),
    planningDelta: integer("planning_delta").notNull().default(0),
    consistencyDelta: integer("consistency_delta").notNull().default(0),
    feedbackSummary: text("feedback_summary").notNull(),
    skillMetrics: jsonb("skill_metrics").notNull().default({}),
    llmMeta: jsonb("llm_meta").notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("idx_interaction_grades_user").on(table.userId),
    index("idx_interaction_grades_mission").on(table.missionId),
    index("idx_interaction_grades_created").on(table.createdAt),
  ],
);

export type UserStat = typeof userStats.$inferSelect;
export type NewUserStat = typeof userStats.$inferInsert;

export type AcademyMission = typeof academyMissions.$inferSelect;
export type NewAcademyMission = typeof academyMissions.$inferInsert;

export type InteractionGrade = typeof interactionGrades.$inferSelect;
export type NewInteractionGrade = typeof interactionGrades.$inferInsert;
