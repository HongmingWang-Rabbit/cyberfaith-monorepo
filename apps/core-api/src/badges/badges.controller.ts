import { ApiTags } from "@nestjs/swagger";
import { Controller, Get, Post, Param, Req, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { BadgesService } from "./badges.service";
import { BADGE_DEFINITIONS } from "./badge-definitions";
import { Request } from "express";

interface AuthRequest extends Request {
  user: { id: string; email: string };
}

@ApiTags("Badges")
@Controller("badges")
export class BadgesController {
  constructor(private readonly badgesService: BadgesService) {}

  @Get("definitions")
  async definitions() {
    return {
      success: true,
      data: BADGE_DEFINITIONS.map((d) => ({
        key: d.key,
        title: d.title,
        icon: d.icon,
      })),
    };
  }

  @UseGuards(AuthGuard("jwt"))
  @Get("me")
  async myBadges(@Req() req: AuthRequest) {
    const data = await this.badgesService.getUserBadges(req.user.id);
    return { success: true, data };
  }

  @Get("user/:id")
  async userBadges(@Param("id") userId: string) {
    const data = await this.badgesService.getProfileBadges(userId);
    return { success: true, data };
  }

  @UseGuards(AuthGuard("jwt"))
  @Post("check")
  async checkBadges(@Req() req: AuthRequest) {
    const newBadges = await this.badgesService.checkAndAwardBadges(req.user.id);
    return { success: true, data: { newBadges } };
  }
}
