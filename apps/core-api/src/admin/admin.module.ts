import { Module } from "@nestjs/common";
import { AdminController } from "./admin.controller";
import { AdminGuard } from "./admin.guard";
import { AdminAnalyticsService } from "./admin-analytics.service";
import { AdminAuditService } from "./admin-audit.service";
import { DbModule } from "../db/db.module";
import { NotificationsModule } from "../notifications/notifications.module";
import { AuthModule } from "../auth/auth.module";
import { HealthModule } from "../health/health.module";

@Module({
  imports: [DbModule, NotificationsModule, AuthModule, HealthModule],
  controllers: [AdminController],
  providers: [AdminGuard, AdminAnalyticsService, AdminAuditService],
  exports: [AdminGuard, AdminAuditService],
})
export class AdminModule {}
