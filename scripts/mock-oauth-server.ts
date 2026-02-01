#!/usr/bin/env npx tsx
/**
 * Mock OAuth2 server for local development and E2E testing.
 * Mimics Google OAuth2 endpoints so passport-google-oauth20 works without real Google credentials.
 *
 * Usage: npx tsx scripts/mock-oauth-server.ts
 * Server starts on http://localhost:9090
 */

import express from "express";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const PORT = Number(process.env.MOCK_OAUTH_PORT) || 9090;
const CLIENT_ID = "mock-client-id";
const CLIENT_SECRET = "mock-client-secret";

// Fake user profile (Google-like)
const MOCK_USER = {
  sub: "google-mock-user-123",
  email: "testuser@cyberfaith.test",
  email_verified: true,
  name: "Test User",
  given_name: "Test",
  family_name: "User",
  picture: "https://via.placeholder.com/96",
};

// Simple RSA key pair for signing (generated once at startup)
const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", {
  modulusLength: 2048,
  publicKeyEncoding: { type: "spki", format: "pem" },
  privateKeyEncoding: { type: "pkcs8", format: "pem" },
});

const KID = "mock-key-1";

function pemToJwk(pem: string) {
  const key = crypto.createPublicKey(pem);
  const jwk = key.export({ format: "jwk" });
  return { ...jwk, kid: KID, use: "sig", alg: "RS256" };
}

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Log all requests
app.use((req, _res, next) => {
  console.log(`[mock-oauth] ${req.method} ${req.url}`);
  next();
});

// OpenID Configuration (discovery)
app.get("/.well-known/openid-configuration", (_req, res) => {
  const issuer = `http://localhost:${PORT}`;
  res.json({
    issuer,
    authorization_endpoint: `${issuer}/o/oauth2/v2/auth`,
    token_endpoint: `${issuer}/token`,
    userinfo_endpoint: `${issuer}/oauth2/v3/userinfo`,
    jwks_uri: `${issuer}/.well-known/jwks.json`,
    response_types_supported: ["code"],
    grant_types_supported: ["authorization_code"],
    subject_types_supported: ["public"],
    id_token_signing_alg_values_supported: ["RS256"],
  });
});

// JWKS
app.get("/.well-known/jwks.json", (_req, res) => {
  res.json({ keys: [pemToJwk(publicKey)] });
});

// Authorization endpoint — immediately redirects with a code
app.get("/o/oauth2/v2/auth", (req, res) => {
  const { redirect_uri, state } = req.query;
  if (!redirect_uri) {
    return res.status(400).json({ error: "missing redirect_uri" });
  }
  const code = "mock-auth-code-" + crypto.randomBytes(8).toString("hex");
  const url = new URL(redirect_uri as string);
  url.searchParams.set("code", code);
  if (state) url.searchParams.set("state", state as string);
  console.log(`[mock-oauth] Issuing code=${code}, redirecting to ${url}`);
  res.redirect(url.toString());
});

// Token endpoint
app.post("/token", (req, res) => {
  console.log("[mock-oauth] Token request body:", req.body);

  const idToken = jwt.sign(
    {
      ...MOCK_USER,
      iss: `http://localhost:${PORT}`,
      aud: CLIENT_ID,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600,
    },
    privateKey,
    { algorithm: "RS256", keyid: KID },
  );

  res.json({
    access_token: "mock-access-token-" + crypto.randomBytes(16).toString("hex"),
    token_type: "Bearer",
    expires_in: 3600,
    id_token: idToken,
    scope: "openid email profile",
  });
});

// UserInfo endpoint
app.get("/oauth2/v3/userinfo", (_req, res) => {
  res.json(MOCK_USER);
});

app.listen(PORT, () => {
  console.log(`[mock-oauth] Mock OAuth2 server running on http://localhost:${PORT}`);
  console.log(`[mock-oauth] Authorization: http://localhost:${PORT}/o/oauth2/v2/auth`);
  console.log(`[mock-oauth] Token:         http://localhost:${PORT}/token`);
  console.log(`[mock-oauth] UserInfo:      http://localhost:${PORT}/oauth2/v3/userinfo`);
});
