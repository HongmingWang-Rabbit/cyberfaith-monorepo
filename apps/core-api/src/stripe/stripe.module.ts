import { Module } from "@nestjs/common";
import { DbModule } from "../db/db.module";
import { StripeController } from "./stripe.controller";
import { StripeService } from "./stripe.service";

@Module({
  imports: [DbModule],
  controllers: [StripeController],
  providers: [StripeService],
  exports: [StripeService],
})
export class StripeModule {}
