import { IsString, IsOptional, IsIn, IsDateString, IsInt, Min } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateEventDto {
  @ApiProperty({ example: "Summer Solstice" })
  @IsString()
  name!: string;

  @ApiPropertyOptional({ example: "Celebrate the longest day of the year" })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: ["seasonal", "holiday", "astronomical"] })
  @IsIn(["seasonal", "holiday", "astronomical"])
  type!: "seasonal" | "holiday" | "astronomical";

  @ApiProperty({ example: "2025-06-21T00:00:00Z" })
  @IsDateString()
  startDate!: string;

  @ApiProperty({ example: "2025-06-22T00:00:00Z" })
  @IsDateString()
  endDate!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  bannerImageUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  specialReadingType?: string;

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @IsInt()
  @Min(1)
  karmaMultiplier?: number;
}
