import { Injectable, Inject, Logger } from "@nestjs/common";
import { DRIZZLE } from "../db/drizzle.provider";
import { pushSubscriptions } from "../db/schema";
import { eq, and } from "drizzle-orm";

// Lazy-load web-push to avoid hard dependency if not installed
let webpush: any = null;
try {
  webpush = require("web-push");
} catch {
  // web-push not available
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(@Inject(DRIZZLE) private db: any) {
    if (webpush && process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
      webpush.setVapidDetails(
        process.env.VAPID_SUBJECT || "mailto:admin@cyberfaith.app",
        process.env.VAPID_PUBLIC_KEY,
        process.env.VAPID_PRIVATE_KEY,
      );
    }
  }

  async subscribe(userId: string, endpoint: string, p256dh: string, auth: string) {
    try {
      const [sub] = await this.db
        .insert(pushSubscriptions)
        .values({ userId, endpoint, p256dh, auth })
        .returning();
      return sub;
    } catch (err: any) {
      if (err?.code === "23505") {
        // Already subscribed, update
        const [updated] = await this.db
          .update(pushSubscriptions)
          .set({ userId, p256dh, auth })
          .where(eq(pushSubscriptions.endpoint, endpoint))
          .returning();
        return updated;
      }
      throw err;
    }
  }

  async unsubscribe(userId: string, endpoint: string) {
    await this.db
      .delete(pushSubscriptions)
      .where(and(eq(pushSubscriptions.userId, userId), eq(pushSubscriptions.endpoint, endpoint)));
  }

  async sendToAll(title: string, body: string, url?: string) {
    if (!webpush) {
      this.logger.warn("web-push not available");
      return { sent: 0, failed: 0 };
    }

    const subs = await this.db.select().from(pushSubscriptions);
    let sent = 0;
    let failed = 0;

    const payload = JSON.stringify({ title, body, url: url || "/" });

    for (const sub of subs) {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload,
        );
        sent++;
      } catch (err: any) {
        failed++;
        // Remove invalid subscriptions
        if (err?.statusCode === 404 || err?.statusCode === 410) {
          await this.db.delete(pushSubscriptions).where(eq(pushSubscriptions.id, sub.id));
        }
      }
    }

    return { sent, failed };
  }

  async sendToUser(userId: string, title: string, body: string, url?: string): Promise<boolean> {
    if (!webpush) {
      this.logger.warn("web-push not available");
      return false;
    }

    const subs = await this.db
      .select()
      .from(pushSubscriptions)
      .where(eq(pushSubscriptions.userId, userId));

    if (subs.length === 0) return false;

    const payload = JSON.stringify({ title, body, url: url || "/" });
    let anySent = false;

    for (const sub of subs) {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload,
        );
        anySent = true;
      } catch (err: any) {
        if (err?.statusCode === 404 || err?.statusCode === 410) {
          await this.db.delete(pushSubscriptions).where(eq(pushSubscriptions.id, sub.id));
        }
      }
    }

    return anySent;
  }
}
