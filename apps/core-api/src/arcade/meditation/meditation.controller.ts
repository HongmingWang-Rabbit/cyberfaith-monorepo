import { ApiTags } from "@nestjs/swagger";
import { Controller, Get, Post, Body, Req, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Request } from "express";
import { MeditationService } from "./meditation.service";
import { CompleteMeditationDto } from "./dto/complete-meditation.dto";

interface AuthRequest extends Request {
  user: { id: string; email: string };
}

@ApiTags("Meditation")
@Controller("arcade/meditation")
export class MeditationController {
  constructor(private readonly service: MeditationService) {}

  @Post("complete")
  @UseGuards(AuthGuard("jwt"))
  async complete(@Req() req: AuthRequest, @Body() body: CompleteMeditationDto) {
    const data = await this.service.complete(req.user.id, body.durationMinutes, body.soundUsed);
    return { success: true, data };
  }

  @Get("stats")
  @UseGuards(AuthGuard("jwt"))
  async stats(@Req() req: AuthRequest) {
    const data = await this.service.getStats(req.user.id);
    return { success: true, data };
  }
}
