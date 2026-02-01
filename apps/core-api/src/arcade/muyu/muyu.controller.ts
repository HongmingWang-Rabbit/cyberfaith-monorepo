import { Controller, Get, Post, Body, Req, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Request } from "express";
import { MuyuService } from "./muyu.service";

interface AuthRequest extends Request {
  user: { id: string; email: string };
}

@Controller("arcade/muyu")
export class MuyuController {
  constructor(private readonly muyuService: MuyuService) {}

  /** Record a batch of taps */
  @Post("tap")
  @UseGuards(AuthGuard("jwt"))
  async tap(
    @Req() req: AuthRequest,
    @Body() body: { tapCount: number; duration?: number },
  ) {
    const tapCount = Math.min(100, Math.max(1, Math.floor(body.tapCount || 1)));
    const duration = body.duration ? Math.max(0, Math.floor(body.duration)) : undefined;
    const data = await this.muyuService.recordTaps(req.user.id, tapCount, duration);
    return { success: true, data };
  }

  /** Get user's muyu stats */
  @Get("stats")
  @UseGuards(AuthGuard("jwt"))
  async stats(@Req() req: AuthRequest) {
    const data = await this.muyuService.getStats(req.user.id);
    return { success: true, data };
  }
}
