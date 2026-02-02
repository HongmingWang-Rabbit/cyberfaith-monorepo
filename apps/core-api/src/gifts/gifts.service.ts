import { Inject, Injectable, HttpStatus } from "@nestjs/common";
import { eq, and, sql } from "drizzle-orm";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { DRIZZLE } from "../db/db.module";
import { giftReadings, users, pointsTransactions } from "../db/schema";
import { AppException } from "../common/app.exception";
import { ErrorCode } from "../common/error-codes";
import { randomUUID } from "crypto";

const GIFT_KARMA_COST = 50;

@Injectable()
export class GiftsService {
  constructor(@Inject(DRIZZLE) private db: PostgresJsDatabase) {}

  async createGift(senderId: string, data: { readingType: string; recipientEmail?: string; message?: string }) {
    // Check sender has enough karma (or is premium)
    const [sender] = await this.db
      .select({ karma: users.karma, premiumUntil: users.premiumUntil, subscriptionTier: users.subscriptionTier })
      .from(users)
      .where(eq(users.id, senderId));

    const isPremium = sender?.subscriptionTier !== "free" ||
      (sender?.premiumUntil && new Date(sender.premiumUntil) > new Date());

    if (!isPremium && (sender?.karma ?? 0) < GIFT_KARMA_COST) {
      throw new AppException(ErrorCode.INSUFFICIENT_POINTS, `Need ${GIFT_KARMA_COST} karma to gift a reading`, HttpStatus.PAYMENT_REQUIRED);
    }

    // Deduct karma if not premium
    if (!isPremium) {
      await this.db
        .update(users)
        .set({ karma: sql`${users.karma} - ${GIFT_KARMA_COST}` })
        .where(eq(users.id, senderId));

      await this.db.insert(pointsTransactions).values({
        userId: senderId,
        amount: -GIFT_KARMA_COST,
        reason: "gift_reading",
      });
    }

    const redeemCode = randomUUID().replace(/-/g, "").slice(0, 12).toUpperCase();

    const [gift] = await this.db
      .insert(giftReadings)
      .values({
        senderId,
        recipientEmail: data.recipientEmail || null,
        readingType: data.readingType,
        message: data.message || null,
        redeemCode,
      })
      .returning();

    return gift;
  }

  async redeemGift(code: string, userId: string) {
    const [gift] = await this.db
      .select()
      .from(giftReadings)
      .where(eq(giftReadings.redeemCode, code));

    if (!gift) {
      throw new AppException(ErrorCode.GIFT_NOT_FOUND, "Gift not found", HttpStatus.NOT_FOUND);
    }

    if (gift.redeemed) {
      throw new AppException(ErrorCode.GIFT_ALREADY_REDEEMED, "This gift has already been redeemed", HttpStatus.CONFLICT);
    }

    const [updated] = await this.db
      .update(giftReadings)
      .set({
        redeemed: true,
        redeemedAt: new Date(),
        redeemedByUserId: userId,
        recipientUserId: userId,
      })
      .where(eq(giftReadings.id, gift.id))
      .returning();

    return updated;
  }

  async getGiftByCode(code: string) {
    const [gift] = await this.db
      .select({
        id: giftReadings.id,
        readingType: giftReadings.readingType,
        message: giftReadings.message,
        redeemed: giftReadings.redeemed,
        senderName: users.name,
        createdAt: giftReadings.createdAt,
      })
      .from(giftReadings)
      .leftJoin(users, eq(giftReadings.senderId, users.id))
      .where(eq(giftReadings.redeemCode, code));

    if (!gift) {
      throw new AppException(ErrorCode.GIFT_NOT_FOUND, "Gift not found", HttpStatus.NOT_FOUND);
    }

    return gift;
  }

  async listSentGifts(userId: string) {
    return this.db
      .select()
      .from(giftReadings)
      .where(eq(giftReadings.senderId, userId));
  }

  async listReceivedGifts(userId: string) {
    return this.db
      .select({
        id: giftReadings.id,
        readingType: giftReadings.readingType,
        message: giftReadings.message,
        redeemed: giftReadings.redeemed,
        senderName: users.name,
        createdAt: giftReadings.createdAt,
      })
      .from(giftReadings)
      .leftJoin(users, eq(giftReadings.senderId, users.id))
      .where(eq(giftReadings.recipientUserId, userId));
  }
}
