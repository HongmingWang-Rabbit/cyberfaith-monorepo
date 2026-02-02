import { Module } from "@nestjs/common";
import { DbModule } from "../db/db.module";
import { NotificationsModule } from "../notifications/notifications.module";
import { FollowsController, FeedController } from "./follows.controller";

@Module({
  imports: [DbModule, NotificationsModule],
  controllers: [FollowsController, FeedController],
})
export class FollowsModule {}
