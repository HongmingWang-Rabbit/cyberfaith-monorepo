import { Inject, Injectable } from "@nestjs/common";
import { eq, desc, sql } from "drizzle-orm";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { DRIZZLE } from "../db/db.module";
import { pointsTransactions, users } from "../db/schema";

@Injectable()
export class PointsService {
  constructor(@Inject(DRIZZLE) private db: PostgresJsDatabase) {}

  async awardPoints(
    userId: string,
    amount: number,
    reason: string,
    metadata?: Record<string, any>,
  ) {
    const [tx] = await this.db
      .insert(pointsTransactions)
      .values({ userId, amount, reason, metadata: metadata ?? null })
      .returning();
    return tx;
  }

  async getUserPoints(userId: string) {
    const totalResult = await this.db
      .select({ total: sql<number>`coalesce(sum(${pointsTransactions.amount}), 0)` })
      .from(pointsTransactions)
      .where(eq(pointsTransactions.userId, userId));

    const recent = await this.db
      .select()
      .from(pointsTransactions)
      .where(eq(pointsTransactions.userId, userId))
      .orderBy(desc(pointsTransactions.createdAt))
      .limit(20);

    return {
      total: Number(totalResult[0]?.total ?? 0),
      recent,
    };
  }

  async getLeaderboard(limit = 10) {
    const rows = await this.db
      .select({
        userId: pointsTransactions.userId,
        name: users.name,
        total: sql<number>`coalesce(sum(${pointsTransactions.amount}), 0)`,
      })
      .from(pointsTransactions)
      .leftJoin(users, eq(pointsTransactions.userId, users.id))
      .groupBy(pointsTransactions.userId, users.name)
      .orderBy(sql`sum(${pointsTransactions.amount}) desc`)
      .limit(limit);

    return rows.map((r, index) => ({
      rank: index + 1,
      displayName: r.name || `User #${r.userId.slice(0, 4).toUpperCase()}`,
      total: Number(r.total),
    }));
  }
}
