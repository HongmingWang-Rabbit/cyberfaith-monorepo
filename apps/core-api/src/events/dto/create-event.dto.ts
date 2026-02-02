import { IsString, IsOptional, IsIn, IsDateString, IsInt, Min } from "class-validator";

export class CreateEventDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsIn(["seasonal", "holiday", "astronomical"])
  type!: "seasonal" | "holiday" | "astronomical";

  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;

  @IsOptional()
  @IsString()
  bannerImageUrl?: string;

  @IsOptional()
  @IsString()
  specialReadingType?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  karmaMultiplier?: number;
}
