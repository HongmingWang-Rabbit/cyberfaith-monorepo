import { Module } from "@nestjs/common";
import { MuyuController } from "./muyu.controller";
import { MuyuService } from "./muyu.service";
import { PointsModule } from "../../points/points.module";

@Module({
  imports: [PointsModule],
  controllers: [MuyuController],
  providers: [MuyuService],
  exports: [MuyuService],
})
export class MuyuModule {}
