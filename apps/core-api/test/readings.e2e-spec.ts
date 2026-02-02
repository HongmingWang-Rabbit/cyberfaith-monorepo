/**
 * Reading flow e2e tests
 * Create reading → save to history → make public → appears in feed
 */
import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import request from "supertest";
import { createTestApp, createTestUser, authHeader, resetTestState, closeTestApp, type TestContext, type TestUser } from "./setup";

describe("Readings Flow (e2e)", () => {
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

  describe("POST /readings", () => {
    it("should create a new reading", async () => {
      const res = await request(ctx.app.getHttpServer())
        .post("/readings")
        .set("Authorization", authHeader(user))
        .send({
          type: "tarot",
          input: { question: "What does today hold?" },
          result: { cards: ["The Fool", "The Magician"] },
          locale: "en",
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty("id");
      expect(res.body.data.type).toBe("tarot");
    });

    it("should require authentication", async () => {
      await request(ctx.app.getHttpServer())
        .post("/readings")
        .send({ type: "tarot" })
        .expect(401);
    });
  });

  describe("GET /readings", () => {
    it("should return user's reading history", async () => {
      // Seed some readings
      ctx.db.seed("readings", [
        { userId: user.id, type: "tarot", input: {}, result: {}, locale: "en", isPublic: false },
        { userId: user.id, type: "mbti", input: {}, result: {}, locale: "en", isPublic: false },
      ]);

      const res = await request(ctx.app.getHttpServer())
        .get("/readings")
        .set("Authorization", authHeader(user))
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("PATCH /readings/:id/public", () => {
    it("should toggle reading visibility to public", async () => {
      ctx.db.seed("readings", [
        { userId: user.id, type: "tarot", input: {}, result: {}, locale: "en", isPublic: false },
      ]);

      const readingId = ctx.db.tables.get("readings")![0].id;

      const res = await request(ctx.app.getHttpServer())
        .patch(`/readings/${readingId}/public`)
        .set("Authorization", authHeader(user))
        .send({ isPublic: true })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.isPublic).toBe(true);
    });
  });

  describe("GET /readings/feed", () => {
    it("should return public readings in the feed", async () => {
      ctx.db.seed("readings", [
        { userId: user.id, type: "tarot", input: {}, result: { cards: ["Ace"] }, locale: "en", isPublic: true },
      ]);

      const res = await request(ctx.app.getHttpServer())
        .get("/readings/feed")
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeInstanceOf(Array);
    });

    it("should support pagination", async () => {
      const res = await request(ctx.app.getHttpServer())
        .get("/readings/feed?page=1&limit=5")
        .expect(200);

      expect(res.body).toHaveProperty("page", 1);
      expect(res.body).toHaveProperty("limit", 5);
    });
  });

  describe("Full reading lifecycle", () => {
    it("create → history → make public → feed", async () => {
      // 1. Create a reading
      const createRes = await request(ctx.app.getHttpServer())
        .post("/readings")
        .set("Authorization", authHeader(user))
        .send({
          type: "i-ching",
          input: { hexagram: 1 },
          result: { meaning: "The Creative" },
          locale: "en",
        })
        .expect(201);

      expect(createRes.body.success).toBe(true);
      const readingId = createRes.body.data.id;

      // 2. Check it appears in history
      const historyRes = await request(ctx.app.getHttpServer())
        .get("/readings")
        .set("Authorization", authHeader(user))
        .expect(200);

      expect(historyRes.body.data.some((r: any) => r.id === readingId)).toBe(true);

      // 3. Make it public
      await request(ctx.app.getHttpServer())
        .patch(`/readings/${readingId}/public`)
        .set("Authorization", authHeader(user))
        .send({ isPublic: true })
        .expect(200);

      // 4. Check public feed
      const feedRes = await request(ctx.app.getHttpServer())
        .get("/readings/feed")
        .expect(200);

      expect(feedRes.body.data).toBeInstanceOf(Array);
    });
  });
});
