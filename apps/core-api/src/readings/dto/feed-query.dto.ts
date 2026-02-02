import { IsOptional, IsEnum } from "class-validator";
import { Type } from "class-transformer";
import { PaginationDto } from "../../common/dto";
import { ReadingType } from "./create-reading.dto";

export class FeedQueryDto extends PaginationDto {
  @IsOptional()
  @IsEnum(ReadingType)
  type?: string;
}

export class ReadingsQueryDto extends PaginationDto {
  @IsOptional()
  @IsEnum(ReadingType)
  type?: string;
}
