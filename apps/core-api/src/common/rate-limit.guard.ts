import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from "@nestjs/common";
import { Request } from "express";

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly store = new Map<string, RateLimitEntry>();
  private readonly maxRequests: number;
  private readonly windowMs: number;

  private readonly cleanupInterval: ReturnType<typeof setInterval>;
  private readonly maxStoreSize = 10_000;

  constructor(maxRequests = 60, windowMs = 60_000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;

    // Periodic cleanup of expired entries to prevent memory leaks
    this.cleanupInterval = setInterval(() => this.cleanup(), windowMs * 2);
    // Allow Node to exit even if interval is active
    if (this.cleanupInterval.unref) {
      this.cleanupInterval.unref();
    }
  }

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();
    const ip = req.ip || req.socket.remoteAddress || "unknown";
    const now = Date.now();

    const entry = this.store.get(ip);

    if (!entry || now > entry.resetAt) {
      // Evict expired entries if store is too large
      if (this.store.size >= this.maxStoreSize) {
        this.cleanup();
      }
      this.store.set(ip, { count: 1, resetAt: now + this.windowMs });
      return true;
    }

    entry.count++;

    if (entry.count > this.maxRequests) {
      throw new HttpException("Too Many Requests", HttpStatus.TOO_MANY_REQUESTS);
    }

    return true;
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [ip, entry] of this.store) {
      if (now > entry.resetAt) {
        this.store.delete(ip);
      }
    }
  }
}
