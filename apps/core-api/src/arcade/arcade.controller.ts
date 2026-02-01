import { Controller, Get, Post, Body, Req, UseGuards, Query } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Request } from "express";
import { ArcadeService } from "./arcade.service";

interface AuthRequest extends Request {
  user: { id: string; email: string };
}

@Controller("arcade")
export class ArcadeController {
  constructor(private readonly arcadeService: ArcadeService) {}

  /** List active games — public, no auth */
  @Get("games")
  async listGames() {
    const data = await this.arcadeService.listGames();
    return { success: true, data };
  }

  /** Play a game — auth required */
  @Post("play")
  @UseGuards(AuthGuard("jwt"))
  async play(
    @Req() req: AuthRequest,
    @Body() body: { gameSlug: string; input?: Record<string, any> },
  ) {
    const data = await this.arcadeService.play(req.user.id, body.gameSlug, body.input);
    return { success: true, data };
  }

  /** Play history — auth required */
  @Get("history")
  @UseGuards(AuthGuard("jwt"))
  async history(
    @Req() req: AuthRequest,
    @Query("limit") limit?: string,
    @Query("page") page?: string,
  ) {
    const l = Math.min(50, Math.max(1, parseInt(limit || "20", 10) || 20));
    const p = Math.max(1, parseInt(page || "1", 10) || 1);
    const data = await this.arcadeService.getHistory(req.user.id, l, p);
    return { success: true, data };
  }
}
