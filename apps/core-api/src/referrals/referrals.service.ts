import { Inject, Injectable, HttpStatus } from "@nestjs/common";
import { eq, and, sql } from "drizzle-orm";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { DRIZZLE } from "../db/db.module";
import { users, referrals, pointsTransactions } from "../db/schema";
import { AppException } from "../common/app.exception";
import { ErrorCode } from "../common/error-codes";
import { randomBytes } from "crypto";

const REFERRER_KARMA = 100;
const REFERRER_PREMIUM_DAYS = 3;
const REFERRED_KARMA = 50;

@Injectable()
export class ReferralsService {
  constructor(@Inject(DRIZZLE) private db: PostgresJsDatabase) {}

  private generateCode(): string {
    return randomBytes(4).toString("hex").toUpperCase();
  }

  async getOrCreateReferralCode(userId: string): Promise<string> {
    const [user] = await this.db
      .select({ referralCode: users.referralCode })
      .from(users)
      .where(eq(users.id, userId));

    if (user?.referralCode) return user.referralCode;

    const code = this.generateCode();
    await this.db.update(users).set({ referralCode: code }).where(eq(users.id, userId));
    return code;
  }

  async applyReferralCode(referredUserId: string, code: string) {
    // Find referrer
    const [referrer] = await this.db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.referralCode, code));

    if (!referrer) {
      throw new AppException(ErrorCode.REFERRAL_CODE_NOT_FOUND, "Invalid referral code", HttpStatus.NOT_FOUND);
    }

    if (referrer.id === referredUserId) {
      throw new AppException(ErrorCode.CANNOT_REFER_SELF, "Cannot use your own referral code", HttpStatus.BAD_REQUEST);
    }

    // Check if already referred
    const existing = await this.db
      .select({ id: referrals.id })
      .from(referrals)
      .where(eq(referrals.referredUserId, referredUserId));

    if (existing.length > 0) {
      throw new AppException(ErrorCode.ALREADY_REFERRED, "You have already used a referral code", HttpStatus.CONFLICT);
    }

    // Create referral record
    const [ref] = await this.db
      .insert(referrals)
      .values({
        referrerId: referrer.id,
        referredUserId,
        code,
        status: "completed",
        karmaAwarded: REFERRER_KARMA,
        premiumDaysAwarded: REFERRER_PREMIUM_DAYS,
      })
      .returning();

    // Award referrer: karma + premium days
    await this.db
      .update(users)
      .set({
        karma: sql`${users.karma} + ${REFERRER_KARMA}`,
        premiumUntil: sql`GREATEST(COALESCE(${users.premiumUntil}, NOW()), NOW()) + INTERVAL '${sql.raw(String(REFERRER_PREMIUM_DAYS))} days'`,
      })
      .where(eq(users.id, referrer.id));

    await this.db.insert(pointsTransactions).values({
      userId: referrer.id,
      amount: REFERRER_KARMA,
      reason: "referral_reward",
      metadata: { referredUserId },
    });

    // Award referred user: karma
    await this.db
      .update(users)
      .set({ karma: sql`${users.karma} + ${REFERRED_KARMA}` })
      .where(eq(users.id, referredUserId));

    await this.db.insert(pointsTransactions).values({
      userId: referredUserId,
      amount: REFERRED_KARMA,
      reason: "referral_welcome",
      metadata: { referrerId: referrer.id },
    });

    return ref;
  }

  async listReferrals(userId: string) {
    const rows = await this.db
      .select({
        id: referrals.id,
        referredUserId: referrals.referredUserId,
        referredName: users.name,
        status: referrals.status,
        karmaAwarded: referrals.karmaAwarded,
        premiumDaysAwarded: referrals.premiumDaysAwarded,
        createdAt: referrals.createdAt,
      })
      .from(referrals)
      .leftJoin(users, eq(referrals.referredUserId, users.id))
      .where(eq(referrals.referrerId, userId));

    const totalKarma = rows.reduce((sum, r) => sum + r.karmaAwarded, 0);
    const totalPremiumDays = rows.reduce((sum, r) => sum + r.premiumDaysAwarded, 0);

    return { referrals: rows, totalKarma, totalPremiumDays, count: rows.length };
  }
}
