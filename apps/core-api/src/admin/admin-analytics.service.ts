import { Inject, Injectable } from "@nestjs/common";
import { DRIZZLE } from "../db/drizzle.provider";
import { users, readings, readingReactions, comments } from "../db/schema";
import { sql, gte, and, eq, count, desc } from "drizzle-orm";

@Injectable()
export class AdminAnalyticsService {
  constructor(@Inject(DRIZZLE) private db: any) {}

  async getAnalytics(fromDate?: Date, toDate?: Date) {
    const now = new Date();
    const from = fromDate || new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const to = toDate || now;

    const [
      userGrowth,
      activeUsers,
      readingVolume,
      revenue,
      topReadings,
      conversionFunnel,
      retention,
    ] = await Promise.all([
      this.getUserGrowth(from, to),
      this.getActiveUsers(),
      this.getReadingVolume(from, to),
      this.getRevenue(),
      this.getTopReadings(20),
      this.getConversionFunnel(),
      this.getRetention(),
    ]);

    return {
      userGrowth,
      activeUsers,
      readingVolume,
      revenue,
      topReadings,
      conversionFunnel,
      retention,
    };
  }

  /** Daily signups for the date range */
  private async getUserGrowth(from: Date, to: Date) {
    const rows = await this.db.execute(sql`
      SELECT date_trunc('day', created_at)::date AS day,
             count(*)::int AS signups
      FROM users
      WHERE created_at >= ${from} AND created_at <= ${to}
      GROUP BY day
      ORDER BY day
    `);
    return rows.rows ?? rows;
  }

  /** DAU / WAU / MAU based on readings activity */
  private async getActiveUsers() {
    const now = new Date();
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [dau, wau, mau] = await Promise.all([
      this.db.execute(sql`SELECT count(DISTINCT user_id)::int AS c FROM readings WHERE created_at >= ${dayAgo}`),
      this.db.execute(sql`SELECT count(DISTINCT user_id)::int AS c FROM readings WHERE created_at >= ${weekAgo}`),
      this.db.execute(sql`SELECT count(DISTINCT user_id)::int AS c FROM readings WHERE created_at >= ${monthAgo}`),
    ]);

    return {
      dau: (dau.rows ?? dau)[0]?.c ?? 0,
      wau: (wau.rows ?? wau)[0]?.c ?? 0,
      mau: (mau.rows ?? mau)[0]?.c ?? 0,
    };
  }

  /** Reading volume by type for the date range */
  private async getReadingVolume(from: Date, to: Date) {
    const rows = await this.db.execute(sql`
      SELECT date_trunc('day', created_at)::date AS day,
             type,
             count(*)::int AS volume
      FROM readings
      WHERE created_at >= ${from} AND created_at <= ${to}
      GROUP BY day, type
      ORDER BY day
    `);
    return rows.rows ?? rows;
  }

  /** Revenue metrics from Stripe subscriptions */
  private async getRevenue() {
    const [totalSubs] = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(users)
      .where(eq(users.subscriptionTier, "pro"));

    // Approximate MRR at $9.99/sub
    const pricePerSub = 9.99;
    const mrr = totalSubs.count * pricePerSub;

    // Churn: users who were pro but downgraded (have stripeSubscriptionId but tier=free)
    const [churned] = await this.db.execute(sql`
      SELECT count(*)::int AS c FROM users
      WHERE subscription_tier = 'free' AND stripe_subscription_id IS NOT NULL
    `);
    const churnedCount = (churned?.c ?? (Array.isArray(churned) ? 0 : 0));

    return {
      mrr: Math.round(mrr * 100) / 100,
      totalSubscribers: totalSubs.count,
      churnedUsers: typeof churnedCount === 'number' ? churnedCount : 0,
    };
  }

  /** Top readings by reactions + comments count */
  private async getTopReadings(limit: number) {
    const rows = await this.db.execute(sql`
      SELECT r.id, r.type, r.user_id, r.created_at,
             u.name AS user_name,
             coalesce(react_ct.cnt, 0)::int AS reaction_count,
             coalesce(comment_ct.cnt, 0)::int AS comment_count,
             (coalesce(react_ct.cnt, 0) + coalesce(comment_ct.cnt, 0))::int AS engagement
      FROM readings r
      LEFT JOIN users u ON u.id = r.user_id
      LEFT JOIN (
        SELECT reading_id, count(*) AS cnt FROM reading_reactions GROUP BY reading_id
      ) react_ct ON react_ct.reading_id = r.id
      LEFT JOIN (
        SELECT reading_id, count(*) AS cnt FROM comments WHERE deleted_at IS NULL GROUP BY reading_id
      ) comment_ct ON comment_ct.reading_id = r.id
      WHERE r.is_public = true
      ORDER BY engagement DESC
      LIMIT ${limit}
    `);
    return rows.rows ?? rows;
  }

  /** Conversion funnel: signup → first reading → second reading → subscription */
  private async getConversionFunnel() {
    const rows = await this.db.execute(sql`
      WITH user_stats AS (
        SELECT u.id,
               count(r.id)::int AS reading_count,
               u.subscription_tier
        FROM users u
        LEFT JOIN readings r ON r.user_id = u.id
        GROUP BY u.id, u.subscription_tier
      )
      SELECT
        count(*)::int AS total_signups,
        count(*) FILTER (WHERE reading_count >= 1)::int AS first_reading,
        count(*) FILTER (WHERE reading_count >= 2)::int AS second_reading,
        count(*) FILTER (WHERE subscription_tier = 'pro')::int AS subscribed
      FROM user_stats
    `);
    const row = (rows.rows ?? rows)[0];
    return {
      totalSignups: row?.total_signups ?? 0,
      firstReading: row?.first_reading ?? 0,
      secondReading: row?.second_reading ?? 0,
      subscribed: row?.subscribed ?? 0,
    };
  }

  /** Cohort retention: day 1, day 7, day 30 */
  private async getRetention() {
    const rows = await this.db.execute(sql`
      WITH cohorts AS (
        SELECT id AS user_id,
               date_trunc('day', created_at)::date AS signup_date
        FROM users
        WHERE created_at >= now() - interval '60 days'
      ),
      activity AS (
        SELECT user_id,
               date_trunc('day', created_at)::date AS activity_date
        FROM readings
        WHERE created_at >= now() - interval '60 days'
        GROUP BY user_id, date_trunc('day', created_at)::date
      )
      SELECT
        c.signup_date,
        count(DISTINCT c.user_id)::int AS cohort_size,
        count(DISTINCT CASE WHEN a.activity_date = c.signup_date + interval '1 day' THEN c.user_id END)::int AS day1,
        count(DISTINCT CASE WHEN a.activity_date = c.signup_date + interval '7 days' THEN c.user_id END)::int AS day7,
        count(DISTINCT CASE WHEN a.activity_date = c.signup_date + interval '30 days' THEN c.user_id END)::int AS day30
      FROM cohorts c
      LEFT JOIN activity a ON a.user_id = c.user_id
      GROUP BY c.signup_date
      ORDER BY c.signup_date
    `);
    return rows.rows ?? rows;
  }
}
