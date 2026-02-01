import { Controller, Get, Req, UseGuards, Query } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Request } from "express";
import { PointsService } from "./points.service";

interface AuthRequest extends Request {
  user: { id: string; email: string };
}

@Controller("points")
export class PointsController {
  constructor(private readonly pointsService: PointsService) {}

  @Get("me")
  @UseGuards(AuthGuard("jwt"))
  async getMyPoints(@Req() req: AuthRequest) {
    const data = await this.pointsService.getUserPoints(req.user.id);
    return { success: true, data };
  }

  @Get("leaderboard")
  async getLeaderboard(@Query("limit") limit?: string) {
    const n = Math.min(50, Math.max(1, parseInt(limit || "10", 10) || 10));
    const data = await this.pointsService.getLeaderboard(n);
    return { success: true, data };
  }
}
