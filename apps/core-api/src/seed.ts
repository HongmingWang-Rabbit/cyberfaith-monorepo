import { createDbClient } from "@cyberfaith/db-utils";
import {
  users,
  userSettings,
  readings,
  journalEntries,
  friendships,
  comments,
  readingReactions,
  referrals,
  achievements,
  userAchievements,
  pointsTransactions,
  games,
} from "./db/schema";
import { randomUUID } from "crypto";

const DATABASE_URL = process.env.DATABASE_URL || "postgresql://localhost:5432/cyberfaith";

function uuid(n: number): string {
  return `00000000-0000-0000-0000-${String(n).padStart(12, "0")}`;
}

const ZODIAC_SIGNS = [
  "aries", "taurus", "gemini", "cancer", "leo", "virgo",
  "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces",
] as const;

const MBTI_TYPES = [
  "INTJ", "INTP", "ENTJ", "ENTP", "INFJ", "INFP", "ENFJ", "ENFP",
  "ISTJ", "ISFJ", "ESTJ", "ESFJ", "ISTP", "ISFP", "ESTP", "ESFP",
] as const;

const READING_TYPES = ["mbti", "tarot", "i-ching", "four-pillars", "zodiac", "dream"] as const;
const MOODS = ["happy", "neutral", "sad", "anxious", "hopeful", "confused"] as const;

// ─── 10 Demo Users ────────────────────────────────────────
const SEED_USERS = Array.from({ length: 10 }, (_, i) => ({
  id: uuid(i + 1),
  email: `demo${i + 1}@cyberfaith.dev`,
  name: [
    "Luna Starweaver", "Orion Nightshade", "Sage Moonfire", "Aria Dreamcatcher",
    "Phoenix Ember", "Ivy Thornwood", "Atlas Stormborn", "Zara Crystalvein",
    "Kai Sunforge", "Nova Twilight",
  ][i]!,
  username: [
    "luna-star", "orion-shade", "sage-moon", "aria-dream", "phoenix-ember",
    "ivy-thorn", "atlas-storm", "zara-crystal", "kai-sun", "nova-twilight",
  ][i]!,
  zodiacSign: ZODIAC_SIGNS[i % 12],
  karma: [150, 320, 45, 500, 210, 90, 1000, 75, 180, 420][i]!,
  isActive: true,
  subscriptionTier: i < 3 ? "pro" : "free",
  referralCode: `REF${String(i + 1).padStart(4, "0")}`,
}));

const SEED_SETTINGS = SEED_USERS.map((u, i) => ({
  userId: u.id,
  mbtiType: MBTI_TYPES[i % 16],
  displayName: u.name,
  theme: i % 2 === 0 ? "dark" : "light",
  language: i === 9 ? "zh" : "en",
  privacyProfileVisible: true,
  privacyReadingVisible: i !== 7,
}));

// ─── 50 Readings ──────────────────────────────────────────
const SEED_READINGS = Array.from({ length: 50 }, (_, i) => ({
  id: uuid(1000 + i),
  userId: SEED_USERS[i % 10]!.id,
  type: READING_TYPES[i % 6],
  input: { seed: i, question: `Demo reading #${i + 1}` },
  result: { summary: `Result for reading #${i + 1}`, score: Math.round(Math.random() * 100) },
  locale: i % 5 === 0 ? "zh" : "en",
  isPublic: i < 5, // first 5 are public
}));

// ─── 20 Journal Entries ───────────────────────────────────
const SEED_JOURNALS = Array.from({ length: 20 }, (_, i) => ({
  id: uuid(2000 + i),
  readingId: SEED_READINGS[i % 50]!.id,
  userId: SEED_READINGS[i % 50]!.userId,
  content: [
    "Today's reading resonated deeply with my current situation.",
    "I need to reflect more on the guidance I received.",
    "Feeling optimistic about the path ahead.",
    "The cards revealed something unexpected.",
    "I'm starting to see patterns in my readings.",
  ][i % 5]!,
  mood: MOODS[i % 6] as any,
}));

// ─── 10 Friendships ──────────────────────────────────────
const SEED_FRIENDSHIPS = [
  [0, 1], [0, 2], [1, 2], [1, 3], [2, 4],
  [3, 5], [4, 6], [5, 7], [6, 8], [7, 9],
].map(([a, b], i) => ({
  id: uuid(3000 + i),
  requesterId: SEED_USERS[a!]!.id,
  addresseeId: SEED_USERS[b!]!.id,
  status: i < 8 ? "accepted" as const : "pending" as const,
}));

// ─── 30 Comments (on the 5 public readings) ──────────────
const SEED_COMMENTS = Array.from({ length: 30 }, (_, i) => ({
  id: uuid(4000 + i),
  readingId: SEED_READINGS[i % 5]!.id, // public readings 0-4
  userId: SEED_USERS[(i + 1) % 10]!.id,
  content: [
    "This is so accurate! 🔮", "Love this interpretation.", "Can you do one for me?",
    "The stars don't lie ✨", "Beautifully written reading.", "I had a similar result!",
    "Thank you for sharing this.", "Cosmic vibes 🌟", "This gave me chills.",
    "We need more readings like this!",
  ][i % 10]!,
  parentId: i >= 20 ? uuid(4000 + (i - 20)) : null, // last 10 are replies
}));

// ─── Reactions on public readings ─────────────────────────
const REACTION_EMOJIS = ["👍", "❤️", "🔮", "✨", "🌟"];
const SEED_REACTIONS = Array.from({ length: 15 }, (_, i) => ({
  id: uuid(5000 + i),
  readingId: SEED_READINGS[i % 5]!.id,
  userId: SEED_USERS[(i + 2) % 10]!.id,
  emoji: REACTION_EMOJIS[i % 5]!,
}));

// ─── Referrals ────────────────────────────────────────────
const SEED_REFERRALS = [
  { referrerId: SEED_USERS[0]!.id, referredUserId: SEED_USERS[3]!.id, code: "REF0001", status: "completed" as const, karmaAwarded: 50, premiumDaysAwarded: 7 },
  { referrerId: SEED_USERS[0]!.id, referredUserId: SEED_USERS[4]!.id, code: "REF0001", status: "completed" as const, karmaAwarded: 50, premiumDaysAwarded: 7 },
  { referrerId: SEED_USERS[1]!.id, referredUserId: SEED_USERS[5]!.id, code: "REF0002", status: "pending" as const, karmaAwarded: 0, premiumDaysAwarded: 0 },
].map((r, i) => ({ id: uuid(6000 + i), ...r }));

// ─── Achievements ─────────────────────────────────────────
const SEED_ACHIEVEMENTS = [
  { name: "First Steps", description: "Complete your first reading", icon: "🐣", category: "milestone", requirement: { type: "total_readings", count: 1 }, pointsReward: 10 },
  { name: "MBTI Explorer", description: "Complete an MBTI test", icon: "🧠", category: "reading", requirement: { type: "reading_type", readingType: "mbti" }, pointsReward: 15 },
  { name: "Card Reader", description: "Complete a tarot reading", icon: "🃏", category: "reading", requirement: { type: "reading_type", readingType: "tarot" }, pointsReward: 15 },
  { name: "Oracle", description: "Complete an I Ching reading", icon: "☯️", category: "reading", requirement: { type: "reading_type", readingType: "i-ching" }, pointsReward: 15 },
  { name: "Destiny Mapped", description: "Complete a Four Pillars reading", icon: "🏛️", category: "reading", requirement: { type: "reading_type", readingType: "four-pillars" }, pointsReward: 15 },
  { name: "Star Gazer", description: "Check a zodiac reading", icon: "⭐", category: "reading", requirement: { type: "reading_type", readingType: "zodiac" }, pointsReward: 10 },
  { name: "Well Rounded", description: "Complete all reading types", icon: "🌀", category: "milestone", requirement: { type: "all_types", types: ["mbti", "tarot", "i-ching", "four-pillars", "zodiac"] }, pointsReward: 50 },
  { name: "Dedicated Seeker", description: "Complete 10 readings", icon: "📚", category: "milestone", requirement: { type: "total_readings", count: 10 }, pointsReward: 30 },
  { name: "Enlightened", description: "Complete 50 readings", icon: "🌟", category: "milestone", requirement: { type: "total_readings", count: 50 }, pointsReward: 100 },
  { name: "Dream Weaver", description: "Complete a dream interpretation", icon: "💤", category: "reading", requirement: { type: "reading_type", readingType: "dream" }, pointsReward: 15 },
];

// ─── Points Transactions ──────────────────────────────────
const SEED_POINTS = SEED_USERS.flatMap((u, i) =>
  Array.from({ length: 3 + (i % 4) }, (_, j) => ({
    id: uuid(7000 + i * 10 + j),
    userId: u.id,
    amount: [10, 25, 15, 50, 30][j % 5]!,
    reason: ["reading_completed", "achievement_unlocked", "daily_login", "streak_bonus"][j % 4]!,
  })),
);

// ─── Arcade Games ─────────────────────────────────────────
const SEED_GAMES = [
  {
    slug: "karma-slots",
    name: "Karma Slots",
    description: "Spin the spiritual reels and test your cosmic luck!",
    thumbnail: "🎰",
    config: { minBet: 10, maxWin: 50, symbols: ["🔮", "✨", "🌟", "☯️", "🧿", "💫", "🪬", "🌙"], reelCount: 3, payoutRules: { threeMatch: 50, twoMatch: 20 } },
    status: "active" as const,
  },
];

async function seed() {
  console.log("🌱 Seeding CyberFaith database...\n");
  const db = createDbClient(DATABASE_URL);

  // Users
  for (const user of SEED_USERS) {
    await db.insert(users).values(user).onConflictDoUpdate({ target: users.id, set: { name: user.name, email: user.email, zodiacSign: user.zodiacSign, karma: user.karma, username: user.username, referralCode: user.referralCode } });
  }
  console.log(`  ✅ ${SEED_USERS.length} users`);

  // User Settings
  for (const s of SEED_SETTINGS) {
    await db.insert(userSettings).values(s).onConflictDoUpdate({ target: userSettings.userId, set: { mbtiType: s.mbtiType, displayName: s.displayName, theme: s.theme, language: s.language } });
  }
  console.log(`  ✅ ${SEED_SETTINGS.length} user settings`);

  // Achievements
  for (const a of SEED_ACHIEVEMENTS) {
    await db.insert(achievements).values(a).onConflictDoUpdate({ target: achievements.name, set: { description: a.description, pointsReward: a.pointsReward, icon: a.icon, category: a.category, requirement: a.requirement } });
  }
  console.log(`  ✅ ${SEED_ACHIEVEMENTS.length} achievements`);

  // Readings
  for (const r of SEED_READINGS) {
    await db.insert(readings).values(r).onConflictDoUpdate({ target: readings.id, set: { type: r.type, result: r.result } });
  }
  console.log(`  ✅ ${SEED_READINGS.length} readings`);

  // Journal Entries
  for (const j of SEED_JOURNALS) {
    await db.insert(journalEntries).values(j).onConflictDoUpdate({ target: journalEntries.id, set: { content: j.content, mood: j.mood } });
  }
  console.log(`  ✅ ${SEED_JOURNALS.length} journal entries`);

  // Friendships
  for (const f of SEED_FRIENDSHIPS) {
    await db.insert(friendships).values(f).onConflictDoUpdate({ target: friendships.id, set: { status: f.status } });
  }
  console.log(`  ✅ ${SEED_FRIENDSHIPS.length} friendships`);

  // Comments
  for (const c of SEED_COMMENTS) {
    await db.insert(comments).values(c).onConflictDoUpdate({ target: comments.id, set: { content: c.content } });
  }
  console.log(`  ✅ ${SEED_COMMENTS.length} comments`);

  // Reactions
  for (const r of SEED_REACTIONS) {
    try {
      await db.insert(readingReactions).values(r).onConflictDoNothing();
    } catch { /* unique constraint */ }
  }
  console.log(`  ✅ ${SEED_REACTIONS.length} reactions`);

  // Referrals
  for (const r of SEED_REFERRALS) {
    await db.insert(referrals).values(r).onConflictDoUpdate({ target: referrals.id, set: { status: r.status } });
  }
  console.log(`  ✅ ${SEED_REFERRALS.length} referrals`);

  // Points
  for (const p of SEED_POINTS) {
    await db.insert(pointsTransactions).values(p).onConflictDoUpdate({ target: pointsTransactions.id, set: { amount: p.amount, reason: p.reason } });
  }
  console.log(`  ✅ ${SEED_POINTS.length} points transactions`);

  // User Achievements (give first 3 users some achievements)
  const achievementRows = await db.select({ id: achievements.id, name: achievements.name }).from(achievements);
  const uaEntries: { userId: string; achievementId: string }[] = [];
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < Math.min(3 + i, achievementRows.length); j++) {
      uaEntries.push({ userId: SEED_USERS[i]!.id, achievementId: achievementRows[j]!.id });
    }
  }
  for (const ua of uaEntries) {
    try {
      await db.insert(userAchievements).values(ua).onConflictDoNothing();
    } catch { /* unique constraint */ }
  }
  console.log(`  ✅ ${uaEntries.length} user achievements`);

  // Games
  for (const g of SEED_GAMES) {
    await db.insert(games).values(g).onConflictDoUpdate({ target: games.slug, set: { name: g.name, description: g.description, config: g.config } });
  }
  console.log(`  ✅ ${SEED_GAMES.length} arcade games`);

  console.log("\n🎉 Seed complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
