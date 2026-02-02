import { Module } from "@nestjs/common";
import { DbModule } from "../db/db.module";
import { BadgesController } from "./badges.controller";
import { BadgesService } from "./badges.service";

@Module({
  imports: [DbModule],
  controllers: [BadgesController],
  providers: [BadgesService],
  exports: [BadgesService],
})
export class BadgesModule {}
