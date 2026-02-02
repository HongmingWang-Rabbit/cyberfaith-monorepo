/**
 * Points flow e2e tests
 * Create reading → points awarded → check leaderboard → spend in arcade
 */
import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import request from "supertest";
import { createTestApp, createTestUser, authHeader, resetTestState, closeTestApp, type TestContext, type TestUser } from "./setup";

describe("Points Flow (e2e)", () => {
  let ctx: TestContext;
  let user: TestUser;

  beforeAll(async () => {
    ctx = await createTestApp();
  });

  afterAll(async () => {
    await closeTestApp(ctx.app);
  });

  beforeEach(() => {
    resetTestState(ctx.db);
    user = createTestUser(ctx.jwtService);
    ctx.db.seed("users", [
      { id: user.id, email: user.email, name: user.name, googleId: "g-1", avatarUrl: null },
    ]);
  });

  describe("GET /points/me", () => {
    it("should return user points summary", async () => {
      // Seed some point transactions
      ctx.db.seed("points_transactions", [
        { userId: user.id, amount: 10, reason: "reading_completed", metadata: null },
        { userId: user.id, amount: 5, reason: "daily_login", metadata: null },
      ]);

      const res = await request(ctx.app.getHttpServer())
        .get("/points/me")
        .set("Authorization", authHeader(user))
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty("total");
      expect(res.body.data).toHaveProperty("recent");
    });

    it("should require authentication", async () => {
      await request(ctx.app.getHttpServer())
        .get("/points/me")
        .expect(401);
    });
  });

  describe("GET /points/leaderboard", () => {
    it("should return leaderboard rankings", async () => {
      // Seed points for multiple users
      ctx.db.seed("points_transactions", [
        { userId: user.id, amount: 100, reason: "reading_completed", metadata: null },
      ]);

      const res = await request(ctx.app.getHttpServer())
        .get("/points/leaderboard")
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeInstanceOf(Array);
    });

    it("should respect limit parameter", async () => {
      const res = await request(ctx.app.getHttpServer())
        .get("/points/leaderboard?limit=5")
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeLessThanOrEqual(5);
    });

    it("should be accessible without authentication", async () => {
      await request(ctx.app.getHttpServer())
        .get("/points/leaderboard")
        .expect(200);
    });
  });

  describe("Arcade spending", () => {
    it("GET /arcade/games should list available games", async () => {
      ctx.db.seed("games", [
        { slug: "fortune-wheel", name: "Fortune Wheel", description: "Spin the wheel!", config: { minBet: 5, maxWin: 50 }, status: "active", sortOrder: 0 },
      ]);

      const res = await request(ctx.app.getHttpServer())
        .get("/arcade/games")
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeInstanceOf(Array);
    });

    it("POST /arcade/play should require authentication", async () => {
      await request(ctx.app.getHttpServer())
        .post("/arcade/play")
        .send({ gameSlug: "fortune-wheel" })
        .expect(401);
    });
  });
});
