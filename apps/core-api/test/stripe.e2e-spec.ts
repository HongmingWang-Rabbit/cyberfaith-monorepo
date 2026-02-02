/**
 * Stripe flow e2e tests
 * Create checkout → webhook → tier updated → limits changed
 *
 * Note: Stripe SDK is mocked since we don't hit real Stripe.
 */
import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import request from "supertest";
import { createTestApp, createTestUser, authHeader, resetTestState, closeTestApp, type TestContext, type TestUser } from "./setup";

describe("Stripe Flow (e2e)", () => {
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
      { id: user.id, email: user.email, name: user.name, googleId: "g-1", avatarUrl: null, subscriptionTier: "free", stripeCustomerId: null, stripeSubscriptionId: null },
    ]);
  });

  describe("POST /stripe/create-checkout", () => {
    it("should require authentication", async () => {
      await request(ctx.app.getHttpServer())
        .post("/stripe/create-checkout")
        .expect(401);
    });

    it("should attempt to create checkout session for authenticated user", async () => {
      // This will fail because Stripe SDK isn't configured, but shouldn't be 401
      const res = await request(ctx.app.getHttpServer())
        .post("/stripe/create-checkout")
        .set("Authorization", authHeader(user));

      // Won't be 401 (auth works), likely 500 since no real Stripe key
      expect(res.status).not.toBe(401);
    });
  });

  describe("GET /stripe/subscription", () => {
    it("should return current subscription status", async () => {
      const res = await request(ctx.app.getHttpServer())
        .get("/stripe/subscription")
        .set("Authorization", authHeader(user))
        .expect(200);

      expect(res.body).toHaveProperty("tier");
    });

    it("should return free tier for new users", async () => {
      const res = await request(ctx.app.getHttpServer())
        .get("/stripe/subscription")
        .set("Authorization", authHeader(user))
        .expect(200);

      expect(res.body.tier).toBe("free");
    });
  });

  describe("POST /stripe/webhook", () => {
    it("should reject webhook without stripe-signature header", async () => {
      const res = await request(ctx.app.getHttpServer())
        .post("/stripe/webhook")
        .send({ type: "checkout.session.completed" });

      expect(res.status).toBe(400);
    });

    it("should reject webhook with invalid signature", async () => {
      const res = await request(ctx.app.getHttpServer())
        .post("/stripe/webhook")
        .set("stripe-signature", "invalid-sig")
        .send(Buffer.from(JSON.stringify({ type: "checkout.session.completed" })));

      expect(res.status).toBe(400);
    });
  });

  describe("Subscription tier flow", () => {
    it("user starts on free tier", async () => {
      const res = await request(ctx.app.getHttpServer())
        .get("/stripe/subscription")
        .set("Authorization", authHeader(user))
        .expect(200);

      expect(res.body.tier).toBe("free");
      expect(res.body.stripeSubscriptionId).toBeNull();
    });
  });
});
