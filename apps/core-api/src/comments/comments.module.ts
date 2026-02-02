import { Module } from "@nestjs/common";
import { DbModule } from "../db/db.module";
import { NotificationsModule } from "../notifications/notifications.module";
import { CommentsOnReadingsController, CommentsController } from "./comments.controller";

@Module({
  imports: [DbModule, NotificationsModule],
  controllers: [CommentsOnReadingsController, CommentsController],
})
export class CommentsModule {}
