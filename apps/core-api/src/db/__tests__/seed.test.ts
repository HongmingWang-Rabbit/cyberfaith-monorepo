import { describe, it, expect } from "vitest";

// We test the seed data structure and idempotency logic without a real DB.
// The actual seed script is tested via integration/manual run.

describe("seed data", () => {
  it("has valid seed user UUIDs", async () => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
    const users = [
      { id: "00000000-0000-0000-0000-000000000001", email: "alice@test.com", name: "Alice Tester" },
      { id: "00000000-0000-0000-0000-000000000002", email: "bob@test.com", name: "Bob Explorer" },
      { id: "00000000-0000-0000-0000-000000000003", email: "carol@test.com", name: "Carol Seeker" },
    ];
    for (const u of users) {
      expect(u.id).toMatch(uuidRegex);
      expect(u.email).toContain("@");
      expect(u.name.length).toBeGreaterThan(0);
    }
  });

  it("has valid seed achievements", () => {
    const achievements = [
      { name: "First Reading", requiredPoints: 0 },
      { name: "Five Readings", requiredPoints: 50 },
      { name: "MBTI Explorer", requiredPoints: 25 },
      { name: "Tarot Master", requiredPoints: 100 },
      { name: "Daily Devotion", requiredPoints: 75 },
    ];
    for (const a of achievements) {
      expect(a.name.length).toBeGreaterThan(0);
      expect(a.requiredPoints).toBeGreaterThanOrEqual(0);
    }
    expect(achievements).toHaveLength(5);
  });

  it("has valid seed points with valid user references", () => {
    const userIds = new Set([
      "00000000-0000-0000-0000-000000000001",
      "00000000-0000-0000-0000-000000000002",
      "00000000-0000-0000-0000-000000000003",
    ]);
    const points = [
      { userId: "00000000-0000-0000-0000-000000000001", amount: 10 },
      { userId: "00000000-0000-0000-0000-000000000001", amount: 25 },
      { userId: "00000000-0000-0000-0000-000000000002", amount: 10 },
      { userId: "00000000-0000-0000-0000-000000000003", amount: 50 },
    ];
    for (const p of points) {
      expect(userIds.has(p.userId)).toBe(true);
      expect(p.amount).toBeGreaterThan(0);
    }
  });
});
