import { Module } from "@nestjs/common";
import { CompatibilityController } from "./compatibility.controller";
import { CompatibilityService } from "./compatibility.service";
import { DbModule } from "../db/db.module";

@Module({
  imports: [DbModule],
  controllers: [CompatibilityController],
  providers: [CompatibilityService],
  exports: [CompatibilityService],
})
export class CompatibilityModule {}
