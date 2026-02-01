import { Module } from "@nestjs/common";
import { DbModule } from "../db/db.module";
import { EmailService } from "./email.service";
import { DigestService } from "./digest.service";
import { EmailController, AdminEmailController } from "./email.controller";

@Module({
  imports: [DbModule],
  controllers: [EmailController, AdminEmailController],
  providers: [EmailService, DigestService],
  exports: [EmailService, DigestService],
})
export class EmailModule {}
