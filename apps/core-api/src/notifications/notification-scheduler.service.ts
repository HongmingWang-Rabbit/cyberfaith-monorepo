import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression, SchedulerRegistry } from "@nestjs/schedule";
import { NotificationsService } from "./notifications.service";
import { DigestService } from "../email/digest.service";
import { EmailService } from "../email/email.service";

export interface JobStatus {
  type: string;
  description: string;
  cron: string;
  lastRun: Date | null;
  lastResult: { sent: number; failed: number } | null;
}

/** Max push notifications per batch tick (rate limit: 100/min) */
const BATCH_SIZE = 100;
const BATCH_INTERVAL_MS = 60_000;

@Injectable()
export class NotificationSchedulerService {
  private readonly logger = new Logger(NotificationSchedulerService.name);

  private jobStatuses: Record<string, JobStatus> = {
    dailyHoroscope: {
      type: "dailyHoroscope",
      description: "Daily horoscope push — 8am UTC",
      cron: "0 8 * * *",
      lastRun: null,
      lastResult: null,
    },
    streakAtRisk: {
      type: "streakAtRisk",
      description: "Streak at risk push — 8pm UTC",
      cron: "0 20 * * *",
      lastRun: null,
      lastResult: null,
    },
    weeklyDigestPush: {
      type: "weeklyDigestPush",
      description: "Weekly digest push — Monday 9am UTC",
      cron: "0 9 * * 1",
      lastRun: null,
      lastResult: null,
    },
    weeklyDigestEmail: {
      type: "weeklyDigestEmail",
      description: "Weekly digest email — Monday 9:30am UTC",
      cron: "30 9 * * 1",
      lastRun: null,
      lastResult: null,
    },
  };

  constructor(
    private notificationsService: NotificationsService,
    private digestService: DigestService,
    private emailService: EmailService,
  ) {}

  getJobStatuses(): JobStatus[] {
    return Object.values(this.jobStatuses);
  }

  /** Daily horoscope push at 8am UTC */
  @Cron("0 8 * * *", { name: "dailyHoroscope" })
  async handleDailyHoroscope(): Promise<{ sent: number; failed: number }> {
    this.logger.log("Running daily horoscope push notification job");
    const users = await this.digestService.getUsersForPush();

    let sent = 0;
    let failed = 0;

    for (let i = 0; i < users.length; i += BATCH_SIZE) {
      const batch = users.slice(i, i + BATCH_SIZE);

      await Promise.all(
        batch.map(async (user) => {
          try {
            const ok = await this.notificationsService.sendToUser(
              user.id,
              "Your daily horoscope is ready! 🌟",
              user.zodiacSign
                ? `Check your ${user.zodiacSign} forecast for today`
                : "Discover what the stars have in store for you today",
              "/horoscope",
            );
            if (ok) sent++;
            else failed++;
          } catch {
            failed++;
          }
        }),
      );

      // Rate limit: wait between batches
      if (i + BATCH_SIZE < users.length) {
        await this.sleep(BATCH_INTERVAL_MS);
      }
    }

    const result = { sent, failed };
    this.jobStatuses.dailyHoroscope.lastRun = new Date();
    this.jobStatuses.dailyHoroscope.lastResult = result;
    this.logger.log(`Daily horoscope push: sent=${sent}, failed=${failed}`);
    return result;
  }

  /** Streak at risk push at 8pm UTC */
  @Cron("0 20 * * *", { name: "streakAtRisk" })
  async handleStreakAtRisk(): Promise<{ sent: number; failed: number }> {
    this.logger.log("Running streak-at-risk push notification job");
    const atRiskUsers = await this.digestService.getUsersWithStreakAtRisk();

    // Filter to users who want streak reminders
    const reminderUsers = await this.digestService.getUsersForStreakReminder();
    const reminderIds = new Set(reminderUsers.map((u) => u.id));
    const eligible = atRiskUsers.filter((u) => reminderIds.has(u.id));

    let sent = 0;
    let failed = 0;

    for (let i = 0; i < eligible.length; i += BATCH_SIZE) {
      const batch = eligible.slice(i, i + BATCH_SIZE);

      await Promise.all(
        batch.map(async (user) => {
          try {
            const ok = await this.notificationsService.sendToUser(
              user.id,
              `Don't break your ${user.streak}-day streak! 🔥`,
              "Do a quick reading today to keep your streak alive",
              "/readings",
            );
            if (ok) sent++;
            else failed++;
          } catch {
            failed++;
          }
        }),
      );

      if (i + BATCH_SIZE < eligible.length) {
        await this.sleep(BATCH_INTERVAL_MS);
      }
    }

    const result = { sent, failed };
    this.jobStatuses.streakAtRisk.lastRun = new Date();
    this.jobStatuses.streakAtRisk.lastResult = result;
    this.logger.log(`Streak at risk push: sent=${sent}, failed=${failed}`);
    return result;
  }

  /** Weekly digest push on Monday 9am UTC */
  @Cron("0 9 * * 1", { name: "weeklyDigestPush" })
  async handleWeeklyDigestPush(): Promise<{ sent: number; failed: number }> {
    this.logger.log("Running weekly digest push notification job");
    const users = await this.digestService.getUsersForPush();

    let sent = 0;
    let failed = 0;

    for (let i = 0; i < users.length; i += BATCH_SIZE) {
      const batch = users.slice(i, i + BATCH_SIZE);

      await Promise.all(
        batch.map(async (user) => {
          try {
            const ok = await this.notificationsService.sendToUser(
              user.id,
              "Your weekly spiritual recap is ready 📊",
              "See your readings, streak, karma, and friend activity this week",
              "/digest",
            );
            if (ok) sent++;
            else failed++;
          } catch {
            failed++;
          }
        }),
      );

      if (i + BATCH_SIZE < users.length) {
        await this.sleep(BATCH_INTERVAL_MS);
      }
    }

    const result = { sent, failed };
    this.jobStatuses.weeklyDigestPush.lastRun = new Date();
    this.jobStatuses.weeklyDigestPush.lastResult = result;
    this.logger.log(`Weekly digest push: sent=${sent}, failed=${failed}`);
    return result;
  }

  /** Weekly digest email on Monday 9:30am UTC (after push at 9am) */
  @Cron("30 9 * * 1", { name: "weeklyDigestEmail" })
  async handleWeeklyDigestEmail(): Promise<{ sent: number; failed: number }> {
    this.logger.log("Running weekly digest email job");
    const usersToEmail = await this.digestService.getUsersForDigest();

    let sent = 0;
    let failed = 0;

    for (const user of usersToEmail) {
      try {
        const data = await this.digestService.generateDigest(user.id);
        if (data) {
          await this.emailService.sendWeeklyDigest(user.email, data);
          sent++;
        }
      } catch (err) {
        this.logger.warn(`Failed to send digest email to ${user.email}: ${err}`);
        failed++;
      }
    }

    const result = { sent, failed };
    this.jobStatuses.weeklyDigestEmail.lastRun = new Date();
    this.jobStatuses.weeklyDigestEmail.lastResult = result;
    this.logger.log(`Weekly digest email: sent=${sent}, failed=${failed}`);
    return result;
  }

  /** Manually trigger a job by type */
  async triggerJob(type: string): Promise<{ sent: number; failed: number }> {
    switch (type) {
      case "dailyHoroscope":
        return this.handleDailyHoroscope();
      case "streakAtRisk":
        return this.handleStreakAtRisk();
      case "weeklyDigestPush":
        return this.handleWeeklyDigestPush();
      case "weeklyDigestEmail":
        return this.handleWeeklyDigestEmail();
      default:
        throw new Error(`Unknown job type: ${type}`);
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
