import { Injectable, Logger } from "@nestjs/common";

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);
  private readonly store = new Map<string, CacheEntry<unknown>>();
  private readonly maxSize: number;
  private readonly defaultTtlMs: number;

  constructor(maxSize = 500, defaultTtlMs = 15 * 60 * 1000) {
    this.maxSize = maxSize;
    this.defaultTtlMs = defaultTtlMs;
  }

  get<T>(key: string): T | null {
    const entry = this.store.get(key) as CacheEntry<T> | undefined;
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }

    // Move to end for LRU behavior (Map preserves insertion order)
    this.store.delete(key);
    this.store.set(key, entry);
    return entry.value;
  }

  set<T>(key: string, value: T, ttlMs?: number): void {
    // Evict oldest if at capacity
    if (this.store.size >= this.maxSize && !this.store.has(key)) {
      const firstKey = this.store.keys().next().value;
      if (firstKey !== undefined) {
        this.store.delete(firstKey);
      }
    }

    this.store.set(key, {
      value,
      expiresAt: Date.now() + (ttlMs ?? this.defaultTtlMs),
    });
  }

  invalidate(key: string): boolean {
    return this.store.delete(key);
  }

  invalidatePattern(pattern: string): number {
    const regex = new RegExp(pattern);
    let count = 0;
    for (const key of this.store.keys()) {
      if (regex.test(key)) {
        this.store.delete(key);
        count++;
      }
    }
    if (count > 0) {
      this.logger.debug(`Invalidated ${count} entries matching /${pattern}/`);
    }
    return count;
  }

  clear(): void {
    this.store.clear();
  }

  get size(): number {
    return this.store.size;
  }

  /** Wrap an async function with caching */
  async wrap<T>(key: string, fn: () => Promise<T>, ttlMs?: number): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== null) {
      this.logger.debug(`Cache HIT: ${key}`);
      return cached;
    }

    this.logger.debug(`Cache MISS: ${key}`);
    const result = await fn();
    this.set(key, result, ttlMs);
    return result;
  }
}
