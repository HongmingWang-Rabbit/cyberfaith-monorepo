import { pgTable, idColumn, timestampColumns, varchar, text, integer, boolean, jsonb } from "@cyberfaith/db-utils";

export const users = pgTable("users", {
  id: idColumn(),
  ...timestampColumns(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  googleId: varchar("google_id", { length: 255 }).unique(),
  passwordHash: text("password_hash"),
  avatarUrl: text("avatar_url"),
  isActive: boolean("is_active").default(true).notNull(),
});

export const points = pgTable("points", {
  id: idColumn(),
  ...timestampColumns(),
  userId: varchar("user_id", { length: 36 }).notNull(),
  amount: integer("amount").notNull(),
  reason: text("reason").notNull(),
});

export const readings = pgTable("readings", {
  id: idColumn(),
  ...timestampColumns(),
  userId: varchar("user_id", { length: 36 }).notNull(),
  type: varchar("type", { length: 20 }).notNull(), // mbti|tarot|i-ching|four-pillars|zodiac
  input: jsonb("input"),
  result: jsonb("result"),
  locale: varchar("locale", { length: 10 }),
});

export const achievements = pgTable("achievements", {
  id: idColumn(),
  ...timestampColumns(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description").notNull(),
  iconUrl: text("icon_url"),
  requiredPoints: integer("required_points").notNull().default(0),
});
