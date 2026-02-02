import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, IsBoolean, IsIn, MaxLength, Matches } from "class-validator";

export class UpdateSettingsDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  @ApiPropertyOptional()
  displayName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  @Matches(/^[a-z0-9][a-z0-9-]*[a-z0-9]$/, { message: "Username must be lowercase alphanumeric with hyphens" })
  @ApiPropertyOptional()
  username?: string;

  @IsOptional()
  @IsString()
  @MaxLength(4)
  @ApiPropertyOptional()
  mbtiType?: string;

  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional()
  notificationEmailDigest?: boolean;

  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional()
  notificationPush?: boolean;

  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional()
  notificationStreakReminders?: boolean;

  @IsOptional()
  @IsString()
  @IsIn(["dark", "light", "system"])
  @ApiPropertyOptional({ enum: ["dark", "light", "system"] })
  theme?: string;

  @IsOptional()
  @IsString()
  @IsIn(["en", "zh"])
  @ApiPropertyOptional({ enum: ["en", "zh"] })
  language?: string;

  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional()
  privacyProfileVisible?: boolean;

  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional()
  privacyReadingVisible?: boolean;
}
