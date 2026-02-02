import { Inject, Injectable, Optional } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { eq } from "drizzle-orm";
import { DRIZZLE } from "../db/db.module";
import { users } from "../db/schema";
import { RedisService } from "../redis/redis.service";

@Injectable()
export class AuthService {
  constructor(
    @Inject(DRIZZLE) private db: any,
    private jwtService: JwtService,
    @Optional() private redisService?: RedisService,
  ) {}

  async findOrCreateGoogleUser(profile: {
    googleId: string;
    email: string;
    name: string;
    avatarUrl: string | null;
  }) {
    // Try find by googleId
    const existing = await this.db
      .select()
      .from(users)
      .where(eq(users.googleId, profile.googleId))
      .limit(1);

    if (existing.length > 0) {
      return existing[0];
    }

    // Try find by email
    const byEmail = await this.db
      .select()
      .from(users)
      .where(eq(users.email, profile.email))
      .limit(1);

    if (byEmail.length > 0) {
      // Link Google account
      await this.db
        .update(users)
        .set({ googleId: profile.googleId, avatarUrl: profile.avatarUrl })
        .where(eq(users.id, byEmail[0].id));
      return { ...byEmail[0], googleId: profile.googleId };
    }

    // Create new user
    const [newUser] = await this.db
      .insert(users)
      .values({
        email: profile.email,
        name: profile.name,
        googleId: profile.googleId,
        avatarUrl: profile.avatarUrl,
      })
      .returning();

    return newUser;
  }

  async issueToken(user: { id: string; email: string }) {
    const payload = { sub: user.id, email: user.email };
    const token = this.jwtService.sign(payload);

    // Track active session in Redis (TTL matches JWT expiry, default 24h)
    if (this.redisService) {
      const sessionKey = `session:${user.id}:${Date.now()}`;
      await this.redisService.set(sessionKey, JSON.stringify({
        userId: user.id,
        email: user.email,
        issuedAt: new Date().toISOString(),
      }), 86400).catch(() => {});
    }

    return { access_token: token };
  }

  async getUserById(id: string) {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    return result[0] || null;
  }
}
