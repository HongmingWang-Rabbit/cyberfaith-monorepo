import { Injectable, Logger } from "@nestjs/common";
import { RedisService } from "../redis/redis.service";

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);
  private readonly memStore = new Map<string, CacheEntry<unknown>>();
  private readonly maxSize: number;
  private readonly defaultTtlMs: number;
  private readonly PREFIX = "cache:";

  // Metrics
  private hits = 0;
  private misses = 0;

  constructor(
    private readonly redis: RedisService,
    maxSize = 500,
    defaultTtlMs = 15 * 60 * 1000,
  ) {
    this.maxSize = maxSize;
    this.defaultTtlMs = defaultTtlMs;
  }

  get hitRate(): number {
    const total = this.hits + this.misses;
    return total === 0 ? 0 : this.hits / total;
  }

  get totalHits(): number { return this.hits; }
  get totalMisses(): number { return this.misses; }

  async get<T>(key: string): Promise<T | null> {
    // Try Redis first
    if (this.redis.isConnected) {
      try {
        const raw = await this.redis.get(this.PREFIX + key);
        if (raw) {
          this.hits++;
          return JSON.parse(raw) as T;
        }
        this.misses++;
        return null;
      } catch {
        // fall through to memory
      }
    }

    // In-memory fallback
    const entry = this.memStore.get(key) as CacheEntry<T> | undefined;
    if (!entry) { this.misses++; return null; }

    if (Date.now() > entry.expiresAt) {
      this.memStore.delete(key);
      this.misses++;
      return null;
    }

    this.memStore.delete(key);
    this.memStore.set(key, entry);
    this.hits++;
    return entry.value;
  }

  async set<T>(key: string, value: T, ttlMs?: number): Promise<void> {
    const ttl = ttlMs ?? this.defaultTtlMs;

    if (this.redis.isConnected) {
      try {
        await this.redis.set(this.PREFIX + key, JSON.stringify(value), Math.ceil(ttl / 1000));
        return;
      } catch {
        // fall through
      }
    }

    if (this.memStore.size >= this.maxSize && !this.memStore.has(key)) {
      const firstKey = this.memStore.keys().next().value;
      if (firstKey !== undefined) this.memStore.delete(firstKey);
    }
    this.memStore.set(key, { value, expiresAt: Date.now() + ttl });
  }

  async invalidate(key: string): Promise<boolean> {
    if (this.redis.isConnected) {
      try { await this.redis.del(this.PREFIX + key); return true; } catch { /* fall through */ }
    }
    return this.memStore.delete(key);
  }

  async invalidatePattern(pattern: string): Promise<number> {
    if (this.redis.isConnected) {
      try {
        const keys = await this.redis.keys(this.PREFIX + pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\\\*/g, "*"));
        for (const k of keys) await this.redis.del(k);
        if (keys.length > 0) this.logger.debug(`Invalidated ${keys.length} Redis entries matching ${pattern}`);
        return keys.length;
      } catch { /* fall through */ }
    }

    const regex = new RegExp(pattern);
    let count = 0;
    for (const key of this.memStore.keys()) {
      if (regex.test(key)) { this.memStore.delete(key); count++; }
    }
    if (count > 0) this.logger.debug(`Invalidated ${count} entries matching /${pattern}/`);
    return count;
  }

  async clear(): Promise<void> {
    if (this.redis.isConnected) {
      try {
        const keys = await this.redis.keys(this.PREFIX + "*");
        for (const k of keys) await this.redis.del(k);
      } catch { /* fall through */ }
    }
    this.memStore.clear();
  }

  get size(): number {
    return this.memStore.size;
  }

  /** Wrap an async function with caching */
  async wrap<T>(key: string, fn: () => Promise<T>, ttlMs?: number): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      this.logger.debug(`Cache HIT: ${key}`);
      return cached;
    }

    this.logger.debug(`Cache MISS: ${key}`);
    const result = await fn();
    await this.set(key, result, ttlMs);
    return result;
  }
}
