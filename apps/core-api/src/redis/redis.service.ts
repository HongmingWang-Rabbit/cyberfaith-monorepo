import { Injectable, Logger, OnModuleDestroy } from "@nestjs/common";
import Redis from "ioredis";

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis | null = null;
  private readonly fallback = new Map<string, { value: string; expiresAt: number }>();
  private readonly maxFallbackSize = 10_000;

  get isConnected(): boolean {
    return this.client?.status === "ready";
  }

  constructor() {
    const url = process.env.REDIS_URL;
    if (url) {
      try {
        this.client = new Redis(url, {
          maxRetriesPerRequest: 3,
          lazyConnect: true,
          retryStrategy: (times) => Math.min(times * 200, 5000),
        });
        this.client.connect().then(() => {
          this.logger.log("Connected to Redis");
        }).catch((err) => {
          this.logger.warn(`Redis connection failed, using in-memory fallback: ${err.message}`);
          this.client?.disconnect();
          this.client = null;
        });
      } catch (err: any) {
        this.logger.warn(`Redis init failed: ${err.message}`);
        this.client = null;
      }
    } else {
      this.logger.warn("REDIS_URL not set — using in-memory fallback");
    }
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.quit().catch(() => {});
    }
  }

  async get(key: string): Promise<string | null> {
    if (this.client) {
      try {
        return await this.client.get(key);
      } catch {
        return this.fallbackGet(key);
      }
    }
    return this.fallbackGet(key);
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (this.client) {
      try {
        if (ttlSeconds) {
          await this.client.set(key, value, "EX", ttlSeconds);
        } else {
          await this.client.set(key, value);
        }
        return;
      } catch {
        // fall through
      }
    }
    this.fallbackSet(key, value, ttlSeconds);
  }

  async del(key: string): Promise<void> {
    if (this.client) {
      try {
        await this.client.del(key);
        return;
      } catch {
        // fall through
      }
    }
    this.fallback.delete(key);
  }

  async incr(key: string): Promise<number> {
    if (this.client) {
      try {
        return await this.client.incr(key);
      } catch {
        // fall through
      }
    }
    const val = this.fallbackGet(key);
    const num = (parseInt(val || "0", 10) || 0) + 1;
    this.fallbackSet(key, String(num));
    return num;
  }

  async expire(key: string, seconds: number): Promise<void> {
    if (this.client) {
      try {
        await this.client.expire(key, seconds);
        return;
      } catch {
        // fall through
      }
    }
    const entry = this.fallback.get(key);
    if (entry) {
      entry.expiresAt = Date.now() + seconds * 1000;
    }
  }

  async keys(pattern: string): Promise<string[]> {
    if (this.client) {
      try {
        return await this.client.keys(pattern);
      } catch {
        // fall through
      }
    }
    const regex = new RegExp("^" + pattern.replace(/\*/g, ".*") + "$");
    const result: string[] = [];
    const now = Date.now();
    for (const [k, v] of this.fallback) {
      if (v.expiresAt && now > v.expiresAt) {
        this.fallback.delete(k);
        continue;
      }
      if (regex.test(k)) result.push(k);
    }
    return result;
  }

  async sadd(key: string, ...members: string[]): Promise<number> {
    if (this.client) {
      try {
        return await this.client.sadd(key, ...members);
      } catch {
        // fall through
      }
    }
    const existing = new Set(JSON.parse(this.fallbackGet(key) || "[]") as string[]);
    let added = 0;
    for (const m of members) {
      if (!existing.has(m)) { existing.add(m); added++; }
    }
    this.fallbackSet(key, JSON.stringify([...existing]));
    return added;
  }

  async sismember(key: string, member: string): Promise<boolean> {
    if (this.client) {
      try {
        return (await this.client.sismember(key, member)) === 1;
      } catch {
        // fall through
      }
    }
    const set = new Set(JSON.parse(this.fallbackGet(key) || "[]") as string[]);
    return set.has(member);
  }

  async scard(key: string): Promise<number> {
    if (this.client) {
      try {
        return await this.client.scard(key);
      } catch {
        // fall through
      }
    }
    const set = JSON.parse(this.fallbackGet(key) || "[]") as string[];
    return set.length;
  }

  // --- fallback helpers ---
  private fallbackGet(key: string): string | null {
    const entry = this.fallback.get(key);
    if (!entry) return null;
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.fallback.delete(key);
      return null;
    }
    return entry.value;
  }

  private fallbackSet(key: string, value: string, ttlSeconds?: number): void {
    if (this.fallback.size >= this.maxFallbackSize && !this.fallback.has(key)) {
      const first = this.fallback.keys().next().value;
      if (first !== undefined) this.fallback.delete(first);
    }
    this.fallback.set(key, {
      value,
      expiresAt: ttlSeconds ? Date.now() + ttlSeconds * 1000 : 0,
    });
  }
}
