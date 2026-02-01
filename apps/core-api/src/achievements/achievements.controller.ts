import { Controller, Get, Req, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { AchievementsService } from "./achievements.service";

@Controller("achievements")
export class AchievementsController {
  constructor(private readonly achievementsService: AchievementsService) {}

  @Get()
  async findAll() {
    const data = await this.achievementsService.getAllAchievements();
    return { success: true, data };
  }

  @Get("me")
  @UseGuards(AuthGuard("jwt"))
  async getMyAchievements(@Req() req: any) {
    const data = await this.achievementsService.getUserAchievements(req.user.id);
    return { success: true, data };
  }
}
