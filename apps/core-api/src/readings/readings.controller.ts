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
  ConflictException,
  BadRequestException,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger";
import { AuthGuard } from "@nestjs/passport";
import { DRIZZLE } from "../db/drizzle.provider";
import { readings, readingReactions, users, journalEntries } from "../db/schema";
import { eq, and, desc, count, gte, lte } from "drizzle-orm";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { Request } from "express";
import { AppException } from "../common/app.exception";
import { ErrorCode } from "../common/error-codes";
import { HttpStatus } from "@nestjs/common";
import { CreateReadingDto, TogglePublicDto, ReactDto, FeedQueryDto, ReadingsQueryDto, CreateJournalEntryDto, UpdateJournalEntryDto } from "./dto";
import { calculateBirthChart, type BirthChartInput } from "./birth-chart.util";
import { FeaturedReadingService } from "./featured.service";

interface AuthRequest extends Request {
  user: { id: string; email: string };
}

@ApiTags("Readings")
@Controller("readings")
export class ReadingsController {
  constructor(
    @Inject(DRIZZLE) private db: PostgresJsDatabase,
    private featuredService: FeaturedReadingService,
  ) {}

  @Get("featured")
  async getFeatured() {
    const data = await this.featuredService.getFeaturedReading();
    return { success: true, data };
  }

  @Get("birth-chart")
  async birthChart(
    @Query("date") date: string,
    @Query("time") time: string,
    @Query("location") location: string,
  ) {
    if (!date || !time) {
      throw new BadRequestException("date and time are required (YYYY-MM-DD, HH:mm)");
    }
    const input: BirthChartInput = { date, time, location: location || "Unknown" };
    const chart = calculateBirthChart(input);
    return { success: true, data: chart };
  }

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
      throw new AppException(ErrorCode.READING_NOT_FOUND, "Reading not found or not public", HttpStatus.NOT_FOUND);
    }

    return { success: true, data: reading };
  }

  @Get("feed")
  async feed(@Query() query: FeedQueryDto) {
    const pageNum = query.page ?? 1;
    const limitNum = Math.min(50, query.limit ?? 20);
    const offset = (pageNum - 1) * limitNum;

    const conditions: any[] = [eq(readings.isPublic, true)];
    if (query.type) {
      conditions.push(eq(readings.type, query.type));
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

  @UseGuards(AuthGuard("jwt"))
  @Post(":id/react")
  async react(
    @Req() req: AuthRequest,
    @Param("id") id: string,
    @Body() body: ReactDto,
  ) {
    const [reading] = await this.db
      .select({ id: readings.id })
      .from(readings)
      .where(and(eq(readings.id, id), eq(readings.isPublic, true)));

    if (!reading) {
      throw new AppException(ErrorCode.READING_NOT_FOUND, "Reading not found or not public", HttpStatus.NOT_FOUND);
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
        throw new AppException(ErrorCode.ALREADY_REACTED, "Already reacted with this emoji", HttpStatus.CONFLICT);
      }
      throw err;
    }
  }

  @UseGuards(AuthGuard("jwt"))
  @Post()
  async create(@Req() req: AuthRequest, @Body() body: CreateReadingDto) {
    const [reading] = await this.db
      .insert(readings)
      .values({
        userId: req.user.id,
        type: body.type,
        input: body.input ?? null,
        result: body.result ?? null,
        locale: body.locale ?? null,
        isPublic: body.isPublic ?? false,
      })
      .returning();

    return { success: true, data: reading };
  }

  @UseGuards(AuthGuard("jwt"))
  @Patch(":id/public")
  async togglePublic(@Req() req: AuthRequest, @Param("id") id: string, @Body() body: TogglePublicDto) {
    const [reading] = await this.db
      .select()
      .from(readings)
      .where(and(eq(readings.id, id), eq(readings.userId, req.user.id)));

    if (!reading) {
      throw new AppException(ErrorCode.READING_NOT_FOUND, "Reading not found", HttpStatus.NOT_FOUND);
    }

    const [updated] = await this.db
      .update(readings)
      .set({ isPublic: body.isPublic })
      .where(and(eq(readings.id, id), eq(readings.userId, req.user.id)))
      .returning();

    return { success: true, data: updated };
  }

  @UseGuards(AuthGuard("jwt"))
  @Get()
  async findAll(@Req() req: AuthRequest, @Query() query: ReadingsQueryDto) {
    const pageNum = query.page ?? 1;
    const limitNum = query.limit ?? 20;
    const offset = (pageNum - 1) * limitNum;

    const conditions = [eq(readings.userId, req.user.id)];
    if (query.type) {
      conditions.push(eq(readings.type, query.type));
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
      throw new AppException(ErrorCode.READING_NOT_FOUND, "Reading not found", HttpStatus.NOT_FOUND);
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
      throw new AppException(ErrorCode.READING_NOT_FOUND, "Reading not found", HttpStatus.NOT_FOUND);
    }

    await this.db.delete(readings).where(and(eq(readings.id, id), eq(readings.userId, req.user.id)));

    return { success: true };
  }

  // ─── Journal Entries ────────────────────────────────────

  @UseGuards(AuthGuard("jwt"))
  @Post(":id/journal")
  async createJournalEntry(
    @Req() req: AuthRequest,
    @Param("id") readingId: string,
    @Body() body: CreateJournalEntryDto,
  ) {
    // Verify reading belongs to user
    const [reading] = await this.db
      .select({ id: readings.id })
      .from(readings)
      .where(and(eq(readings.id, readingId), eq(readings.userId, req.user.id)));

    if (!reading) {
      throw new AppException(ErrorCode.READING_NOT_FOUND, "Reading not found", HttpStatus.NOT_FOUND);
    }

    const [entry] = await this.db
      .insert(journalEntries)
      .values({
        readingId,
        userId: req.user.id,
        content: body.content,
        mood: body.mood ?? null,
      })
      .returning();

    return { success: true, data: entry };
  }

  @UseGuards(AuthGuard("jwt"))
  @Get(":id/journal")
  async getJournalEntries(
    @Req() req: AuthRequest,
    @Param("id") readingId: string,
  ) {
    const rows = await this.db
      .select()
      .from(journalEntries)
      .where(and(eq(journalEntries.readingId, readingId), eq(journalEntries.userId, req.user.id)))
      .orderBy(desc(journalEntries.createdAt));

    return { success: true, data: rows };
  }
}

@ApiTags("Journal")
@Controller("journal")
export class JournalController {
  constructor(@Inject(DRIZZLE) private db: PostgresJsDatabase) {}

  @UseGuards(AuthGuard("jwt"))
  @Get()
  async getAllJournalEntries(
    @Req() req: AuthRequest,
    @Query("mood") mood?: string,
    @Query("type") readingType?: string,
    @Query("from") from?: string,
    @Query("to") to?: string,
    @Query("page") page?: string,
    @Query("limit") limit?: string,
  ) {
    const pageNum = parseInt(page || "1", 10) || 1;
    const limitNum = Math.min(50, parseInt(limit || "20", 10) || 20);
    const offset = (pageNum - 1) * limitNum;

    const conditions: any[] = [eq(journalEntries.userId, req.user.id)];
    if (mood) conditions.push(eq(journalEntries.mood, mood as any));
    if (from) conditions.push(gte(journalEntries.createdAt, new Date(from)));
    if (to) conditions.push(lte(journalEntries.createdAt, new Date(to)));

    let query = this.db
      .select({
        id: journalEntries.id,
        readingId: journalEntries.readingId,
        content: journalEntries.content,
        mood: journalEntries.mood,
        createdAt: journalEntries.createdAt,
        updatedAt: journalEntries.updatedAt,
        readingType: readings.type,
        readingResult: readings.result,
      })
      .from(journalEntries)
      .innerJoin(readings, eq(journalEntries.readingId, readings.id))
      .where(and(...conditions))
      .$dynamic();

    if (readingType) {
      conditions.push(eq(readings.type, readingType));
      query = this.db
        .select({
          id: journalEntries.id,
          readingId: journalEntries.readingId,
          content: journalEntries.content,
          mood: journalEntries.mood,
          createdAt: journalEntries.createdAt,
          updatedAt: journalEntries.updatedAt,
          readingType: readings.type,
          readingResult: readings.result,
        })
        .from(journalEntries)
        .innerJoin(readings, eq(journalEntries.readingId, readings.id))
        .where(and(...conditions))
        .$dynamic();
    }

    const rows = await query
      .orderBy(desc(journalEntries.createdAt))
      .limit(limitNum)
      .offset(offset);

    return { success: true, data: rows, page: pageNum, limit: limitNum };
  }

  @UseGuards(AuthGuard("jwt"))
  @Patch(":entryId")
  async updateJournalEntry(
    @Req() req: AuthRequest,
    @Param("entryId") entryId: string,
    @Body() body: UpdateJournalEntryDto,
  ) {
    const [existing] = await this.db
      .select()
      .from(journalEntries)
      .where(and(eq(journalEntries.id, entryId), eq(journalEntries.userId, req.user.id)));

    if (!existing) {
      throw new AppException(ErrorCode.READING_NOT_FOUND, "Journal entry not found", HttpStatus.NOT_FOUND);
    }

    const updates: Record<string, any> = { updatedAt: new Date() };
    if (body.content !== undefined) updates.content = body.content;
    if (body.mood !== undefined) updates.mood = body.mood;

    const [updated] = await this.db
      .update(journalEntries)
      .set(updates)
      .where(and(eq(journalEntries.id, entryId), eq(journalEntries.userId, req.user.id)))
      .returning();

    return { success: true, data: updated };
  }

  @UseGuards(AuthGuard("jwt"))
  @Delete(":entryId")
  async deleteJournalEntry(
    @Req() req: AuthRequest,
    @Param("entryId") entryId: string,
  ) {
    const [existing] = await this.db
      .select({ id: journalEntries.id })
      .from(journalEntries)
      .where(and(eq(journalEntries.id, entryId), eq(journalEntries.userId, req.user.id)));

    if (!existing) {
      throw new AppException(ErrorCode.READING_NOT_FOUND, "Journal entry not found", HttpStatus.NOT_FOUND);
    }

    await this.db
      .delete(journalEntries)
      .where(and(eq(journalEntries.id, entryId), eq(journalEntries.userId, req.user.id)));

    return { success: true };
  }
}
