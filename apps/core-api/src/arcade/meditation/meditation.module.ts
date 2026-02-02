import { Module } from "@nestjs/common";
import { MeditationController } from "./meditation.controller";
import { MeditationService } from "./meditation.service";
import { PointsModule } from "../../points/points.module";

@Module({
  imports: [PointsModule],
  controllers: [MeditationController],
  providers: [MeditationService],
  exports: [MeditationService],
})
export class MeditationModule {}
