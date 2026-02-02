import { Module } from "@nestjs/common";
import { DestinyWheelController } from "./destiny-wheel.controller";
import { DestinyWheelService } from "./destiny-wheel.service";
import { PointsModule } from "../../points/points.module";

@Module({
  imports: [PointsModule],
  controllers: [DestinyWheelController],
  providers: [DestinyWheelService],
  exports: [DestinyWheelService],
})
export class DestinyWheelModule {}
