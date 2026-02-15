/**
 * Academy — Drizzle Schema
 *
 * Levels, rewards, and user-reward redemptions.
 */
import {
  pgTable,
  text,
  timestamp,
  uuid,
  boolean,
  integer,
  jsonb,
  serial,
  index,
} from "drizzle-orm/pg-core";
import { users } from "@/services/users/schema";

// ============================================================================
// Academy Levels (Bronze → Platinum)
// ============================================================================
export const academyLevels = pgTable("academy_levels", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  minPoints: integer("min_points").notNull().default(0),
  badgeIcon: text("badge_icon").notNull().default("🏅"),
  perks: jsonb("perks").default([]),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export type AcademyLevel = typeof academyLevels.$inferSelect;

// ============================================================================
// Academy Rewards (redeemable items)
// ============================================================================
export const academyRewards = pgTable("academy_rewards", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  cost: integer("cost").notNull(),
  category: text("category").notNull().default("badge"),
  icon: text("icon").notNull().default("🎁"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export type AcademyReward = typeof academyRewards.$inferSelect;

// ============================================================================
// User Rewards (redeemed tracker)
// ============================================================================
export const userRewards = pgTable(
  "user_rewards",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    rewardId: uuid("reward_id")
      .notNull()
      .references(() => academyRewards.id, { onDelete: "cascade" }),
    redeemedAt: timestamp("redeemed_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index("idx_user_rewards_user_id").on(table.userId)],
);

export type UserReward = typeof userRewards.$inferSelect;
export type NewUserReward = typeof userRewards.$inferInsert;
