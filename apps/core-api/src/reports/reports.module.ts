import { Module } from "@nestjs/common";
import { DbModule } from "../db/db.module";
import { AdminModule } from "../admin/admin.module";
import { ReportsController, AdminReportsController } from "./reports.controller";

@Module({
  imports: [DbModule, AdminModule],
  controllers: [ReportsController, AdminReportsController],
})
export class ReportsModule {}
