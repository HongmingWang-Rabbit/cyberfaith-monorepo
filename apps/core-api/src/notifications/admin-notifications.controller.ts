import { Controller, Get, Post, Param, UseGuards, HttpStatus } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { AdminGuard } from "../admin/admin.guard";
import { NotificationSchedulerService } from "./notification-scheduler.service";
import { AppException } from "../common/app.exception";
import { ErrorCode } from "../common/error-codes";

@Controller("admin/notification-jobs")
@UseGuards(AuthGuard("jwt"), AdminGuard)
export class AdminNotificationsController {
  constructor(private scheduler: NotificationSchedulerService) {}

  /** List all scheduled notification jobs and their status */
  @Get()
  async listJobs() {
    const jobs = this.scheduler.getJobStatuses();
    return { success: true, data: jobs };
  }

  /** Manually trigger a notification job by type */
  @Post(":type/trigger")
  async triggerJob(@Param("type") type: string) {
    try {
      const result = await this.scheduler.triggerJob(type);
      return { success: true, data: result };
    } catch (err: any) {
      throw new AppException(
        ErrorCode.VALIDATION_ERROR,
        err.message || "Unknown job type",
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
