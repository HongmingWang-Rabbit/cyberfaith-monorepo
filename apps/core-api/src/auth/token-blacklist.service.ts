import { Injectable } from "@nestjs/common";
import { RedisService } from "../redis/redis.service";

@Injectable()
export class TokenBlacklistService {
  private readonly PREFIX = "blacklist:";

  constructor(private readonly redis: RedisService) {}

  /**
   * Blacklist a JWT token (e.g. on logout).
   * @param jti - token identifier or the token itself
   * @param ttlSeconds - how long to keep in blacklist (should match token expiry)
   */
  async blacklist(jti: string, ttlSeconds = 86400): Promise<void> {
    await this.redis.set(this.PREFIX + jti, "1", ttlSeconds);
  }

  /** Check if a token is blacklisted */
  async isBlacklisted(jti: string): Promise<boolean> {
    const val = await this.redis.get(this.PREFIX + jti);
    return val !== null;
  }

  /**
   * Invalidate all existing tokens by setting a global invalidation timestamp.
   * JWT strategy should check this timestamp against token iat.
   */
  async invalidateAllTokens(): Promise<void> {
    await this.redis.set("global:token-invalidated-at", Date.now().toString(), 604800); // 7 days
  }

  /** Get the global invalidation timestamp */
  async getGlobalInvalidationTime(): Promise<number | null> {
    const val = await this.redis.get("global:token-invalidated-at");
    return val ? parseInt(val, 10) : null;
  }
}
