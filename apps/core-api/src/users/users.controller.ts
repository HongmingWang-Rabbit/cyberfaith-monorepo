import { Controller, Get, Patch, Delete, Body, Req, Param, UseGuards, Inject, NotFoundException, HttpStatus, Res } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import type { Request, Response } from "express";
import { DRIZZLE } from "../db/drizzle.provider";
import { users, userSettings, userAchievements, achievements, readings, journalEntries, pointsTransactions, userFollows, friendships, comments } from "../db/schema";
import { eq, sql, desc, count, and, gte, or } from "drizzle-orm";
import { AppException } from "../common/app.exception";
import { ErrorCode } from "../common/error-codes";
import { sanitizeText } from "../common/sanitize";
import { SetZodiacDto } from "../horoscope/dto/zodiac.dto";
import { UpdateSettingsDto } from "./dto/update-settings.dto";

interface AuthRequest extends Request {
  user: { id: string; email: string };
}

@Controller("users")
export class UsersController {
  constructor(@Inject(DRIZZLE) private readonly db: any) {}

  @Get()
  findAll() {
    return { success: true, data: [] };
  }

  @Get("profile/:username")
  async publicProfile(@Param("username") username: string) {
    const [user] = await this.db
      .select({
        id: users.id,
        name: users.name,
        username: users.username,
        avatarUrl: users.avatarUrl,
        zodiacSign: users.zodiacSign,
        karma: users.karma,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(and(eq(users.username, username), eq(users.isActive, true)));

    if (!user) throw new NotFoundException("User not found");

    // Check privacy settings
    const [settings] = await this.db
      .select({ privacyProfileVisible: userSettings.privacyProfileVisible })
      .from(userSettings)
      .where(eq(userSettings.userId, user.id));

    if (settings && !settings.privacyProfileVisible) {
      throw new NotFoundException("User not found");
    }

    // Get reading count
    const [readingCount] = await this.db
      .select({ count: count() })
      .from(readings)
      .where(eq(readings.userId, user.id));

    // Get achievements
    const userAchievementsList = await this.db
      .select({
        name: achievements.name,
        description: achievements.description,
        icon: achievements.icon,
        category: achievements.category,
        unlockedAt: userAchievements.unlockedAt,
      })
      .from(userAchievements)
      .innerJoin(achievements, eq(userAchievements.achievementId, achievements.id))
      .where(eq(userAchievements.userId, user.id));

    // Get recent public readings
    const publicReadings = await this.db
      .select({
        id: readings.id,
        type: readings.type,
        result: readings.result,
        createdAt: readings.createdAt,
      })
      .from(readings)
      .where(and(eq(readings.userId, user.id), eq(readings.isPublic, true)))
      .orderBy(desc(readings.createdAt))
      .limit(10);

    // Get follower/following counts
    const [followerCount] = await this.db
      .select({ count: count() })
      .from(userFollows)
      .where(eq(userFollows.followingId, user.id));

    const [followingCount] = await this.db
      .select({ count: count() })
      .from(userFollows)
      .where(eq(userFollows.followerId, user.id));

    return {
      success: true,
      data: {
        id: user.id,
        displayName: user.name,
        username: user.username,
        avatarUrl: user.avatarUrl,
        zodiacSign: user.zodiacSign,
        karma: user.karma,
        readingCount: Number(readingCount?.count ?? 0),
        followerCount: Number(followerCount?.count ?? 0),
        followingCount: Number(followingCount?.count ?? 0),
        achievements: userAchievementsList,
        recentReadings: publicReadings,
        joinDate: user.createdAt,
      },
    };
  }

  @UseGuards(AuthGuard("jwt"))
  @Get("me")
  async me(@Req() req: AuthRequest) {
    const [user] = await this.db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        username: users.username,
        avatarUrl: users.avatarUrl,
        subscriptionTier: users.subscriptionTier,
        zodiacSign: users.zodiacSign,
      })
      .from(users)
      .where(eq(users.id, req.user.id));

    if (!user) throw new NotFoundException("User not found");

    return { success: true, data: user };
  }

  @UseGuards(AuthGuard("jwt"))
  @Patch("zodiac")
  async setZodiac(@Req() req: AuthRequest, @Body() body: SetZodiacDto) {
    const [updated] = await this.db
      .update(users)
      .set({ zodiacSign: body.zodiacSign })
      .where(eq(users.id, req.user.id))
      .returning({
        id: users.id,
        zodiacSign: users.zodiacSign,
      });

    if (!updated) {
      throw new AppException(ErrorCode.USER_NOT_FOUND, "User not found", HttpStatus.NOT_FOUND);
    }

    return { success: true, data: updated };
  }

  @UseGuards(AuthGuard("jwt"))
  @Get("settings")
  async getSettings(@Req() req: AuthRequest) {
    const [existing] = await this.db
      .select()
      .from(userSettings)
      .where(eq(userSettings.userId, req.user.id));

    if (!existing) {
      // Return defaults
      return {
        success: true,
        data: {
          displayName: null,
          mbtiType: null,
          notificationEmailDigest: true,
          notificationPush: true,
          notificationStreakReminders: true,
          theme: "dark",
          language: "en",
          privacyProfileVisible: true,
          privacyReadingVisible: true,
        },
      };
    }

    const { id, createdAt, updatedAt, userId, ...settings } = existing;
    return { success: true, data: settings };
  }

  @UseGuards(AuthGuard("jwt"))
  @Patch("settings")
  async updateSettings(@Req() req: AuthRequest, @Body() body: UpdateSettingsDto) {
    const updates: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(body)) {
      if (value !== undefined) updates[key] = value;
    }
    if (Object.keys(updates).length === 0) {
      return { success: true, data: {} };
    }

    updates.updatedAt = new Date();

    // Upsert: try update first, then insert
    const [existing] = await this.db
      .select({ id: userSettings.id })
      .from(userSettings)
      .where(eq(userSettings.userId, req.user.id));

    if (existing) {
      await this.db
        .update(userSettings)
        .set(updates)
        .where(eq(userSettings.userId, req.user.id));
    } else {
      await this.db
        .insert(userSettings)
        .values({ userId: req.user.id, ...updates });
    }

    // Also update user display name, username on the users table if provided
    const userUpdates: Record<string, unknown> = {};
    if (body.displayName !== undefined) userUpdates.name = sanitizeText(body.displayName);
    if (body.username !== undefined) {
      // Check uniqueness
      const [existing] = await this.db
        .select({ id: users.id })
        .from(users)
        .where(and(eq(users.username, body.username), sql`${users.id} != ${req.user.id}`));
      if (existing) {
        throw new AppException(ErrorCode.VALIDATION_ERROR || "VALIDATION_ERROR", "Username already taken", HttpStatus.CONFLICT);
      }
      userUpdates.username = body.username;
    }
    if (Object.keys(userUpdates).length > 0) {
      await this.db.update(users).set(userUpdates).where(eq(users.id, req.user.id));
    }

    return { success: true, data: updates };
  }

  @UseGuards(AuthGuard("jwt"))
  @Delete("account")
  async deleteAccount(@Req() req: AuthRequest) {
    const now = new Date();
    // Soft delete: set deletedAt and anonymize
    await this.db
      .update(users)
      .set({
        deletedAt: now,
        name: "Deleted User",
        email: `deleted_${req.user.id}@cyberfaith.app`,
        avatarUrl: null,
        googleId: null,
        isActive: false,
      })
      .where(eq(users.id, req.user.id));

    return { success: true, message: "Account scheduled for deletion" };
  }

  @UseGuards(AuthGuard("jwt"))
  @Get("data-export")
  async dataExport(@Req() req: AuthRequest, @Res() res: Response) {
    const userId = req.user.id;

    const [userData, settingsData, userReadings, journal, points, friends, userComments] = await Promise.all([
      this.db.select().from(users).where(eq(users.id, userId)),
      this.db.select().from(userSettings).where(eq(userSettings.userId, userId)),
      this.db.select().from(readings).where(eq(readings.userId, userId)).orderBy(desc(readings.createdAt)),
      this.db.select().from(journalEntries).where(eq(journalEntries.userId, userId)).orderBy(desc(journalEntries.createdAt)),
      this.db.select().from(pointsTransactions).where(eq(pointsTransactions.userId, userId)).orderBy(desc(pointsTransactions.createdAt)),
      this.db.select().from(friendships).where(or(eq(friendships.requesterId, userId), eq(friendships.addresseeId, userId))),
      this.db.select().from(comments).where(eq(comments.userId, userId)),
    ]);

    const user = userData[0];
    const exportData = {
      exportDate: new Date().toISOString(),
      user: user ? {
        id: user.id,
        email: user.email,
        name: user.name,
        username: user.username,
        zodiacSign: user.zodiacSign,
        subscriptionTier: user.subscriptionTier,
        karma: user.karma,
        createdAt: user.createdAt,
      } : null,
      settings: settingsData[0] || null,
      readings: userReadings,
      journalEntries: journal,
      pointsTransactions: points,
      friendships: friends,
      comments: userComments,
    };

    res.setHeader("Content-Type", "application/json");
    res.setHeader("Content-Disposition", `attachment; filename="cyberfaith-data-export-${new Date().toISOString().slice(0, 10)}.json"`);
    return res.json(exportData);
  }

  @UseGuards(AuthGuard("jwt"))
  @Get("insights")
  async insights(@Req() req: AuthRequest) {
    const userId = req.user.id;
    const now = new Date();
    const twelveWeeksAgo = new Date(now.getTime() - 12 * 7 * 24 * 60 * 60 * 1000);

    // Total readings by type
    const readingsByType = await this.db
      .select({ type: readings.type, count: count() })
      .from(readings)
      .where(eq(readings.userId, userId))
      .groupBy(readings.type);

    const totalReadings = readingsByType.reduce((sum: number, r: any) => sum + Number(r.count), 0);
    const favoriteType = readingsByType.length > 0
      ? readingsByType.reduce((a: any, b: any) => Number(a.count) > Number(b.count) ? a : b).type
      : null;

    // Mood distribution from journal entries
    const moodDistribution = await this.db
      .select({ mood: journalEntries.mood, count: count() })
      .from(journalEntries)
      .where(eq(journalEntries.userId, userId))
      .groupBy(journalEntries.mood);

    // Reading activity per week (last 12 weeks)
    const weeklyActivity = await this.db
      .select({
        week: sql<string>`to_char(date_trunc('week', ${readings.createdAt}), 'YYYY-MM-DD')`.as("week"),
        count: count(),
      })
      .from(readings)
      .where(and(eq(readings.userId, userId), gte(readings.createdAt, twelveWeeksAgo)))
      .groupBy(sql`date_trunc('week', ${readings.createdAt})`)
      .orderBy(sql`date_trunc('week', ${readings.createdAt})`);

    // Mood trend over time (weekly)
    const moodTrend = await this.db
      .select({
        week: sql<string>`to_char(date_trunc('week', ${journalEntries.createdAt}), 'YYYY-MM-DD')`.as("week"),
        mood: journalEntries.mood,
        count: count(),
      })
      .from(journalEntries)
      .where(and(eq(journalEntries.userId, userId), gte(journalEntries.createdAt, twelveWeeksAgo)))
      .groupBy(sql`date_trunc('week', ${journalEntries.createdAt})`, journalEntries.mood)
      .orderBy(sql`date_trunc('week', ${journalEntries.createdAt})`);

    // Points earned over time (weekly)
    const pointsOverTime = await this.db
      .select({
        week: sql<string>`to_char(date_trunc('week', ${pointsTransactions.createdAt}), 'YYYY-MM-DD')`.as("week"),
        total: sql<number>`sum(${pointsTransactions.amount})`.as("total"),
      })
      .from(pointsTransactions)
      .where(and(eq(pointsTransactions.userId, userId), gte(pointsTransactions.createdAt, twelveWeeksAgo)))
      .groupBy(sql`date_trunc('week', ${pointsTransactions.createdAt})`)
      .orderBy(sql`date_trunc('week', ${pointsTransactions.createdAt})`);

    // Total karma (all-time points)
    const [karmaRow] = await this.db
      .select({ total: sql<number>`coalesce(sum(${pointsTransactions.amount}), 0)`.as("total") })
      .from(pointsTransactions)
      .where(eq(pointsTransactions.userId, userId));

    // Most active day of week
    const dayOfWeek = await this.db
      .select({
        day: sql<number>`extract(dow from ${readings.createdAt})`.as("day"),
        count: count(),
      })
      .from(readings)
      .where(eq(readings.userId, userId))
      .groupBy(sql`extract(dow from ${readings.createdAt})`)
      .orderBy(desc(count()));

    const mostActiveDay = dayOfWeek.length > 0
      ? ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][Number(dayOfWeek[0].day)]
      : null;

    // Streak calculation: consecutive days with at least one reading
    const readingDates = await this.db
      .select({ date: sql<string>`to_char(${readings.createdAt}::date, 'YYYY-MM-DD')`.as("date") })
      .from(readings)
      .where(eq(readings.userId, userId))
      .groupBy(sql`${readings.createdAt}::date`)
      .orderBy(desc(sql`${readings.createdAt}::date`));

    let currentStreak = 0;
    let bestStreak = 0;
    let streak = 0;
    const today = now.toISOString().slice(0, 10);
    const dates = readingDates.map((r: any) => r.date);

    if (dates.length > 0) {
      // Check if today or yesterday is the start
      const firstDate = dates[0];
      const diffFromToday = Math.floor((now.getTime() - new Date(firstDate).getTime()) / (24 * 60 * 60 * 1000));
      if (diffFromToday > 1) {
        currentStreak = 0;
      } else {
        streak = 1;
        for (let i = 1; i < dates.length; i++) {
          const prev = new Date(dates[i - 1]).getTime();
          const curr = new Date(dates[i]).getTime();
          if (prev - curr === 24 * 60 * 60 * 1000) {
            streak++;
          } else {
            break;
          }
        }
        currentStreak = streak;
      }

      // Best streak
      streak = 1;
      bestStreak = 1;
      for (let i = 1; i < dates.length; i++) {
        const prev = new Date(dates[i - 1]).getTime();
        const curr = new Date(dates[i]).getTime();
        if (prev - curr === 24 * 60 * 60 * 1000) {
          streak++;
          bestStreak = Math.max(bestStreak, streak);
        } else {
          streak = 1;
        }
      }
    }

    return {
      success: true,
      data: {
        totalReadings,
        readingsByType: readingsByType.map((r: any) => ({ type: r.type, count: Number(r.count) })),
        favoriteType,
        moodDistribution: moodDistribution.map((m: any) => ({ mood: m.mood, count: Number(m.count) })),
        weeklyActivity: weeklyActivity.map((w: any) => ({ week: w.week, count: Number(w.count) })),
        moodTrend: moodTrend.map((m: any) => ({ week: m.week, mood: m.mood, count: Number(m.count) })),
        pointsOverTime: pointsOverTime.map((p: any) => ({ week: p.week, total: Number(p.total) })),
        totalKarma: Number(karmaRow?.total ?? 0),
        currentStreak,
        bestStreak,
        mostActiveDay,
      },
    };
  }
}
