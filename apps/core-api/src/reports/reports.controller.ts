import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger";
import {
  Controller, Get, Post, Patch, Param, Query, Body, Req, UseGuards, Inject, HttpStatus,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { AdminGuard } from "../admin/admin.guard";
import { DRIZZLE } from "../db/drizzle.provider";
import { reports, users, comments } from "../db/schema";
import { eq, and, desc, count } from "drizzle-orm";
import { AppException } from "../common/app.exception";
import { ErrorCode } from "../common/error-codes";
import { CreateReportDto, UpdateReportStatusDto } from "./dto";
import { Request } from "express";

interface AuthRequest extends Request {
  user: { id: string; email: string };
}

@ApiTags("Reports")
@Controller("reports")
export class ReportsController {
  constructor(@Inject(DRIZZLE) private readonly db: any) {}

  @UseGuards(AuthGuard("jwt"))
  @Post()
  async create(@Req() req: AuthRequest, @Body() body: CreateReportDto) {
    const [report] = await this.db
      .insert(reports)
      .values({
        reporterId: req.user.id,
        targetType: body.targetType,
        targetId: body.targetId,
        reason: body.reason,
        details: body.details ?? null,
      })
      .returning();

    // Auto-hide comments with 3+ reports
    if (body.targetType === "comment") {
      const [reportCount] = await this.db
        .select({ count: count() })
        .from(reports)
        .where(and(eq(reports.targetType, "comment"), eq(reports.targetId, body.targetId)));
      if (Number(reportCount?.count ?? 0) >= 3) {
        await this.db
          .update(comments)
          .set({ deletedAt: new Date() })
          .where(eq(comments.id, body.targetId));
      }
    }

    return { success: true, data: report };
  }
}

@ApiTags("Admin Reports")
@Controller("admin/reports")
@UseGuards(AuthGuard("jwt"), AdminGuard)
export class AdminReportsController {
  constructor(@Inject(DRIZZLE) private readonly db: any) {}

  @Get()
  async list(
    @Query("status") status?: string,
    @Query("page") page?: string,
    @Query("limit") limit?: string,
  ) {
    const pageNum = parseInt(page || "1", 10) || 1;
    const limitNum = Math.min(100, parseInt(limit || "20", 10) || 20);
    const offset = (pageNum - 1) * limitNum;

    const conditions: any[] = [];
    if (status && ["pending", "reviewed", "dismissed"].includes(status)) {
      conditions.push(eq(reports.status, status as any));
    }

    const query = conditions.length > 0
      ? this.db.select({
          id: reports.id,
          reporterId: reports.reporterId,
          targetType: reports.targetType,
          targetId: reports.targetId,
          reason: reports.reason,
          details: reports.details,
          status: reports.status,
          createdAt: reports.createdAt,
          reporterName: users.name,
          reporterEmail: users.email,
        })
        .from(reports)
        .innerJoin(users, eq(reports.reporterId, users.id))
        .where(conditions[0])
        .orderBy(desc(reports.createdAt))
        .limit(limitNum)
        .offset(offset)
      : this.db.select({
          id: reports.id,
          reporterId: reports.reporterId,
          targetType: reports.targetType,
          targetId: reports.targetId,
          reason: reports.reason,
          details: reports.details,
          status: reports.status,
          createdAt: reports.createdAt,
          reporterName: users.name,
          reporterEmail: users.email,
        })
        .from(reports)
        .innerJoin(users, eq(reports.reporterId, users.id))
        .orderBy(desc(reports.createdAt))
        .limit(limitNum)
        .offset(offset);

    const rows = await query;

    const [total] = conditions.length > 0
      ? await this.db.select({ count: count() }).from(reports).where(conditions[0])
      : await this.db.select({ count: count() }).from(reports);

    return { success: true, data: rows, total: Number(total?.count ?? 0), page: pageNum, limit: limitNum };
  }

  @Patch(":id")
  async updateStatus(@Param("id") id: string, @Body() body: UpdateReportStatusDto) {
    const [updated] = await this.db
      .update(reports)
      .set({ status: body.status })
      .where(eq(reports.id, id))
      .returning();

    if (!updated) {
      throw new AppException(ErrorCode.REPORT_NOT_FOUND, "Report not found", HttpStatus.NOT_FOUND);
    }

    return { success: true, data: updated };
  }
}
