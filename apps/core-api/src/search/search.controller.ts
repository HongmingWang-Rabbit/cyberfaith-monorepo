import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import {
  Controller, Get, Query, Inject, HttpStatus,
} from "@nestjs/common";
import { DRIZZLE } from "../db/drizzle.provider";
import { users, userSettings, readings } from "../db/schema";
import { sql, eq, and, or, desc, count } from "drizzle-orm";
import { AppException } from "../common/app.exception";
import { ErrorCode } from "../common/error-codes";

@ApiTags("Search")
@Controller("search")
export class SearchController {
  constructor(@Inject(DRIZZLE) private readonly db: any) {}

  @Get()
  async search(
    @Query("q") q?: string,
    @Query("type") type?: string,
    @Query("page") page?: string,
    @Query("limit") limit?: string,
  ) {
    if (!q || q.trim().length === 0) {
      throw new AppException(ErrorCode.SEARCH_QUERY_REQUIRED, "Search query is required", HttpStatus.BAD_REQUEST);
    }

    const query = q.trim().slice(0, 100);
    const searchType = type || "all";
    const pageNum = parseInt(page || "1", 10) || 1;
    const limitNum = Math.min(50, parseInt(limit || "20", 10) || 20);
    const offset = (pageNum - 1) * limitNum;
    const pattern = `%${query}%`;

    const results: any[] = [];

    // Search readings (public only)
    if (searchType === "all" || searchType === "readings") {
      const readingRows = await this.db
        .select({
          id: readings.id,
          type: readings.type,
          result: readings.result,
          createdAt: readings.createdAt,
          userId: readings.userId,
          authorName: users.name,
          authorUsername: users.username,
          authorAvatar: users.avatarUrl,
        })
        .from(readings)
        .innerJoin(users, eq(readings.userId, users.id))
        .where(and(
          eq(readings.isPublic, true),
          or(
            sql`${readings.type} ILIKE ${pattern}`,
            sql`CAST(${readings.result} AS TEXT) ILIKE ${pattern}`,
          ),
        ))
        .orderBy(desc(readings.createdAt))
        .limit(searchType === "all" ? Math.ceil(limitNum / 2) : limitNum)
        .offset(searchType === "readings" ? offset : 0);

      for (const r of readingRows) {
        results.push({
          resultType: "reading",
          id: r.id,
          readingType: r.type,
          result: r.result,
          createdAt: r.createdAt,
          author: {
            id: r.userId,
            name: r.authorName,
            username: r.authorUsername,
            avatarUrl: r.authorAvatar,
          },
        });
      }
    }

    // Search users
    if (searchType === "all" || searchType === "users") {
      const userRows = await this.db
        .select({
          id: users.id,
          name: users.name,
          username: users.username,
          avatarUrl: users.avatarUrl,
          displayName: userSettings.displayName,
        })
        .from(users)
        .leftJoin(userSettings, eq(users.id, userSettings.userId))
        .where(and(
          sql`${users.deletedAt} IS NULL`,
          or(
            sql`${users.name} ILIKE ${pattern}`,
            sql`${users.username} ILIKE ${pattern}`,
            sql`${userSettings.displayName} ILIKE ${pattern}`,
          ),
        ))
        .orderBy(users.name)
        .limit(searchType === "all" ? Math.ceil(limitNum / 2) : limitNum)
        .offset(searchType === "users" ? offset : 0);

      for (const u of userRows) {
        results.push({
          resultType: "user",
          id: u.id,
          name: u.displayName || u.name,
          username: u.username,
          avatarUrl: u.avatarUrl,
        });
      }
    }

    return {
      success: true,
      data: results,
      query,
      type: searchType,
      page: pageNum,
      limit: limitNum,
    };
  }
}
