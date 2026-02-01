import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, VerifyCallback } from "passport-google-oauth20";

/**
 * Mock Google OAuth strategy that points to the local mock OAuth server.
 * Only used when AUTH_MOCK=true.
 *
 * passport-google-oauth20 uses `passport-oauth2` under the hood which accepts
 * `authorizationURL` and `tokenURL`. The Google strategy also fetches the user
 * profile from a `userProfileURL`.
 */
@Injectable()
export class MockGoogleStrategy extends PassportStrategy(Strategy, "google") {
  constructor() {
    const mockBase = process.env.MOCK_OAUTH_URL || "http://localhost:9090";
    super({
      clientID: process.env.GOOGLE_CLIENT_ID || "mock-client-id",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "mock-client-secret",
      callbackURL:
        process.env.GOOGLE_CALLBACK_URL ||
        "http://localhost:4000/auth/google/callback",
      scope: ["email", "profile"],
      // Override Google URLs to point at mock server
      authorizationURL: `${mockBase}/o/oauth2/v2/auth`,
      tokenURL: `${mockBase}/token`,
      userProfileURL: `${mockBase}/oauth2/v3/userinfo`,
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { id, name, emails, photos } = profile;

    if (!emails?.length) {
      return done(new Error("No email returned from mock Google"), false);
    }

    const user = {
      googleId: id,
      email: emails[0].value,
      name: name
        ? `${name.givenName ?? ""} ${name.familyName ?? ""}`.trim()
        : "Unknown",
      avatarUrl: photos?.[0]?.value || null,
    };
    done(null, user);
  }
}
