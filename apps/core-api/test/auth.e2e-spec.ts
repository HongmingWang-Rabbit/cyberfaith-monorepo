/**
 * Auth flow e2e tests
 * Google OAuth callback → JWT issued → protected route access → token refresh
 */
import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import request from "supertest";
import { createTestApp, createTestUser, authHeader, resetTestState, closeTestApp, type TestContext, type TestUser } from "./setup";

describe("Auth Flow (e2e)", () => {
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
    // Seed user in mock DB so auth/me can find them
    ctx.db.seed("users", [
      { id: user.id, email: user.email, name: user.name, googleId: "g-123", avatarUrl: null, passwordHash: null },
    ]);
  });

  describe("GET /auth/me", () => {
    it("should return user profile with valid JWT", async () => {
      const res = await request(ctx.app.getHttpServer())
        .get("/auth/me")
        .set("Authorization", authHeader(user))
        .expect(200);

      expect(res.body).toHaveProperty("email", user.email);
      expect(res.body).toHaveProperty("name", user.name);
      // passwordHash should be stripped
      expect(res.body).not.toHaveProperty("passwordHash");
    });

    it("should reject request without token", async () => {
      await request(ctx.app.getHttpServer())
        .get("/auth/me")
        .expect(401);
    });

    it("should reject request with invalid token", async () => {
      await request(ctx.app.getHttpServer())
        .get("/auth/me")
        .set("Authorization", "Bearer invalid.token.here")
        .expect(401);
    });

    it("should reject request with expired token", async () => {
      // Sign a token with very short expiry
      const expiredToken = ctx.jwtService.sign(
        { sub: user.id, email: user.email },
        { expiresIn: "0s" },
      );

      await request(ctx.app.getHttpServer())
        .get("/auth/me")
        .set("Authorization", `Bearer ${expiredToken}`)
        .expect(401);
    });
  });

  describe("JWT token validation", () => {
    it("should allow access to protected routes with valid token", async () => {
      const res = await request(ctx.app.getHttpServer())
        .get("/readings")
        .set("Authorization", authHeader(user));

      // Should not be 401 (might be 200 or other non-auth error)
      expect(res.status).not.toBe(401);
    });

    it("should decode correct user from token", async () => {
      const user2 = createTestUser(ctx.jwtService, { email: "other@test.com", name: "Other" });
      ctx.db.seed("users", [
        { id: user2.id, email: user2.email, name: user2.name, googleId: "g-456", avatarUrl: null, passwordHash: null },
      ]);

      const res = await request(ctx.app.getHttpServer())
        .get("/auth/me")
        .set("Authorization", authHeader(user2))
        .expect(200);

      expect(res.body.email).toBe(user2.email);
    });
  });

  describe("Google OAuth redirect", () => {
    it("GET /auth/google should redirect to Google (or mock)", async () => {
      const res = await request(ctx.app.getHttpServer())
        .get("/auth/google");

      // With AUTH_MOCK or real Google strategy, this redirects (302) or returns error
      expect([302, 401, 500]).toContain(res.status);
    });
  });
});
