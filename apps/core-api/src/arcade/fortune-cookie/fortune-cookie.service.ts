import { Inject, Injectable, HttpStatus } from "@nestjs/common";
import { eq, sql, desc } from "drizzle-orm";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { DRIZZLE } from "../../db/db.module";
import { fortuneCookieCracks } from "../../db/schema";
import { PointsService } from "../../points/points.service";
import { AppException } from "../../common/app.exception";
import { ErrorCode } from "../../common/error-codes";

const FORTUNES = [
  "Your spiritual journey is about to take a magnificent turn.",
  "The universe whispers secrets to those who listen in stillness.",
  "A karmic debt will be repaid to you in unexpected kindness.",
  "Your meditation practice will unlock doors you didn't know existed.",
  "The stars are aligning for a profound revelation in your life.",
  "Trust the path — even detours have divine purpose.",
  "An old soul connection will resurface bringing deep wisdom.",
  "Your inner light is brighter than you realize. Let it shine.",
  "The answer you seek is already within you. Be still and know.",
  "A blessing disguised as a challenge approaches. Embrace it.",
  "Your ancestors smile upon your choices. Keep walking this path.",
  "The next full moon will bring clarity to a lingering question.",
  "A synchronicity today will confirm you're on the right track.",
  "Your compassion is your superpower. Wield it generously.",
  "The cosmos is conspiring in your favor. Stay open to miracles.",
  "A dream tonight will carry an important message. Pay attention.",
  "Your energy is magnetic right now. Use it to attract abundance.",
  "The teacher will appear when the student is ready. You are ready.",
  "A forgotten talent will reemerge and surprise everyone, including you.",
  "The ripple of your good deeds travels farther than you know.",
  "Balance is not found — it is created, moment by moment.",
  "Your third eye is opening. Trust what you see beyond the visible.",
  "A chance encounter will spark a transformative friendship.",
  "The universe rewards patience with miracles. Yours is coming.",
  "Your spiritual practice is planting seeds of joy for future harvests.",
  "An unexpected gift of wisdom arrives from the most unlikely source.",
  "The harmony you create within radiates peace to all around you.",
  "Your intuition is sharp today. Follow it without hesitation.",
  "A cycle is completing. What ends now makes space for something greater.",
  "You are the ancestor your future lineage will be grateful for.",
];

const KARMA_REWARD = 5;

@Injectable()
export class FortuneCookieService {
  constructor(
    @Inject(DRIZZLE) private db: PostgresJsDatabase,
    private pointsService: PointsService,
  ) {}

  async crack(userId: string) {
    // Check daily limit
    const today = new Date().toISOString().split("T")[0];
    const todayCracks = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(fortuneCookieCracks)
      .where(
        sql`${fortuneCookieCracks.userId} = ${userId} AND date(${fortuneCookieCracks.createdAt}) = ${today}`,
      );

    if (Number(todayCracks[0]?.count ?? 0) >= 1) {
      throw new AppException(
        ErrorCode.DAILY_LIMIT_REACHED,
        "You already cracked your fortune cookie today! Come back tomorrow.",
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const fortune = FORTUNES[Math.floor(Math.random() * FORTUNES.length)]!;

    const [record] = await this.db
      .insert(fortuneCookieCracks)
      .values({
        userId,
        fortune,
        pointsEarned: KARMA_REWARD,
      })
      .returning();

    await this.pointsService.awardPoints(userId, KARMA_REWARD, "fortune_cookie", {
      fortune,
    });

    return {
      fortune,
      pointsEarned: KARMA_REWARD,
      crackedAt: record!.createdAt,
    };
  }

  async getStatus(userId: string) {
    const today = new Date().toISOString().split("T")[0];
    const todayCracks = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(fortuneCookieCracks)
      .where(
        sql`${fortuneCookieCracks.userId} = ${userId} AND date(${fortuneCookieCracks.createdAt}) = ${today}`,
      );

    const totalCracks = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(fortuneCookieCracks)
      .where(eq(fortuneCookieCracks.userId, userId));

    const lastCrack = await this.db
      .select()
      .from(fortuneCookieCracks)
      .where(eq(fortuneCookieCracks.userId, userId))
      .orderBy(desc(fortuneCookieCracks.createdAt))
      .limit(1);

    return {
      crackedToday: Number(todayCracks[0]?.count ?? 0) >= 1,
      totalCracks: Number(totalCracks[0]?.count ?? 0),
      lastFortune: lastCrack[0]?.fortune ?? null,
    };
  }
}
