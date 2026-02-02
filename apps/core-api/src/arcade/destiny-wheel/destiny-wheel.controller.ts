import { ApiTags } from "@nestjs/swagger";
import { Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Request } from "express";
import { DestinyWheelService } from "./destiny-wheel.service";

interface AuthRequest extends Request {
  user: { id: string; email: string };
}

@ApiTags("Destiny Wheel")
@Controller("arcade/destiny-wheel")
export class DestinyWheelController {
  constructor(private readonly service: DestinyWheelService) {}

  @Get("segments")
  async segments() {
    const data = this.service.getSegments();
    return { success: true, data };
  }

  @Post("spin")
  @UseGuards(AuthGuard("jwt"))
  async spin(@Req() req: AuthRequest) {
    const data = await this.service.spin(req.user.id);
    return { success: true, data };
  }

  @Get("status")
  @UseGuards(AuthGuard("jwt"))
  async status(@Req() req: AuthRequest) {
    const data = await this.service.getStatus(req.user.id);
    return { success: true, data };
  }
}
