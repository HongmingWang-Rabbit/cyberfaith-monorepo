import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
  Inject,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { DRIZZLE } from "../db/drizzle.provider";
import { readings, readingReactions, users } from "../db/schema";
import { eq, and, desc, sql, count } from "drizzle-orm";
// Note: .update() is on the db instance, not imported from drizzle-orm
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { Request } from "express";

interface AuthRequest extends Request {
  user: { id: string; email: string };
}

const VALID_EMOJIS = ["👍", "❤️", "🔮", "✨", "🌟"];

@Controller("readings")
export class ReadingsController {
  constructor(@Inject(DRIZZLE) private db: PostgresJsDatabase) {}

  /** Public endpoint — no auth required. Only returns public readings without user info. */
  @Get("public/:id")
  async findPublic(@Param("id") id: string) {
    const [reading] = await this.db
      .select({
        id: readings.id,
        type: readings.type,
        result: readings.result,
        locale: readings.locale,
        createdAt: readings.createdAt,
        isPublic: readings.isPublic,
      })
      .from(readings)
      .where(and(eq(readings.id, id), eq(readings.isPublic, true)));

    if (!reading) {
      throw new NotFoundException("Reading not found or not public");
    }

    return { success: true, data: reading };
  }

  /** Public feed — no auth required. Paginated public readings with author info. */
  @Get("feed")
  async feed(
    @Query("page") page?: string,
    @Query("limit") limit?: string,
    @Query("type") type?: string,
  ) {
    const pageNum = Math.max(1, parseInt(page || "1", 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit || "20", 10) || 20));
    const offset = (pageNum - 1) * limitNum;

    const conditions: any[] = [eq(readings.isPublic, true)];
    if (type) {
      conditions.push(eq(readings.type, type));
    }

    const rows = await this.db
      .select({
        id: readings.id,
        type: readings.type,
        result: readings.result,
        locale: readings.locale,
        createdAt: readings.createdAt,
        authorName: users.name,
        authorAvatar: users.avatarUrl,
      })
      .from(readings)
      .innerJoin(users, eq(readings.userId, users.id))
      .where(and(...conditions))
      .orderBy(desc(readings.createdAt))
      .limit(limitNum)
      .offset(offset);

    return { success: true, data: rows, page: pageNum, limit: limitNum };
  }

  /** Get reaction counts for a reading */
  @Get(":id/reactions")
  async getReactions(@Param("id") id: string) {
    const rows = await this.db
      .select({
        emoji: readingReactions.emoji,
        count: count(),
      })
      .from(readingReactions)
      .where(eq(readingReactions.readingId, id))
      .groupBy(readingReactions.emoji);

    const reactions: Record<string, number> = {};
    for (const row of rows) {
      reactions[row.emoji] = Number(row.count);
    }

    return { success: true, data: reactions };
  }

  /** Add a reaction — authenticated */
  @UseGuards(AuthGuard("jwt"))
  @Post(":id/react")
  async react(
    @Req() req: AuthRequest,
    @Param("id") id: string,
    @Body() body: { emoji: string },
  ) {
    if (!body.emoji || !VALID_EMOJIS.includes(body.emoji)) {
      throw new BadRequestException(`Invalid emoji. Must be one of: ${VALID_EMOJIS.join(" ")}`);
    }

    // Verify reading exists and is public
    const [reading] = await this.db
      .select({ id: readings.id })
      .from(readings)
      .where(and(eq(readings.id, id), eq(readings.isPublic, true)));

    if (!reading) {
      throw new NotFoundException("Reading not found or not public");
    }

    try {
      const [reaction] = await this.db
        .insert(readingReactions)
        .values({
          readingId: id,
          userId: req.user.id,
          emoji: body.emoji,
        })
        .returning();

      return { success: true, data: reaction };
    } catch (err: any) {
      if (err?.code === "23505") {
        throw new ConflictException("Already reacted with this emoji");
      }
      throw err;
    }
  }

  @UseGuards(AuthGuard("jwt"))
  @Post()
  async create(@Req() req: AuthRequest, @Body() body: any) {
    const { type, input, result, locale, isPublic } = body;

    const validTypes = ["mbti", "tarot", "i-ching", "four-pillars", "zodiac"];
    if (!type || !validTypes.includes(type)) {
      throw new ForbiddenException(`Invalid type. Must be one of: ${validTypes.join(", ")}`);
    }

    const [reading] = await this.db
      .insert(readings)
      .values({
        userId: req.user.id,
        type,
        input: input ?? null,
        result: result ?? null,
        locale: locale ?? null,
        isPublic: isPublic ?? false,
      })
      .returning();

    return { success: true, data: reading };
  }

  @UseGuards(AuthGuard("jwt"))
  @Patch(":id/public")
  async togglePublic(@Req() req: AuthRequest, @Param("id") id: string, @Body() body: { isPublic: boolean }) {
    const [reading] = await this.db
      .select()
      .from(readings)
      .where(and(eq(readings.id, id), eq(readings.userId, req.user.id)));

    if (!reading) {
      throw new NotFoundException("Reading not found");
    }

    const [updated] = await this.db
      .update(readings)
      .set({ isPublic: body.isPublic ?? false })
      .where(and(eq(readings.id, id), eq(readings.userId, req.user.id)))
      .returning();

    return { success: true, data: updated };
  }

  @UseGuards(AuthGuard("jwt"))
  @Get()
  async findAll(@Req() req: AuthRequest, @Query("type") type?: string, @Query("page") page?: string, @Query("limit") limit?: string) {
    const pageNum = Math.max(1, parseInt(page || "1", 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit || "20", 10) || 20));
    const offset = (pageNum - 1) * limitNum;

    const conditions = [eq(readings.userId, req.user.id)];
    if (type) {
      conditions.push(eq(readings.type, type));
    }

    const rows = await this.db
      .select()
      .from(readings)
      .where(and(...conditions))
      .orderBy(desc(readings.createdAt))
      .limit(limitNum)
      .offset(offset);

    return { success: true, data: rows, page: pageNum, limit: limitNum };
  }

  @UseGuards(AuthGuard("jwt"))
  @Get(":id")
  async findOne(@Req() req: AuthRequest, @Param("id") id: string) {
    const [reading] = await this.db
      .select()
      .from(readings)
      .where(and(eq(readings.id, id), eq(readings.userId, req.user.id)));

    if (!reading) {
      throw new NotFoundException("Reading not found");
    }

    return { success: true, data: reading };
  }

  @UseGuards(AuthGuard("jwt"))
  @Delete(":id")
  async remove(@Req() req: AuthRequest, @Param("id") id: string) {
    const [reading] = await this.db
      .select()
      .from(readings)
      .where(and(eq(readings.id, id), eq(readings.userId, req.user.id)));

    if (!reading) {
      throw new NotFoundException("Reading not found");
    }

    await this.db.delete(readings).where(and(eq(readings.id, id), eq(readings.userId, req.user.id)));

    return { success: true };
  }
}
