import { Inject, Injectable } from "@nestjs/common";
import { eq, and, lte, gte, desc } from "drizzle-orm";
import { DRIZZLE } from "../db/drizzle.provider";
import { events } from "../db/schema";
import { CacheService } from "../cache/cache.service";

@Injectable()
export class EventsService {
  constructor(
    @Inject(DRIZZLE) private db: any,
    private cache: CacheService,
  ) {}

  async getActiveEvents() {
    return this.cache.wrap("events:active", async () => {
      const now = new Date();
      const rows = await this.db
        .select()
        .from(events)
        .where(and(eq(events.active, true), lte(events.startDate, now), gte(events.endDate, now)))
        .orderBy(desc(events.startDate));
      return rows;
    }, 5 * 60 * 1000); // 5min cache
  }

  async getAllEvents() {
    return this.db.select().from(events).orderBy(desc(events.startDate));
  }

  async createEvent(data: {
    name: string;
    description?: string;
    type: "seasonal" | "holiday" | "astronomical";
    startDate: Date;
    endDate: Date;
    bannerImageUrl?: string;
    specialReadingType?: string;
    karmaMultiplier?: number;
  }) {
    const [event] = await this.db
      .insert(events)
      .values({
        name: data.name,
        description: data.description ?? null,
        type: data.type,
        startDate: data.startDate,
        endDate: data.endDate,
        bannerImageUrl: data.bannerImageUrl ?? null,
        specialReadingType: data.specialReadingType ?? null,
        karmaMultiplier: data.karmaMultiplier ?? 1,
      })
      .returning();
    await this.cache.invalidate("events:active");
    return event;
  }

  async getCurrentKarmaMultiplier(): Promise<number> {
    const active = await this.getActiveEvents();
    if (!active || active.length === 0) return 1;
    return Math.max(...active.map((e: any) => Number(e.karmaMultiplier) || 1));
  }
}
