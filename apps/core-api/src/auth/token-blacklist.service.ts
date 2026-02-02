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
}
