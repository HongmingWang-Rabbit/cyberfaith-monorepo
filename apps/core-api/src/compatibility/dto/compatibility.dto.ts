import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsString, IsOptional, IsIn } from "class-validator";

const VALID_SIGNS = [
  "aries", "taurus", "gemini", "cancer", "leo", "virgo",
  "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces",
] as const;

const VALID_MBTI = [
  "INTJ", "INTP", "ENTJ", "ENTP", "INFJ", "INFP", "ENFJ", "ENFP",
  "ISTJ", "ISFJ", "ESTJ", "ESFJ", "ISTP", "ISFP", "ESTP", "ESFP",
] as const;

export class CompatibilityDto {
  @IsString()
  @IsIn(VALID_SIGNS)
  @ApiProperty({ description: "First zodiac sign" })
  sign1!: string;

  @IsString()
  @IsIn(VALID_SIGNS)
  @ApiProperty({ description: "Second zodiac sign" })
  sign2!: string;

  @IsOptional()
  @IsString()
  @IsIn(VALID_MBTI)
  @ApiPropertyOptional({ description: "First MBTI type" })
  mbtiType1?: string;

  @IsOptional()
  @IsString()
  @IsIn(VALID_MBTI)
  @ApiPropertyOptional({ description: "Second MBTI type" })
  mbtiType2?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: "Locale" })
  locale?: string;
}
