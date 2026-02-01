import { test, expect } from "@playwright/test";

/**
 * E2E auth flow test using the mock OAuth server.
 *
 * Prerequisites:
 *   - Mock OAuth server running on :9090 (scripts/mock-oauth-server.ts)
 *   - Core API running on :4000 with AUTH_MOCK=true
 *
 * The flow: GET /auth/google → mock authorize → callback with code → token → redirect with JWT
 */

const CORE_API = process.env.CORE_API_URL || "http://localhost:4000";

test.describe("OAuth Auth Flow (mock)", () => {
  test("full Google OAuth login flow returns JWT", async ({ request }) => {
    // Step 1: Hit the auth/google endpoint — it should redirect to mock OAuth authorize
    const loginResp = await request.get(`${CORE_API}/auth/google`, {
      maxRedirects: 0,
    });

    // Passport redirects to the authorization URL
    expect([301, 302]).toContain(loginResp.status());
    const authUrl = loginResp.headers()["location"];
    expect(authUrl).toBeTruthy();
    expect(authUrl).toContain("/o/oauth2/v2/auth");

    // Step 2: Follow the authorize redirect — mock server issues code and redirects to callback
    const authorizeResp = await request.get(authUrl!, { maxRedirects: 0 });
    expect([301, 302]).toContain(authorizeResp.status());
    const callbackUrl = authorizeResp.headers()["location"];
    expect(callbackUrl).toBeTruthy();
    expect(callbackUrl).toContain("code=");

    // Step 3: Hit the callback — NestJS exchanges code for token, creates user, issues JWT
    const callbackResp = await request.get(callbackUrl!, { maxRedirects: 0 });
    expect([301, 302]).toContain(callbackResp.status());
    const finalRedirect = callbackResp.headers()["location"];
    expect(finalRedirect).toBeTruthy();
    expect(finalRedirect).toContain("token=");

    // Extract token
    const token = new URL(finalRedirect!).searchParams.get("token");
    expect(token).toBeTruthy();

    // Step 4: Use the token to access /auth/me
    const meResp = await request.get(`${CORE_API}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(meResp.status()).toBe(200);
    const user = await meResp.json();
    expect(user.email).toBe("testuser@cyberfaith.test");
    expect(user.googleId).toBe("google-mock-user-123");
  });
});
