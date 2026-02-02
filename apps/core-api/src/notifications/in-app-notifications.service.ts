import { Injectable, Inject, Logger } from "@nestjs/common";
import { DRIZZLE } from "../db/drizzle.provider";
import { inAppNotifications } from "../db/schema";
import { eq, and, desc, count, sql } from "drizzle-orm";

export type NotificationType = "follow" | "comment" | "reaction" | "achievement" | "gift" | "system";

@Injectable()
export class InAppNotificationsService {
  private readonly logger = new Logger(InAppNotificationsService.name);

  constructor(@Inject(DRIZZLE) private db: any) {}

  async create(userId: string, type: NotificationType, title: string, message?: string, linkUrl?: string) {
    try {
      const [notif] = await this.db
        .insert(inAppNotifications)
        .values({ userId, type, title, message, linkUrl })
        .returning();
      return notif;
    } catch (err) {
      this.logger.error(`Failed to create notification for user ${userId}`, err);
      return null;
    }
  }

  async list(userId: string, page = 1, limit = 20) {
    const offset = (page - 1) * limit;

    const rows = await this.db
      .select()
      .from(inAppNotifications)
      .where(eq(inAppNotifications.userId, userId))
      .orderBy(inAppNotifications.read, desc(inAppNotifications.createdAt))
      .limit(limit)
      .offset(offset);

    const [total] = await this.db
      .select({ count: count() })
      .from(inAppNotifications)
      .where(eq(inAppNotifications.userId, userId));

    return { data: rows, total: Number(total?.count ?? 0), page, limit };
  }

  async markRead(userId: string, notifId: string) {
    const result = await this.db
      .update(inAppNotifications)
      .set({ read: true })
      .where(and(eq(inAppNotifications.id, notifId), eq(inAppNotifications.userId, userId)))
      .returning({ id: inAppNotifications.id });
    return result.length > 0;
  }

  async markAllRead(userId: string) {
    await this.db
      .update(inAppNotifications)
      .set({ read: true })
      .where(and(eq(inAppNotifications.userId, userId), eq(inAppNotifications.read, false)));
  }

  async unreadCount(userId: string): Promise<number> {
    const [result] = await this.db
      .select({ count: count() })
      .from(inAppNotifications)
      .where(and(eq(inAppNotifications.userId, userId), eq(inAppNotifications.read, false)));
    return Number(result?.count ?? 0);
  }
}
