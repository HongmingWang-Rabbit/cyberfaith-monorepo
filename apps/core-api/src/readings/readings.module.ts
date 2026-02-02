import { Module } from "@nestjs/common";
import { ReadingsController, JournalController } from "./readings.controller";

@Module({
  controllers: [ReadingsController, JournalController],
})
export class ReadingsModule {}
