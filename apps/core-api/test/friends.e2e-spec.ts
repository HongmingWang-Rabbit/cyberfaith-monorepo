/**
 * Friend flow e2e tests
 * Send request → accept → view friend's readings
 */
import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import request from "supertest";
import { createTestApp, createTestUser, authHeader, resetTestState, closeTestApp, type TestContext, type TestUser } from "./setup";

describe("Friends Flow (e2e)", () => {
  let ctx: TestContext;
  let alice: TestUser;
  let bob: TestUser;

  beforeAll(async () => {
    ctx = await createTestApp();
  });

  afterAll(async () => {
    await closeTestApp(ctx.app);
  });

  beforeEach(() => {
    resetTestState(ctx.db);
    alice = createTestUser(ctx.jwtService, { name: "Alice" });
    bob = createTestUser(ctx.jwtService, { name: "Bob" });
    ctx.db.seed("users", [
      { id: alice.id, email: alice.email, name: alice.name, googleId: "g-alice", avatarUrl: null },
      { id: bob.id, email: bob.email, name: bob.name, googleId: "g-bob", avatarUrl: null },
    ]);
  });

  describe("POST /friends/request", () => {
    it("should send a friend request", async () => {
      const res = await request(ctx.app.getHttpServer())
        .post("/friends/request")
        .set("Authorization", authHeader(alice))
        .send({ addresseeId: bob.id })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty("id");
    });

    it("should require authentication", async () => {
      await request(ctx.app.getHttpServer())
        .post("/friends/request")
        .send({ addresseeId: bob.id })
        .expect(401);
    });
  });

  describe("POST /friends/accept/:id", () => {
    it("should accept a friend request", async () => {
      // Seed a pending friendship
      ctx.db.seed("friendships", [
        { requesterId: alice.id, addresseeId: bob.id, status: "pending" },
      ]);
      const friendshipId = ctx.db.tables.get("friendships")![0].id;

      const res = await request(ctx.app.getHttpServer())
        .post(`/friends/accept/${friendshipId}`)
        .set("Authorization", authHeader(bob))
        .expect(201);

      expect(res.body.success).toBe(true);
    });
  });

  describe("GET /friends", () => {
    it("should list accepted friends", async () => {
      ctx.db.seed("friendships", [
        { requesterId: alice.id, addresseeId: bob.id, status: "accepted" },
      ]);

      const res = await request(ctx.app.getHttpServer())
        .get("/friends")
        .set("Authorization", authHeader(alice))
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeInstanceOf(Array);
    });
  });

  describe("GET /friends/:id/readings", () => {
    it("should return friend's public readings", async () => {
      ctx.db.seed("friendships", [
        { requesterId: alice.id, addresseeId: bob.id, status: "accepted" },
      ]);
      const friendshipId = ctx.db.tables.get("friendships")![0].id;

      ctx.db.seed("readings", [
        { userId: bob.id, type: "tarot", input: {}, result: { cards: ["Star"] }, locale: "en", isPublic: true },
      ]);

      const res = await request(ctx.app.getHttpServer())
        .get(`/friends/${friendshipId}/readings`)
        .set("Authorization", authHeader(alice))
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeInstanceOf(Array);
    });

    it("should reject if not friends", async () => {
      const res = await request(ctx.app.getHttpServer())
        .get("/friends/nonexistent-id/readings")
        .set("Authorization", authHeader(alice));

      // Should get 404 or 400 (not found)
      expect([400, 404]).toContain(res.status);
    });
  });

  describe("Full friend lifecycle", () => {
    it("send request → accept → view readings", async () => {
      // 1. Alice sends request to Bob
      const sendRes = await request(ctx.app.getHttpServer())
        .post("/friends/request")
        .set("Authorization", authHeader(alice))
        .send({ addresseeId: bob.id })
        .expect(201);

      const friendshipId = sendRes.body.data.id;

      // 2. Bob accepts
      await request(ctx.app.getHttpServer())
        .post(`/friends/accept/${friendshipId}`)
        .set("Authorization", authHeader(bob))
        .expect(201);

      // 3. Bob has public readings
      ctx.db.seed("readings", [
        { userId: bob.id, type: "zodiac", input: {}, result: { sign: "Aries" }, locale: "en", isPublic: true },
      ]);

      // 4. Alice views Bob's readings
      const readingsRes = await request(ctx.app.getHttpServer())
        .get(`/friends/${friendshipId}/readings`)
        .set("Authorization", authHeader(alice))
        .expect(200);

      expect(readingsRes.body.success).toBe(true);
    });
  });
});
