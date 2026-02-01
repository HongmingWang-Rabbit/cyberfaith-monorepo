import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
  Inject,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { DRIZZLE } from "../db/drizzle.provider";
import { readings } from "../db/schema";
import { eq, and, desc } from "drizzle-orm";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { Request } from "express";

interface AuthRequest extends Request {
  user: { id: string; email: string };
}

@Controller("readings")
@UseGuards(AuthGuard("jwt"))
export class ReadingsController {
  constructor(@Inject(DRIZZLE) private db: PostgresJsDatabase) {}

  @Post()
  async create(@Req() req: AuthRequest, @Body() body: any) {
    const { type, input, result, locale } = body;

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
      })
      .returning();

    return { success: true, data: reading };
  }

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
