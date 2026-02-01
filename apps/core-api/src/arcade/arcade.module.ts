import { Module } from "@nestjs/common";
import { ArcadeController } from "./arcade.controller";
import { ArcadeService } from "./arcade.service";
import { PointsModule } from "../points/points.module";

@Module({
  imports: [PointsModule],
  controllers: [ArcadeController],
  providers: [ArcadeService],
  exports: [ArcadeService],
})
export class ArcadeModule {}
