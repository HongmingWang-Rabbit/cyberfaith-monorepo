import { Module } from "@nestjs/common";
import { DbModule } from "../db/db.module";
import { NotificationsController } from "./notifications.controller";
import { NotificationsService } from "./notifications.service";
import { InAppNotificationsController } from "./in-app-notifications.controller";
import { InAppNotificationsService } from "./in-app-notifications.service";

@Module({
  imports: [DbModule],
  controllers: [NotificationsController, InAppNotificationsController],
  providers: [NotificationsService, InAppNotificationsService],
  exports: [NotificationsService, InAppNotificationsService],
})
export class NotificationsModule {}
