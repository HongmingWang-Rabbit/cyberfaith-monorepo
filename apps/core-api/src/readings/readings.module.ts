import { Module } from "@nestjs/common";
import { ReadingsController, JournalController } from "./readings.controller";
import { FeaturedReadingService } from "./featured.service";

@Module({
  controllers: [ReadingsController, JournalController],
  providers: [FeaturedReadingService],
})
export class ReadingsModule {}
