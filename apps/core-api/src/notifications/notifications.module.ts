import { Module } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";
import { DbModule } from "../db/db.module";
import { NotificationsController } from "./notifications.controller";
import { NotificationsService } from "./notifications.service";
import { InAppNotificationsController } from "./in-app-notifications.controller";
import { InAppNotificationsService } from "./in-app-notifications.service";
import { NotificationSchedulerService } from "./notification-scheduler.service";
import { AdminNotificationsController } from "./admin-notifications.controller";
import { EmailModule } from "../email/email.module";
import { AdminGuard } from "../admin/admin.guard";

@Module({
  imports: [DbModule, ScheduleModule.forRoot(), EmailModule],
  controllers: [NotificationsController, InAppNotificationsController, AdminNotificationsController],
  providers: [NotificationsService, InAppNotificationsService, NotificationSchedulerService, AdminGuard],
  exports: [NotificationsService, InAppNotificationsService, NotificationSchedulerService],
})
export class NotificationsModule {}
