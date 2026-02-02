import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus, Inject, Optional } from "@nestjs/common";
import { Request } from "express";
import { RedisService } from "../redis/redis.service";

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly store = new Map<string, RateLimitEntry>();
  protected readonly maxRequests: number;
  protected readonly windowMs: number;
  private readonly PREFIX = "ratelimit:";

  private readonly cleanupInterval: ReturnType<typeof setInterval>;
  private readonly maxStoreSize = 10_000;

  constructor(
    @Optional() @Inject(RedisService) protected readonly redis?: RedisService,
    maxRequests = 60,
    windowMs = 60_000,
  ) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;

    this.cleanupInterval = setInterval(() => this.cleanup(), windowMs * 2);
    if (this.cleanupInterval.unref) {
      this.cleanupInterval.unref();
    }
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const ip = req.ip || req.socket.remoteAddress || "unknown";

    // Try Redis
    if (this.redis?.isConnected) {
      return this.checkRedis(ip);
    }

    return this.checkMemory(ip);
  }

  private async checkRedis(ip: string): Promise<boolean> {
    const key = this.PREFIX + ip;
    try {
      const count = await this.redis!.incr(key);
      if (count === 1) {
        await this.redis!.expire(key, Math.ceil(this.windowMs / 1000));
      }
      if (count > this.maxRequests) {
        throw new HttpException(
          { statusCode: HttpStatus.TOO_MANY_REQUESTS, message: "Too Many Requests", error: "RATE_LIMIT_EXCEEDED" },
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
      return true;
    } catch (err) {
      if (err instanceof HttpException) throw err;
      // Redis error — fall back to memory
      return this.checkMemory(ip);
    }
  }

  private checkMemory(ip: string): boolean {
    const now = Date.now();
    const entry = this.store.get(ip);

    if (!entry || now > entry.resetAt) {
      if (this.store.size >= this.maxStoreSize) this.cleanup();
      this.store.set(ip, { count: 1, resetAt: now + this.windowMs });
      return true;
    }

    entry.count++;

    if (entry.count > this.maxRequests) {
      throw new HttpException(
        { statusCode: HttpStatus.TOO_MANY_REQUESTS, message: "Too Many Requests", error: "RATE_LIMIT_EXCEEDED" },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [ip, entry] of this.store) {
      if (now > entry.resetAt) this.store.delete(ip);
    }
  }
}

/**
 * Stricter rate-limit guard for auth endpoints (login/register).
 * 10 requests per 60 seconds per IP.
 */
@Injectable()
export class AuthRateLimitGuard extends RateLimitGuard {
  constructor(@Optional() @Inject(RedisService) redis?: RedisService) {
    super(redis, 10, 60_000);
  }
}
