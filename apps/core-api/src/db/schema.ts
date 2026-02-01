import { pgTable, idColumn, timestampColumns, varchar, text, integer, boolean, jsonb, uniqueIndex } from "@cyberfaith/db-utils";

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

export const pointsTransactions = pgTable("points_transactions", {
  id: idColumn(),
  ...timestampColumns(),
  userId: varchar("user_id", { length: 36 }).notNull(),
  amount: integer("amount").notNull(),
  reason: varchar("reason", { length: 50 }).notNull(), // reading_completed|achievement_unlocked|daily_login|streak_bonus
  metadata: jsonb("metadata"),
});

// Keep old alias for backward compat
export const points = pointsTransactions;

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
  name: varchar("name", { length: 255 }).notNull().unique(),
  description: text("description").notNull(),
  icon: varchar("icon", { length: 100 }),
  category: varchar("category", { length: 50 }),
  requirement: jsonb("requirement"),
  pointsReward: integer("points_reward").notNull().default(0),
});

export const userAchievements = pgTable("user_achievements", {
  id: idColumn(),
  userId: varchar("user_id", { length: 36 }).notNull(),
  achievementId: varchar("achievement_id", { length: 36 }).notNull(),
  unlockedAt: timestampColumns().createdAt,
}, (table) => ({
  uniqueUserAchievement: uniqueIndex("user_achievement_unique").on(table.userId, table.achievementId),
}));
