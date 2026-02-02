import { Controller, Get, Post, Body, Req, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Request } from "express";
import { MuyuService } from "./muyu.service";
import { TapDto } from "./dto/tap.dto";

interface AuthRequest extends Request {
  user: { id: string; email: string };
}

@Controller("arcade/muyu")
export class MuyuController {
  constructor(private readonly muyuService: MuyuService) {}

  @Post("tap")
  @UseGuards(AuthGuard("jwt"))
  async tap(@Req() req: AuthRequest, @Body() body: TapDto) {
    const data = await this.muyuService.recordTaps(req.user.id, body.tapCount, body.duration);
    return { success: true, data };
  }

  @Get("stats")
  @UseGuards(AuthGuard("jwt"))
  async stats(@Req() req: AuthRequest) {
    const data = await this.muyuService.getStats(req.user.id);
    return { success: true, data };
  }
}
