import { IsOptional, IsEnum, IsBoolean, IsDateString } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type, Transform } from "class-transformer";
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

  @ApiPropertyOptional({ description: "Filter favorited readings only" })
  @IsOptional()
  @Transform(({ value }) => value === "true" || value === true)
  @IsBoolean()
  favorited?: boolean;

  @ApiPropertyOptional({ description: "Filter from date (ISO)" })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional({ description: "Filter to date (ISO)" })
  @IsOptional()
  @IsDateString()
  to?: string;
}
