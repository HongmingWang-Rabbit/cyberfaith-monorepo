import { Module } from "@nestjs/common";
import { FortuneCookieController } from "./fortune-cookie.controller";
import { FortuneCookieService } from "./fortune-cookie.service";
import { PointsModule } from "../../points/points.module";

@Module({
  imports: [PointsModule],
  controllers: [FortuneCookieController],
  providers: [FortuneCookieService],
  exports: [FortuneCookieService],
})
export class FortuneCookieModule {}
