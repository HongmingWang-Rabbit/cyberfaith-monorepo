import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsIn } from "class-validator";

const ZODIAC_SIGNS = [
  "aries", "taurus", "gemini", "cancer", "leo", "virgo",
  "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces",
];

export class SetZodiacDto {
  @IsString()
  @IsIn(ZODIAC_SIGNS)
  @ApiProperty({ description: "Zodiac sign", example: "aries" })
  zodiacSign!: string;
}
