import { Controller, Get, NotFoundException, Req, Res, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import type { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { AuthRateLimitGuard } from "../common/rate-limit.guard";

interface AuthRequest extends Request {
  user: { id: string; email: string };
}

interface GoogleAuthRequest extends Request {
  user: { email: string; name: string; googleId: string; avatarUrl: string | null };
}

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get("google")
  @UseGuards(AuthRateLimitGuard, AuthGuard("google"))
  googleLogin() {
    // Redirects to Google
  }

  @Get("google/callback")
  @UseGuards(AuthRateLimitGuard, AuthGuard("google"))
  async googleCallback(@Req() req: GoogleAuthRequest, @Res() res: Response) {
    const user = await this.authService.findOrCreateGoogleUser(req.user);
    const token = await this.authService.issueToken(user);
    const redirectUrl = process.env.DESTINY_LOOM_URL || "http://localhost:3002";
    res.redirect(`${redirectUrl}/auth/callback?token=${token.access_token}`);
  }

  @Get("me")
  @UseGuards(AuthGuard("jwt"))
  async getMe(@Req() req: AuthRequest) {
    const user = await this.authService.getUserById(req.user.id);
    if (!user) {
      throw new NotFoundException("User not found");
    }
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }
}
