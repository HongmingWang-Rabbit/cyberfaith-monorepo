import { Controller, Post, Body, Req, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Request } from "express";
import { NotificationsService } from "./notifications.service";
import { SubscribeDto, UnsubscribeDto } from "./dto/subscribe.dto";

interface AuthRequest extends Request {
  user: { id: string; email: string };
}

@Controller("notifications")
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @UseGuards(AuthGuard("jwt"))
  @Post("subscribe")
  async subscribe(@Req() req: AuthRequest, @Body() body: SubscribeDto) {
    const sub = await this.notificationsService.subscribe(
      req.user.id,
      body.endpoint,
      body.p256dh,
      body.auth,
    );
    return { success: true, data: sub };
  }

  @UseGuards(AuthGuard("jwt"))
  @Post("unsubscribe")
  async unsubscribe(@Req() req: AuthRequest, @Body() body: UnsubscribeDto) {
    await this.notificationsService.unsubscribe(req.user.id, body.endpoint);
    return { success: true };
  }
}
