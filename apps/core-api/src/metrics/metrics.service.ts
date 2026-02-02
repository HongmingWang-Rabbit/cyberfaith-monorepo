import { Injectable } from "@nestjs/common";
import { RedisService } from "../redis/redis.service";

@Injectable()
export class MetricsService {
  private readonly PREFIX = "metrics:";

  // In-memory counters as fallback / primary for non-Redis
  private requestCount = 0;
  private errorCount = 0;
  private totalDurationMs = 0;
  private readonly activeUserSet = new Set<string>();
  private dbQueryCount = 0;

  // Hourly buckets (in-memory)
  private hourlyRequests: { ts: number; count: number }[] = [];

  constructor(private readonly redis: RedisService) {}

  recordRequest(durationMs: number, statusCode: number, userId?: string): void {
    this.requestCount++;
    this.totalDurationMs += durationMs;

    if (statusCode >= 400) this.errorCount++;
    if (userId) this.activeUserSet.add(userId);

    // Hourly bucket
    const hourTs = Math.floor(Date.now() / 3600000) * 3600000;
    const last = this.hourlyRequests[this.hourlyRequests.length - 1];
    if (last && last.ts === hourTs) {
      last.count++;
    } else {
      this.hourlyRequests.push({ ts: hourTs, count: 1 });
      // Keep only last 48 hours
      const cutoff = Date.now() - 48 * 3600000;
      this.hourlyRequests = this.hourlyRequests.filter(b => b.ts >= cutoff);
    }

    // Fire-and-forget Redis tracking
    if (this.redis.isConnected && userId) {
      const dayKey = this.PREFIX + "active_users:" + new Date().toISOString().slice(0, 10);
      this.redis.sadd(dayKey, userId).catch(() => {});
      this.redis.expire(dayKey, 172800).catch(() => {}); // 48h TTL
    }
  }

  recordDbQuery(): void {
    this.dbQueryCount++;
  }

  async getMetrics() {
    const now = Date.now();
    const oneHourAgo = now - 3600000;
    const oneDayAgo = now - 86400000;

    const requestsLastHour = this.hourlyRequests
      .filter(b => b.ts >= oneHourAgo)
      .reduce((s, b) => s + b.count, 0);

    const requestsLastDay = this.hourlyRequests
      .filter(b => b.ts >= oneDayAgo)
      .reduce((s, b) => s + b.count, 0);

    let activeUsers24h = this.activeUserSet.size;
    if (this.redis.isConnected) {
      try {
        const dayKey = this.PREFIX + "active_users:" + new Date().toISOString().slice(0, 10);
        activeUsers24h = await this.redis.scard(dayKey);
      } catch { /* use in-memory */ }
    }

    return {
      requestsLastHour,
      requestsLastDay,
      totalRequests: this.requestCount,
      errorCount: this.errorCount,
      errorRate: this.requestCount > 0 ? (this.errorCount / this.requestCount * 100).toFixed(2) + "%" : "0%",
      averageResponseMs: this.requestCount > 0 ? Math.round(this.totalDurationMs / this.requestCount) : 0,
      activeUsers24h,
      dbQueryCount: this.dbQueryCount,
    };
  }
}
