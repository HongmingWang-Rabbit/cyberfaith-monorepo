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
  type!: ReadingType;

  @IsOptional()
  @IsObject()
  input?: Record<string, any>;

  @IsOptional()
  @IsObject()
  result?: Record<string, any>;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  locale?: string;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}
