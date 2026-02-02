import { IsOptional, IsEnum } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { PaginationDto } from "../../common/dto";
import { ReadingType } from "./create-reading.dto";

export class FeedQueryDto extends PaginationDto {
  @ApiPropertyOptional({ enum: ReadingType, description: "Filter by reading type" })
  @IsOptional()
  @IsEnum(ReadingType)
  type?: string;
}

export class ReadingsQueryDto extends PaginationDto {
  @ApiPropertyOptional({ enum: ReadingType, description: "Filter by reading type" })
  @IsOptional()
  @IsEnum(ReadingType)
  type?: string;
}
