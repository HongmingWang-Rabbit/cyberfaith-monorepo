import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger";
import { Controller, Get, Req, UseGuards, UseInterceptors } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Request } from "express";
import { AchievementsService } from "./achievements.service";
import { HttpCacheInterceptor, CacheTTL } from "../cache/cache.interceptor";

interface AuthRequest extends Request {
  user: { id: string; email: string };
}

@ApiTags("Achievements")
@Controller("achievements")
@UseInterceptors(HttpCacheInterceptor)
export class AchievementsController {
  constructor(private readonly achievementsService: AchievementsService) {}

  @Get()
  @CacheTTL(300) // 5 minutes - achievements list rarely changes
  async findAll() {
    const data = await this.achievementsService.getAllAchievements();
    return { success: true, data };
  }

  @Get("me")
  @UseGuards(AuthGuard("jwt"))
  async getMyAchievements(@Req() req: AuthRequest) {
    const data = await this.achievementsService.getUserAchievements(req.user.id);
    return { success: true, data };
  }
}
