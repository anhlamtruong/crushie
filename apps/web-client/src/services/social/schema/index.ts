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
import { users } from "@/services/users/schema";

// ============================================================================
// Enums
// ============================================================================
export const connectionStatusEnum = pgEnum("connection_status", [
  "pending",
  "accepted",
  "blocked",
]);

export const vouchTagEnum = pgEnum("vouch_tag", [
  "looks_like_photos",
  "safe_vibes",
  "great_conversation",
  "funny",
  "respectful",
  "adventurous",
  "good_listener",
  "creative",
]);

// ============================================================================
// Connections (Social Graph)
// ============================================================================
export const connections = pgTable(
  "connections",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    requesterId: text("requester_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    addresseeId: text("addressee_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    status: connectionStatusEnum("status").notNull().default("pending"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("idx_connections_requester").on(table.requesterId),
    index("idx_connections_addressee").on(table.addresseeId),
    index("idx_connections_status").on(table.status),
  ],
);

export type Connection = typeof connections.$inferSelect;
export type NewConnection = typeof connections.$inferInsert;

// ============================================================================
// Vibe Matches
// ============================================================================
export const vibeMatches = pgTable(
  "vibe_matches",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userAId: text("user_a_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    userBId: text("user_b_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    similarity: doublePrecision("similarity").notNull(),
    compatibility: jsonb("compatibility").default({}),
    isMutual: boolean("is_mutual").default(false).notNull(),
    matchedAt: timestamp("matched_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
  },
  (table) => [
    index("idx_vibe_matches_user_a").on(table.userAId),
    index("idx_vibe_matches_user_b").on(table.userBId),
  ],
);

export type VibeMatch = typeof vibeMatches.$inferSelect;
export type NewVibeMatch = typeof vibeMatches.$inferInsert;

// ============================================================================
// Vibe Vouches (Friend-Filter)
// ============================================================================
export const vibeVouches = pgTable(
  "vibe_vouches",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    voucherId: text("voucher_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    subjectId: text("subject_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    tag: vouchTagEnum("tag").notNull(),
    isAnonymous: boolean("is_anonymous").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("idx_vibe_vouches_subject").on(table.subjectId),
    index("idx_vibe_vouches_voucher").on(table.voucherId),
  ],
);

export type VibeVouch = typeof vibeVouches.$inferSelect;
export type NewVibeVouch = typeof vibeVouches.$inferInsert;

// ============================================================================
// Crush Privacy Cloak
// ============================================================================
export const crushList = pgTable(
  "crush_list",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    crushUserId: text("crush_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("idx_crush_list_user").on(table.userId),
    index("idx_crush_list_crush").on(table.crushUserId),
  ],
);

export type CrushListEntry = typeof crushList.$inferSelect;
export type NewCrushListEntry = typeof crushList.$inferInsert;

// ============================================================================
// Vibe Points Ledger
// ============================================================================
export const vibePointsLedger = pgTable(
  "vibe_points_ledger",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    delta: integer("delta").notNull(),
    reason: text("reason").notNull(),
    referenceId: uuid("reference_id"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("idx_vibe_points_user").on(table.userId),
    index("idx_vibe_points_created").on(table.createdAt),
  ],
);

export type VibePointsEntry = typeof vibePointsLedger.$inferSelect;
export type NewVibePointsEntry = typeof vibePointsLedger.$inferInsert;
