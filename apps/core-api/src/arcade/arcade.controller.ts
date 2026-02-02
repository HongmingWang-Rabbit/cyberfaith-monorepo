import { Controller, Get, Post, Body, Req, UseGuards, Query } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Request } from "express";
import { ArcadeService } from "./arcade.service";
import { PlayGameDto } from "./dto";
import { PaginationDto } from "../common/dto";

interface AuthRequest extends Request {
  user: { id: string; email: string };
}

@Controller("arcade")
export class ArcadeController {
  constructor(private readonly arcadeService: ArcadeService) {}

  @Get("games")
  async listGames() {
    const data = await this.arcadeService.listGames();
    return { success: true, data };
  }

  @Post("play")
  @UseGuards(AuthGuard("jwt"))
  async play(@Req() req: AuthRequest, @Body() body: PlayGameDto) {
    const data = await this.arcadeService.play(req.user.id, body.gameSlug, body.input);
    return { success: true, data };
  }

  @Get("history")
  @UseGuards(AuthGuard("jwt"))
  async history(@Req() req: AuthRequest, @Query() query: PaginationDto) {
    const l = Math.min(50, query.limit ?? 20);
    const p = query.page ?? 1;
    const data = await this.arcadeService.getHistory(req.user.id, l, p);
    return { success: true, data };
  }
}
