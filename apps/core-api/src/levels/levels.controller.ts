import { Controller, Get, Req, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { AuthGuard } from "@nestjs/passport";
import { Request } from "express";
import { LevelsService, LEVEL_TIERS } from "./levels.service";

interface AuthRequest extends Request {
  user: { id: string; email: string };
}

@ApiTags("Levels")
@Controller("users")
export class LevelsController {
  constructor(private levelsService: LevelsService) {}

  @UseGuards(AuthGuard("jwt"))
  @Get("level")
  async getLevel(@Req() req: AuthRequest) {
    const data = await this.levelsService.getUserLevel(req.user.id);
    return { success: true, data };
  }

  @Get("levels/tiers")
  async getTiers() {
    return { success: true, data: LEVEL_TIERS };
  }
}
