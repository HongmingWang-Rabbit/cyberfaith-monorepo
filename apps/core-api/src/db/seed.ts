import { createDbClient } from "@cyberfaith/db-utils";
import { users, points, achievements } from "./schema";

const DATABASE_URL = process.env.DATABASE_URL || "postgresql://localhost:5432/cyberfaith";

const SEED_USERS = [
  { id: "00000000-0000-0000-0000-000000000001", email: "alice@test.com", name: "Alice Tester", isActive: true },
  { id: "00000000-0000-0000-0000-000000000002", email: "bob@test.com", name: "Bob Explorer", isActive: true },
  { id: "00000000-0000-0000-0000-000000000003", email: "carol@test.com", name: "Carol Seeker", isActive: true },
];

const SEED_ACHIEVEMENTS = [
  { id: "00000000-0000-0000-0000-100000000001", name: "First Reading", description: "Complete your first reading", requiredPoints: 0 },
  { id: "00000000-0000-0000-0000-100000000002", name: "Five Readings", description: "Complete five readings", requiredPoints: 50 },
  { id: "00000000-0000-0000-0000-100000000003", name: "MBTI Explorer", description: "Complete an MBTI personality analysis", requiredPoints: 25 },
  { id: "00000000-0000-0000-0000-100000000004", name: "Tarot Master", description: "Complete 10 tarot readings", requiredPoints: 100 },
  { id: "00000000-0000-0000-0000-100000000005", name: "Daily Devotion", description: "Log in 7 consecutive days", requiredPoints: 75 },
];

const SEED_POINTS = [
  { id: "00000000-0000-0000-0000-200000000001", userId: SEED_USERS[0]!.id, amount: 10, reason: "First reading completed" },
  { id: "00000000-0000-0000-0000-200000000002", userId: SEED_USERS[0]!.id, amount: 25, reason: "MBTI analysis completed" },
  { id: "00000000-0000-0000-0000-200000000003", userId: SEED_USERS[1]!.id, amount: 10, reason: "First reading completed" },
  { id: "00000000-0000-0000-0000-200000000004", userId: SEED_USERS[2]!.id, amount: 50, reason: "Five readings milestone" },
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
      target: achievements.id,
      set: { name: achievement.name, description: achievement.description, requiredPoints: achievement.requiredPoints },
    });
    console.log(`  ✅ Achievement: ${achievement.name}`);
  }

  // Upsert points
  for (const point of SEED_POINTS) {
    await db.insert(points).values(point).onConflictDoUpdate({
      target: points.id,
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
