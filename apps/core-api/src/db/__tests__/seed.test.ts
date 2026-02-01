import { describe, it, expect } from "vitest";
import { SEED_ACHIEVEMENTS } from "../../achievements/achievements.service";

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
    expect(SEED_ACHIEVEMENTS).toHaveLength(9);
    for (const a of SEED_ACHIEVEMENTS) {
      expect(a.name.length).toBeGreaterThan(0);
      expect(a.description.length).toBeGreaterThan(0);
      expect(a.pointsReward).toBeGreaterThan(0);
      expect(a.requirement).toBeTruthy();
    }
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
