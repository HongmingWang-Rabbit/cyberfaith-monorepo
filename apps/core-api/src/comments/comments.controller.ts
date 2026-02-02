import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger";
import {
  Controller, Get, Post, Delete, Param, Query, Body, Req, UseGuards, Inject, HttpStatus,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { DRIZZLE } from "../db/drizzle.provider";
import { comments, readings, users } from "../db/schema";
import { eq, and, desc, isNull, count } from "drizzle-orm";
import { AppException } from "../common/app.exception";
import { ErrorCode } from "../common/error-codes";
import { InAppNotificationsService } from "../notifications/in-app-notifications.service";
import { sanitizeText } from "../common/sanitize";
import { CreateCommentDto } from "./dto";
import { Request } from "express";

interface AuthRequest extends Request {
  user: { id: string; email: string; role?: string };
}

@ApiTags("Comments")
@Controller("readings")
export class CommentsOnReadingsController {
  constructor(
    @Inject(DRIZZLE) private readonly db: any,
    private readonly inAppNotifications: InAppNotificationsService,
  ) {}

  @UseGuards(AuthGuard("jwt"))
  @Post(":id/comments")
  async createComment(
    @Req() req: AuthRequest,
    @Param("id") readingId: string,
    @Body() body: CreateCommentDto,
  ) {
    // Verify reading exists and is public
    const [reading] = await this.db
      .select({ id: readings.id })
      .from(readings)
      .where(and(eq(readings.id, readingId), eq(readings.isPublic, true)));

    if (!reading) {
      throw new AppException(ErrorCode.READING_NOT_FOUND, "Reading not found or not public", HttpStatus.NOT_FOUND);
    }

    // If replying, verify parent exists
    if (body.parentId) {
      const [parent] = await this.db
        .select({ id: comments.id })
        .from(comments)
        .where(and(eq(comments.id, body.parentId), eq(comments.readingId, readingId), isNull(comments.deletedAt)));

      if (!parent) {
        throw new AppException(ErrorCode.COMMENT_NOT_FOUND, "Parent comment not found", HttpStatus.NOT_FOUND);
      }
    }

    const [comment] = await this.db
      .insert(comments)
      .values({
        readingId,
        userId: req.user.id,
        content: sanitizeText(body.content).slice(0, 500),
        parentId: body.parentId ?? null,
      })
      .returning();

    // Notify reading owner about the comment
    const [readingFull] = await this.db
      .select({ userId: readings.userId })
      .from(readings)
      .where(eq(readings.id, readingId));
    if (readingFull && readingFull.userId !== req.user.id) {
      const [commenter] = await this.db.select({ name: users.name }).from(users).where(eq(users.id, req.user.id));
      this.inAppNotifications.create(
        readingFull.userId,
        "comment",
        `${commenter?.name || "Someone"} commented on your reading`,
        sanitizeText(body.content).slice(0, 100),
        `/community/readings/${readingId}`,
      ).catch(() => {});
    }

    return { success: true, data: comment };
  }

  @Get(":id/comments")
  async getComments(
    @Param("id") readingId: string,
    @Query("page") page?: string,
    @Query("limit") limit?: string,
  ) {
    const pageNum = parseInt(page || "1", 10) || 1;
    const limitNum = Math.min(100, parseInt(limit || "50", 10) || 50);
    const offset = (pageNum - 1) * limitNum;

    // Get all non-deleted comments for this reading
    const rows = await this.db
      .select({
        id: comments.id,
        readingId: comments.readingId,
        userId: comments.userId,
        content: comments.content,
        parentId: comments.parentId,
        createdAt: comments.createdAt,
        deletedAt: comments.deletedAt,
        authorName: users.name,
        authorUsername: users.username,
        authorAvatar: users.avatarUrl,
      })
      .from(comments)
      .innerJoin(users, eq(comments.userId, users.id))
      .where(eq(comments.readingId, readingId))
      .orderBy(desc(comments.createdAt))
      .limit(limitNum)
      .offset(offset);

    // Build threaded structure
    const allComments = rows.map((r: any) => ({
      ...r,
      content: r.deletedAt ? "[deleted]" : r.content,
      replies: [] as any[],
    }));

    const commentMap = new Map<string, any>();
    const topLevel: any[] = [];

    for (const c of allComments) {
      commentMap.set(c.id, c);
    }
    for (const c of allComments) {
      if (c.parentId && commentMap.has(c.parentId)) {
        commentMap.get(c.parentId).replies.push(c);
      } else {
        topLevel.push(c);
      }
    }

    const [total] = await this.db
      .select({ count: count() })
      .from(comments)
      .where(and(eq(comments.readingId, readingId), isNull(comments.deletedAt)));

    return { success: true, data: topLevel, total: Number(total?.count ?? 0), page: pageNum, limit: limitNum };
  }
}

@ApiTags("Comments")
@Controller("comments")
export class CommentsController {
  constructor(@Inject(DRIZZLE) private readonly db: any) {}

  @UseGuards(AuthGuard("jwt"))
  @Delete(":id")
  async deleteComment(@Req() req: AuthRequest, @Param("id") id: string) {
    const [comment] = await this.db
      .select({ id: comments.id, userId: comments.userId })
      .from(comments)
      .where(and(eq(comments.id, id), isNull(comments.deletedAt)));

    if (!comment) {
      throw new AppException(ErrorCode.COMMENT_NOT_FOUND, "Comment not found", HttpStatus.NOT_FOUND);
    }

    // Check ownership or admin
    const [user] = await this.db.select({ role: users.role }).from(users).where(eq(users.id, req.user.id));
    if (comment.userId !== req.user.id && user?.role !== "admin") {
      throw new AppException(ErrorCode.FORBIDDEN, "Cannot delete this comment", HttpStatus.FORBIDDEN);
    }

    await this.db
      .update(comments)
      .set({ deletedAt: new Date() })
      .where(eq(comments.id, id));

    return { success: true };
  }
}
