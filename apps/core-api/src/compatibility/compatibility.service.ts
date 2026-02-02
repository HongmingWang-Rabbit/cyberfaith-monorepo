import { Inject, Injectable } from "@nestjs/common";
import { eq, and, or } from "drizzle-orm";
import { DRIZZLE } from "../db/drizzle.provider";
import { compatibilityResults, users, friendships } from "../db/schema";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { AppException } from "../common/app.exception";
import { ErrorCode } from "../common/error-codes";
import { HttpStatus } from "@nestjs/common";

export interface CompatibilityContent {
  overallScore: number;
  loveScore: number;
  friendshipScore: number;
  workScore: number;
  strengths: string[];
  challenges: string[];
  advice: string;
  cosmicVerdict: string;
}

@Injectable()
export class CompatibilityService {
  constructor(@Inject(DRIZZLE) private db: PostgresJsDatabase) {}

  /**
   * Normalize pair so sign1+sign2 == sign2+sign1 for caching.
   * Sort alphabetically; for MBTI, keep them aligned with their sign.
   */
  private normalizePair(sign1: string, sign2: string, mbti1?: string, mbti2?: string) {
    if (sign1 <= sign2) {
      return { sign1, sign2, mbtiType1: mbti1 || null, mbtiType2: mbti2 || null };
    }
    return { sign1: sign2, sign2: sign1, mbtiType1: mbti2 || null, mbtiType2: mbti1 || null };
  }

  async findCached(sign1: string, sign2: string, mbti1?: string, mbti2?: string) {
    const norm = this.normalizePair(sign1, sign2, mbti1, mbti2);
    const conditions = [
      eq(compatibilityResults.sign1, norm.sign1),
      eq(compatibilityResults.sign2, norm.sign2),
    ];

    // For MBTI matching we need to handle nulls
    const rows = await this.db
      .select()
      .from(compatibilityResults)
      .where(and(...conditions));

    // Find exact match including MBTI
    return rows.find(
      (r) =>
        (r.mbtiType1 || null) === norm.mbtiType1 &&
        (r.mbtiType2 || null) === norm.mbtiType2,
    ) || null;
  }

  async saveResult(
    sign1: string,
    sign2: string,
    content: CompatibilityContent,
    mbti1?: string,
    mbti2?: string,
  ) {
    const norm = this.normalizePair(sign1, sign2, mbti1, mbti2);
    const [result] = await this.db
      .insert(compatibilityResults)
      .values({
        sign1: norm.sign1,
        sign2: norm.sign2,
        mbtiType1: norm.mbtiType1,
        mbtiType2: norm.mbtiType2,
        content,
      })
      .onConflictDoUpdate({
        target: [compatibilityResults.sign1, compatibilityResults.sign2, compatibilityResults.mbtiType1, compatibilityResults.mbtiType2],
        set: { content },
      })
      .returning();
    return result;
  }

  async getFriendProfile(friendId: string, userId: string) {
    // Verify friendship
    const [friendship] = await this.db
      .select()
      .from(friendships)
      .where(
        and(
          eq(friendships.status, "accepted"),
          or(
            and(eq(friendships.requesterId, userId), eq(friendships.addresseeId, friendId)),
            and(eq(friendships.requesterId, friendId), eq(friendships.addresseeId, userId)),
          ),
        ),
      );

    if (!friendship) {
      throw new AppException(ErrorCode.FRIENDSHIP_NOT_FOUND, "Not friends with this user", HttpStatus.NOT_FOUND);
    }

    const [friend] = await this.db
      .select({ id: users.id, name: users.name, zodiacSign: users.zodiacSign, avatarUrl: users.avatarUrl })
      .from(users)
      .where(eq(users.id, friendId));

    if (!friend) {
      throw new AppException(ErrorCode.USER_NOT_FOUND, "User not found", HttpStatus.NOT_FOUND);
    }

    return friend;
  }

  async getUserProfile(userId: string) {
    const [user] = await this.db
      .select({ id: users.id, name: users.name, zodiacSign: users.zodiacSign })
      .from(users)
      .where(eq(users.id, userId));
    return user || null;
  }
}
