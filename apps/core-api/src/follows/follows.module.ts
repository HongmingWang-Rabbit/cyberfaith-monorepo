import { Module } from "@nestjs/common";
import { DbModule } from "../db/db.module";
import { FollowsController, FeedController } from "./follows.controller";

@Module({
  imports: [DbModule],
  controllers: [FollowsController, FeedController],
})
export class FollowsModule {}
