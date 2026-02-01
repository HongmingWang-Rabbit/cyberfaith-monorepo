import { Module } from "@nestjs/common";
import { AchievementsController } from "./achievements.controller";
import { AchievementsService } from "./achievements.service";
import { PointsModule } from "../points/points.module";

@Module({
  imports: [PointsModule],
  controllers: [AchievementsController],
  providers: [AchievementsService],
  exports: [AchievementsService],
})
export class AchievementsModule {}
