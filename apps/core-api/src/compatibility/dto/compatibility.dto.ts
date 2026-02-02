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
  sign1!: string;

  @IsString()
  @IsIn(VALID_SIGNS)
  sign2!: string;

  @IsOptional()
  @IsString()
  @IsIn(VALID_MBTI)
  mbtiType1?: string;

  @IsOptional()
  @IsString()
  @IsIn(VALID_MBTI)
  mbtiType2?: string;

  @IsOptional()
  @IsString()
  locale?: string;
}
