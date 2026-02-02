import { Module } from "@nestjs/common";
import { DbModule } from "../db/db.module";
import { CommentsOnReadingsController, CommentsController } from "./comments.controller";

@Module({
  imports: [DbModule],
  controllers: [CommentsOnReadingsController, CommentsController],
})
export class CommentsModule {}
