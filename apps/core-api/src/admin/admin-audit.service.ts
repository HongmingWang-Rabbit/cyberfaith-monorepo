import { Inject, Injectable } from "@nestjs/common";
import { DRIZZLE } from "../db/drizzle.provider";
import { adminAuditLog, users } from "../db/schema";
import { desc, eq, sql } from "drizzle-orm";

@Injectable()
export class AdminAuditService {
  constructor(@Inject(DRIZZLE) private db: any) {}

  async log(adminUserId: string, action: string, targetType?: string, targetId?: string, details?: any) {
    await this.db.insert(adminAuditLog).values({
      adminUserId,
      action,
      targetType: targetType ?? null,
      targetId: targetId ?? null,
      details: details ?? null,
    });
  }

  async getAuditLog(page = 1, limit = 50) {
    const offset = (page - 1) * limit;
    const [rows, [total]] = await Promise.all([
      this.db
        .select({
          id: adminAuditLog.id,
          adminUserId: adminAuditLog.adminUserId,
          action: adminAuditLog.action,
          targetType: adminAuditLog.targetType,
          targetId: adminAuditLog.targetId,
          details: adminAuditLog.details,
          createdAt: adminAuditLog.createdAt,
          adminName: users.name,
          adminEmail: users.email,
        })
        .from(adminAuditLog)
        .leftJoin(users, eq(adminAuditLog.adminUserId, users.id))
        .orderBy(desc(adminAuditLog.createdAt))
        .limit(limit)
        .offset(offset),
      this.db
        .select({ count: sql<number>`count(*)::int` })
        .from(adminAuditLog),
    ]);
    return { data: rows, total: total.count, page, limit };
  }
}
