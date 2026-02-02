import { Module } from "@nestjs/common";
import { DbModule } from "../db/db.module";
import { HoroscopeController } from "./horoscope.controller";
import { HoroscopeService } from "./horoscope.service";

@Module({
  imports: [DbModule],
  controllers: [HoroscopeController],
  providers: [HoroscopeService],
  exports: [HoroscopeService],
})
export class HoroscopeModule {}
