import { Inject, Injectable } from "@nestjs/common";
import { eq, and, desc, gte, sql, count } from "drizzle-orm";
import { DRIZZLE } from "../db/drizzle.provider";
import { readings, readingReactions, users } from "../db/schema";
import { CacheService } from "../cache/cache.service";

@Injectable()
export class FeaturedReadingService {
  constructor(
    @Inject(DRIZZLE) private db: any,
    private cache: CacheService,
  ) {}

  async getFeaturedReading() {
    return this.cache.wrap("readings:featured", async () => {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);

      // Find reading with most reactions in last 24h
      const topReacted = await this.db
        .select({
          readingId: readingReactions.readingId,
          reactionCount: count(),
        })
        .from(readingReactions)
        .where(gte(readingReactions.createdAt, yesterday))
        .groupBy(readingReactions.readingId)
        .orderBy(desc(count()))
        .limit(1);

      let readingId: string | null = topReacted.length > 0 ? topReacted[0].readingId : null;

      // If no reacted reading, pick a random recent public reading
      if (!readingId) {
        const recent = await this.db
          .select({ id: readings.id })
          .from(readings)
          .where(eq(readings.isPublic, true))
          .orderBy(sql`random()`)
          .limit(1);
        readingId = recent.length > 0 ? recent[0].id : null;
      }

      if (!readingId) return null;

      const [reading] = await this.db
        .select({
          id: readings.id,
          type: readings.type,
          result: readings.result,
          locale: readings.locale,
          createdAt: readings.createdAt,
          authorName: users.name,
          authorUsername: users.username,
          authorAvatar: users.avatarUrl,
          authorId: users.id,
        })
        .from(readings)
        .innerJoin(users, eq(readings.userId, users.id))
        .where(and(eq(readings.id, readingId), eq(readings.isPublic, true)));

      return reading ?? null;
    }, 24 * 60 * 60 * 1000); // 24h cache
  }
}
