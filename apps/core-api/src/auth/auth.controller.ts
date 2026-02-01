import { Controller, Get, Req, Res, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { AuthService } from "./auth.service";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get("google")
  @UseGuards(AuthGuard("google"))
  googleLogin() {
    // Redirects to Google
  }

  @Get("google/callback")
  @UseGuards(AuthGuard("google"))
  async googleCallback(@Req() req: any, @Res() res: any) {
    const user = await this.authService.findOrCreateGoogleUser(req.user);
    const token = await this.authService.issueToken(user);
    // Redirect to frontend with token
    const redirectUrl = process.env.DESTINY_LOOM_URL || "http://localhost:3002";
    res.redirect(`${redirectUrl}/auth/callback?token=${token.access_token}`);
  }

  @Get("me")
  @UseGuards(AuthGuard("jwt"))
  async getMe(@Req() req: any) {
    const user = await this.authService.getUserById(req.user.id);
    if (!user) {
      return { error: "User not found" };
    }
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }
}
