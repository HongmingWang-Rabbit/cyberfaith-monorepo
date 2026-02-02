import { pgTable, idColumn, timestampColumns, varchar, text, integer, boolean, jsonb, uniqueIndex, timestamp } from "@cyberfaith/db-utils";
import { pgEnum, uuid } from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["user", "admin"]);

export const users = pgTable("users", {
  id: idColumn(),
  ...timestampColumns(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  googleId: varchar("google_id", { length: 255 }).unique(),
  passwordHash: text("password_hash"),
  avatarUrl: text("avatar_url"),
  isActive: boolean("is_active").default(true).notNull(),
  subscriptionTier: varchar("subscription_tier", { length: 20 }).default("free").notNull(),
  stripeCustomerId: varchar("stripe_customer_id", { length: 255 }),
  stripeSubscriptionId: varchar("stripe_subscription_id", { length: 255 }),
  emailNotifications: boolean("email_notifications").default(true).notNull(),
  role: userRoleEnum("role").default("user").notNull(),
  zodiacSign: varchar("zodiac_sign", { length: 20 }),
  referralCode: varchar("referral_code", { length: 20 }).unique(),
  premiumUntil: timestamp("premium_until"),
  karma: integer("karma").default(0).notNull(),
  username: varchar("username", { length: 50 }).unique(),
  deletedAt: timestamp("deleted_at"),
});

export const userSettings = pgTable("user_settings", {
  id: idColumn(),
  ...timestampColumns(),
  userId: varchar("user_id", { length: 36 }).notNull().unique(),
  displayName: varchar("display_name", { length: 255 }),
  mbtiType: varchar("mbti_type", { length: 4 }),
  notificationEmailDigest: boolean("notification_email_digest").default(true).notNull(),
  notificationPush: boolean("notification_push").default(true).notNull(),
  notificationStreakReminders: boolean("notification_streak_reminders").default(true).notNull(),
  theme: varchar("theme", { length: 10 }).default("dark").notNull(),
  language: varchar("language", { length: 5 }).default("en").notNull(),
  privacyProfileVisible: boolean("privacy_profile_visible").default(true).notNull(),
  privacyReadingVisible: boolean("privacy_reading_visible").default(true).notNull(),
});

export const referralStatusEnum = pgEnum("referral_status", ["pending", "completed"]);

export const referrals = pgTable("referrals", {
  id: idColumn(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  referrerId: varchar("referrer_id", { length: 36 }).notNull(),
  referredUserId: varchar("referred_user_id", { length: 36 }).notNull(),
  code: varchar("code", { length: 20 }).notNull(),
  status: referralStatusEnum("status").default("pending").notNull(),
  karmaAwarded: integer("karma_awarded").default(0).notNull(),
  premiumDaysAwarded: integer("premium_days_awarded").default(0).notNull(),
});

export const giftReadings = pgTable("gift_readings", {
  id: idColumn(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  senderId: varchar("sender_id", { length: 36 }).notNull(),
  recipientEmail: varchar("recipient_email", { length: 255 }),
  recipientUserId: varchar("recipient_user_id", { length: 36 }),
  readingType: varchar("reading_type", { length: 20 }).notNull(),
  message: text("message"),
  redeemCode: varchar("redeem_code", { length: 36 }).notNull().unique(),
  redeemed: boolean("redeemed").default(false).notNull(),
  redeemedAt: timestamp("redeemed_at"),
  redeemedByUserId: varchar("redeemed_by_user_id", { length: 36 }),
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
  isPublic: boolean("is_public").default(false).notNull(),
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

export const readingReactions = pgTable("reading_reactions", {
  id: idColumn(),
  ...timestampColumns(),
  readingId: varchar("reading_id", { length: 36 }).notNull(),
  userId: varchar("user_id", { length: 36 }).notNull(),
  emoji: varchar("emoji", { length: 10 }).notNull(),
}, (table) => ({
  uniqueReaction: uniqueIndex("reading_reaction_unique").on(table.readingId, table.userId, table.emoji),
}));

export const userAchievements = pgTable("user_achievements", {
  id: idColumn(),
  userId: varchar("user_id", { length: 36 }).notNull(),
  achievementId: varchar("achievement_id", { length: 36 }).notNull(),
  unlockedAt: timestampColumns().createdAt,
}, (table) => ({
  uniqueUserAchievement: uniqueIndex("user_achievement_unique").on(table.userId, table.achievementId),
}));

export const gameStatusEnum = pgEnum("game_status", ["active", "draft", "disabled"]);

export const games = pgTable("games", {
  id: idColumn(),
  ...timestampColumns(),
  slug: varchar("slug", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description").notNull(),
  thumbnail: varchar("thumbnail", { length: 100 }),
  config: jsonb("config").notNull(), // { minBet, maxWin, symbols?, payoutRules }
  status: gameStatusEnum("status").default("active").notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
});

export const arcadePlays = pgTable("arcade_plays", {
  id: idColumn(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  userId: varchar("user_id", { length: 36 }).notNull(),
  gameId: varchar("game_id", { length: 36 }).notNull(),
  pointsSpent: integer("points_spent").notNull(),
  pointsWon: integer("points_won").notNull().default(0),
  result: jsonb("result"),
});

export const muyuSessions = pgTable("muyu_sessions", {
  id: idColumn(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  userId: varchar("user_id", { length: 36 }).notNull(),
  tapCount: integer("tap_count").notNull(),
  duration: integer("duration"), // seconds
  pointsEarned: integer("points_earned").notNull().default(0),
});

export const zodiacSignEnum = pgEnum("zodiac_sign", [
  "aries", "taurus", "gemini", "cancer", "leo", "virgo",
  "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces",
]);

export const dailyHoroscopes = pgTable("daily_horoscopes", {
  id: idColumn(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  sign: varchar("sign", { length: 20 }).notNull(),
  date: varchar("date", { length: 10 }).notNull(), // YYYY-MM-DD
  content: jsonb("content").notNull(), // { mood, luckyNumber, compatibility, reading }
}, (table) => ({
  uniqueSignDate: uniqueIndex("daily_horoscope_sign_date").on(table.sign, table.date),
}));

export const pushSubscriptions = pgTable("push_subscriptions", {
  id: idColumn(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  userId: varchar("user_id", { length: 36 }).notNull(),
  endpoint: text("endpoint").notNull().unique(),
  p256dh: text("p256dh").notNull(),
  auth: text("auth").notNull(),
});

export const compatibilityResults = pgTable("compatibility_results", {
  id: idColumn(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  sign1: varchar("sign1", { length: 20 }).notNull(),
  sign2: varchar("sign2", { length: 20 }).notNull(),
  mbtiType1: varchar("mbti_type1", { length: 4 }),
  mbtiType2: varchar("mbti_type2", { length: 4 }),
  content: jsonb("content").notNull(),
}, (table) => ({
  uniquePair: uniqueIndex("compatibility_pair_unique").on(table.sign1, table.sign2, table.mbtiType1, table.mbtiType2),
}));

export const journalMoodEnum = pgEnum("journal_mood", ["happy", "neutral", "sad", "anxious", "hopeful", "confused"]);

export const journalEntries = pgTable("journal_entries", {
  id: idColumn(),
  ...timestampColumns(),
  readingId: varchar("reading_id", { length: 36 }).notNull(),
  userId: varchar("user_id", { length: 36 }).notNull(),
  content: text("content").notNull(),
  mood: journalMoodEnum("mood"),
});

export const friendshipStatusEnum = pgEnum("friendship_status", ["pending", "accepted", "rejected"]);

export const friendships = pgTable("friendships", {
  id: idColumn(),
  ...timestampColumns(),
  requesterId: varchar("requester_id", { length: 36 }).notNull(),
  addresseeId: varchar("addressee_id", { length: 36 }).notNull(),
  status: friendshipStatusEnum("status").default("pending").notNull(),
}, (table) => ({
  uniqueFriendship: uniqueIndex("friendship_unique").on(table.requesterId, table.addresseeId),
}));
