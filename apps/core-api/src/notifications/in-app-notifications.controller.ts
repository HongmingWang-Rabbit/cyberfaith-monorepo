import {
  Controller, Get, Patch, Post, Param, Query, Req, UseGuards, HttpStatus,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { InAppNotificationsService } from "./in-app-notifications.service";
import { AppException } from "../common/app.exception";
import { ErrorCode } from "../common/error-codes";
import { Request } from "express";

interface AuthRequest extends Request {
  user: { id: string; email: string };
}

@Controller("notifications")
@UseGuards(AuthGuard("jwt"))
export class InAppNotificationsController {
  constructor(private readonly service: InAppNotificationsService) {}

  @Get()
  async list(
    @Req() req: AuthRequest,
    @Query("page") page?: string,
    @Query("limit") limit?: string,
  ) {
    const pageNum = parseInt(page || "1", 10) || 1;
    const limitNum = Math.min(50, parseInt(limit || "20", 10) || 20);
    const result = await this.service.list(req.user.id, pageNum, limitNum);
    return { success: true, ...result };
  }

  @Get("unread-count")
  async unreadCount(@Req() req: AuthRequest) {
    const count = await this.service.unreadCount(req.user.id);
    return { success: true, data: { count } };
  }

  @Patch(":id/read")
  async markRead(@Req() req: AuthRequest, @Param("id") id: string) {
    const ok = await this.service.markRead(req.user.id, id);
    if (!ok) {
      throw new AppException(ErrorCode.NOTIFICATION_NOT_FOUND, "Notification not found", HttpStatus.NOT_FOUND);
    }
    return { success: true };
  }

  @Post("read-all")
  async markAllRead(@Req() req: AuthRequest) {
    await this.service.markAllRead(req.user.id);
    return { success: true };
  }
}
