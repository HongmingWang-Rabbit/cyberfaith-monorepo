import { Controller, Get, Post, UseGuards, Req, ForbiddenException } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Request } from "express";
import { EmailService } from "./email.service";
import { DigestService } from "./digest.service";

interface AuthRequest extends Request {
  user: { id: string; email: string };
}

@Controller("email")
export class EmailController {
  constructor(
    private emailService: EmailService,
    private digestService: DigestService,
  ) {}

  /** Preview digest for the authenticated user (admin only placeholder — any authed user for now) */
  @UseGuards(AuthGuard("jwt"))
  @Get("digest-preview")
  async digestPreview(@Req() req: AuthRequest) {
    const data = await this.digestService.generateDigest(req.user.id);
    if (!data) {
      return { success: false, error: "No data available" };
    }
    return { success: true, data };
  }
}

@Controller("admin")
export class AdminEmailController {
  constructor(
    private emailService: EmailService,
    private digestService: DigestService,
  ) {}

  /** Trigger weekly digest for all opted-in users */
  @UseGuards(AuthGuard("jwt"))
  @Post("send-digest")
  async sendDigest() {
    const usersToEmail = await this.digestService.getUsersForDigest();
    let sent = 0;
    let failed = 0;

    for (const user of usersToEmail) {
      try {
        const data = await this.digestService.generateDigest(user.id);
        if (data) {
          await this.emailService.sendWeeklyDigest(user.email, data);
          sent++;
        }
      } catch {
        failed++;
      }
    }

    return { success: true, data: { sent, failed, total: usersToEmail.length } };
  }
}
