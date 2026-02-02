import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger";
import { Controller, Get, Query, Req, UseGuards, UseInterceptors } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Request } from "express";
import { LeaderboardService } from "./leaderboard.service";
import { HttpCacheInterceptor, CacheTTL } from "../cache/cache.interceptor";

interface AuthRequest extends Request {
  user: { id: string; email: string };
}

@ApiTags("Leaderboard")
@Controller("leaderboard")
@UseInterceptors(HttpCacheInterceptor)
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  @Get()
  @CacheTTL(120) // 2 minutes
  async getLeaderboard(
    @Query("period") period?: string,
    @Query("limit") limit?: string,
  ) {
    const validPeriod = ["weekly", "monthly", "all"].includes(period || "")
      ? (period as "weekly" | "monthly" | "all")
      : "all";
    const n = Math.min(50, Math.max(1, parseInt(limit || "50", 10) || 50));
    const data = await this.leaderboardService.getLeaderboard(validPeriod, n);
    return { success: true, data };
  }

  @Get("me")
  @UseGuards(AuthGuard("jwt"))
  async getMyRank(
    @Req() req: AuthRequest,
    @Query("period") period?: string,
  ) {
    const validPeriod = ["weekly", "monthly", "all"].includes(period || "")
      ? (period as "weekly" | "monthly" | "all")
      : "all";
    const data = await this.leaderboardService.getUserRank(req.user.id, validPeriod);
    return { success: true, data };
  }
}
