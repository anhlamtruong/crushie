/**
 * Direct Messages (Chat) — Drizzle Schema
 */
import { pgTable, text, timestamp, uuid, index } from "drizzle-orm/pg-core";
import { users } from "@/services/users/schema";
import { vibeMatches } from "@/services/social/schema";

export const directMessages = pgTable(
  "direct_messages",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    matchId: uuid("match_id")
      .notNull()
      .references(() => vibeMatches.id, { onDelete: "cascade" }),
    senderId: text("sender_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("idx_dm_match_id").on(table.matchId),
    index("idx_dm_created_at").on(table.matchId, table.createdAt),
  ],
);

export type DirectMessage = typeof directMessages.$inferSelect;
export type NewDirectMessage = typeof directMessages.$inferInsert;
