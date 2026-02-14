import { pgTable, text, timestamp, boolean, pgEnum } from "drizzle-orm/pg-core";

export const userGenderEnum = pgEnum("user_gender", [
  "male",
  "female",
  "non-binary",
  "prefer-not-to-say",
]);

export const users = pgTable("users", {
  id: text("id").primaryKey(), // Clerk user ID
  email: text("email").notNull().unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  gender: userGenderEnum("gender"),
  imageUrl: text("image_url"),
  isVerified: boolean("is_verified").default(false).notNull(),
  lastVerifiedAt: timestamp("last_verified_at", { withTimezone: true }),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
