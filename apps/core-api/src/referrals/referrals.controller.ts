import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger";
import { Controller, Get, Post, Body, Req, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Request } from "express";
import { ReferralsService } from "./referrals.service";

interface AuthRequest extends Request {
  user: { id: string; email: string };
}

@ApiTags("Referrals")
@Controller("users")
export class ReferralsController {
  constructor(private readonly referralsService: ReferralsService) {}

  @UseGuards(AuthGuard("jwt"))
  @Get("referral-code")
  async getReferralCode(@Req() req: AuthRequest) {
    const code = await this.referralsService.getOrCreateReferralCode(req.user.id);
    return { success: true, data: { code } };
  }

  @UseGuards(AuthGuard("jwt"))
  @Post("referral/apply")
  async applyReferral(@Req() req: AuthRequest, @Body() body: { code: string }) {
    const referral = await this.referralsService.applyReferralCode(req.user.id, body.code);
    return { success: true, data: referral };
  }

  @UseGuards(AuthGuard("jwt"))
  @Get("referrals")
  async listReferrals(@Req() req: AuthRequest) {
    const data = await this.referralsService.listReferrals(req.user.id);
    return { success: true, data };
  }
}
