import { Module } from "@nestjs/common";
import { AdminController } from "./admin.controller";
import { AdminGuard } from "./admin.guard";
import { DbModule } from "../db/db.module";
import { NotificationsModule } from "../notifications/notifications.module";

@Module({
  imports: [DbModule, NotificationsModule],
  controllers: [AdminController],
  providers: [AdminGuard],
  exports: [AdminGuard],
})
export class AdminModule {}
