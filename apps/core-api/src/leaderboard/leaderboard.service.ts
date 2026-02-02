import { Inject, Injectable } from "@nestjs/common";
import { eq, desc, sql, gte, and } from "drizzle-orm";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { DRIZZLE } from "../db/db.module";
import { users, pointsTransactions } from "../db/schema";

@Injectable()
export class LeaderboardService {
  constructor(@Inject(DRIZZLE) private db: PostgresJsDatabase) {}

  async getLeaderboard(period: "weekly" | "monthly" | "all", limit = 50) {
    const dateFilter = this.getPeriodDate(period);

    const baseQuery = this.db
      .select({
        userId: users.id,
        displayName: users.name,
        username: users.username,
        avatarUrl: users.avatarUrl,
        zodiacSign: users.zodiacSign,
        karma: dateFilter
          ? sql<number>`coalesce(sum(${pointsTransactions.amount}), 0)`
          : users.karma,
      })
      .from(users);

    let rows: any[];

    if (dateFilter) {
      rows = await baseQuery
        .innerJoin(pointsTransactions, eq(users.id, pointsTransactions.userId))
        .where(and(gte(pointsTransactions.createdAt, dateFilter), eq(users.isActive, true)))
        .groupBy(users.id, users.name, users.username, users.avatarUrl, users.zodiacSign)
        .orderBy(sql`coalesce(sum(${pointsTransactions.amount}), 0) desc`)
        .limit(limit);
    } else {
      rows = await baseQuery
        .where(eq(users.isActive, true))
        .orderBy(desc(users.karma))
        .limit(limit);
    }

    return rows.map((r: any, i: number) => ({
      rank: i + 1,
      userId: r.userId,
      displayName: r.displayName,
      username: r.username,
      avatarUrl: r.avatarUrl,
      zodiacSign: r.zodiacSign,
      karma: Number(r.karma),
    }));
  }

  async getUserRank(userId: string, period: "weekly" | "monthly" | "all") {
    const dateFilter = this.getPeriodDate(period);

    let userKarma: number;

    if (dateFilter) {
      const [row] = await this.db
        .select({ karma: sql<number>`coalesce(sum(${pointsTransactions.amount}), 0)` })
        .from(pointsTransactions)
        .where(and(eq(pointsTransactions.userId, userId), gte(pointsTransactions.createdAt, dateFilter)));
      userKarma = Number(row?.karma ?? 0);
    } else {
      const [row] = await this.db.select({ karma: users.karma }).from(users).where(eq(users.id, userId));
      userKarma = Number(row?.karma ?? 0);
    }

    // Count users with more karma
    let rankQuery;
    if (dateFilter) {
      const [countRow] = await this.db
        .select({ count: sql<number>`count(distinct ${pointsTransactions.userId})` })
        .from(pointsTransactions)
        .where(
          and(
            gte(pointsTransactions.createdAt, dateFilter),
            sql`${pointsTransactions.userId} IN (
              SELECT user_id FROM points_transactions
              WHERE created_at >= ${dateFilter}
              GROUP BY user_id
              HAVING sum(amount) > ${userKarma}
            )`
          )
        );
      rankQuery = Number(countRow?.count ?? 0) + 1;
    } else {
      const [countRow] = await this.db
        .select({ count: sql<number>`count(*)` })
        .from(users)
        .where(and(eq(users.isActive, true), sql`${users.karma} > ${userKarma}`));
      rankQuery = Number(countRow?.count ?? 0) + 1;
    }

    const [user] = await this.db
      .select({
        displayName: users.name,
        username: users.username,
        avatarUrl: users.avatarUrl,
        zodiacSign: users.zodiacSign,
      })
      .from(users)
      .where(eq(users.id, userId));

    return {
      rank: rankQuery,
      userId,
      displayName: user?.displayName ?? "Unknown",
      username: user?.username,
      avatarUrl: user?.avatarUrl,
      zodiacSign: user?.zodiacSign,
      karma: userKarma,
    };
  }

  private getPeriodDate(period: string): Date | null {
    const now = new Date();
    if (period === "weekly") {
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }
    if (period === "monthly") {
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
    return null;
  }
}
