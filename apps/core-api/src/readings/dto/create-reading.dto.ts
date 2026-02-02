import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsOptional, IsBoolean, IsObject, MaxLength, IsString } from "class-validator";

export enum ReadingType {
  MBTI = "mbti",
  TAROT = "tarot",
  I_CHING = "i-ching",
  FOUR_PILLARS = "four-pillars",
  ZODIAC = "zodiac",
  DREAM = "dream",
}

export class CreateReadingDto {
  @IsEnum(ReadingType, { message: "type must be one of: mbti, tarot, i-ching, four-pillars, zodiac, dream" })
  @ApiProperty({ enum: ["mbti", "tarot", "i-ching", "four-pillars", "zodiac", "dream"], description: "Type of reading" })
  type!: ReadingType;

  @IsOptional()
  @IsObject()
  @ApiPropertyOptional({ description: "Input data for the reading" })
  input?: Record<string, any>;

  @IsOptional()
  @IsObject()
  @ApiPropertyOptional({ description: "Result data" })
  result?: Record<string, any>;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  @ApiPropertyOptional({ description: "Locale code", example: "en" })
  locale?: string;

  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional({ description: "Whether the reading is public" })
  isPublic?: boolean;
}
