import { createDbClient } from "@cyberfaith/db-utils";
import { users, pointsTransactions, achievements } from "./schema";

const DATABASE_URL = process.env.DATABASE_URL || "postgresql://localhost:5432/cyberfaith";

const SEED_USERS = [
  { id: "00000000-0000-0000-0000-000000000001", email: "alice@test.com", name: "Alice Tester", isActive: true },
  { id: "00000000-0000-0000-0000-000000000002", email: "bob@test.com", name: "Bob Explorer", isActive: true },
  { id: "00000000-0000-0000-0000-000000000003", email: "carol@test.com", name: "Carol Seeker", isActive: true },
];

const SEED_ACHIEVEMENTS = [
  { name: "First Steps", description: "Complete your first reading", icon: "🐣", category: "milestone", requirement: { type: "total_readings", count: 1 }, pointsReward: 10 },
  { name: "MBTI Explorer", description: "Complete an MBTI test", icon: "🧠", category: "reading", requirement: { type: "reading_type", readingType: "mbti" }, pointsReward: 15 },
  { name: "Card Reader", description: "Complete a tarot reading", icon: "🃏", category: "reading", requirement: { type: "reading_type", readingType: "tarot" }, pointsReward: 15 },
  { name: "Oracle", description: "Complete an I Ching reading", icon: "☯️", category: "reading", requirement: { type: "reading_type", readingType: "i-ching" }, pointsReward: 15 },
  { name: "Destiny Mapped", description: "Complete a Four Pillars reading", icon: "🏛️", category: "reading", requirement: { type: "reading_type", readingType: "four-pillars" }, pointsReward: 15 },
  { name: "Star Gazer", description: "Check a zodiac reading", icon: "⭐", category: "reading", requirement: { type: "reading_type", readingType: "zodiac" }, pointsReward: 10 },
  { name: "Well Rounded", description: "Complete all 5 reading types", icon: "🌀", category: "milestone", requirement: { type: "all_types", types: ["mbti", "tarot", "i-ching", "four-pillars", "zodiac"] }, pointsReward: 50 },
  { name: "Dedicated Seeker", description: "Complete 10 readings", icon: "📚", category: "milestone", requirement: { type: "total_readings", count: 10 }, pointsReward: 30 },
  { name: "Enlightened", description: "Complete 50 readings", icon: "🌟", category: "milestone", requirement: { type: "total_readings", count: 50 }, pointsReward: 100 },
];

const SEED_POINTS = [
  { id: "00000000-0000-0000-0000-200000000001", userId: SEED_USERS[0]!.id, amount: 10, reason: "reading_completed" },
  { id: "00000000-0000-0000-0000-200000000002", userId: SEED_USERS[0]!.id, amount: 25, reason: "reading_completed" },
  { id: "00000000-0000-0000-0000-200000000003", userId: SEED_USERS[1]!.id, amount: 10, reason: "reading_completed" },
  { id: "00000000-0000-0000-0000-200000000004", userId: SEED_USERS[2]!.id, amount: 50, reason: "reading_completed" },
];

async function seed() {
  console.log("🌱 Seeding database...");
  const db = createDbClient(DATABASE_URL);

  // Upsert users
  for (const user of SEED_USERS) {
    await db.insert(users).values(user).onConflictDoUpdate({
      target: users.id,
      set: { name: user.name, email: user.email },
    });
    console.log(`  ✅ User: ${user.name}`);
  }

  // Upsert achievements
  for (const achievement of SEED_ACHIEVEMENTS) {
    await db.insert(achievements).values(achievement).onConflictDoUpdate({
      target: achievements.name,
      set: { description: achievement.description, pointsReward: achievement.pointsReward, icon: achievement.icon, category: achievement.category, requirement: achievement.requirement },
    });
    console.log(`  ✅ Achievement: ${achievement.name}`);
  }

  // Upsert points
  for (const point of SEED_POINTS) {
    await db.insert(pointsTransactions).values(point).onConflictDoUpdate({
      target: pointsTransactions.id,
      set: { amount: point.amount, reason: point.reason },
    });
    console.log(`  ✅ Points: ${point.amount} for ${point.reason}`);
  }

  console.log("🎉 Seed complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
