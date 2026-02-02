import { ApiTags } from "@nestjs/swagger";
import { Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Request } from "express";
import { FortuneCookieService } from "./fortune-cookie.service";

interface AuthRequest extends Request {
  user: { id: string; email: string };
}

@ApiTags("Fortune Cookie")
@Controller("arcade/fortune-cookie")
export class FortuneCookieController {
  constructor(private readonly service: FortuneCookieService) {}

  @Post("crack")
  @UseGuards(AuthGuard("jwt"))
  async crack(@Req() req: AuthRequest) {
    const data = await this.service.crack(req.user.id);
    return { success: true, data };
  }

  @Get("status")
  @UseGuards(AuthGuard("jwt"))
  async status(@Req() req: AuthRequest) {
    const data = await this.service.getStatus(req.user.id);
    return { success: true, data };
  }
}
