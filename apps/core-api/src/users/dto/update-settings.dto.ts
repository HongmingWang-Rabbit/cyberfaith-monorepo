import { IsOptional, IsString, IsBoolean, IsIn, MaxLength, Matches } from "class-validator";

export class UpdateSettingsDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  displayName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  @Matches(/^[a-z0-9][a-z0-9-]*[a-z0-9]$/, { message: "Username must be lowercase alphanumeric with hyphens" })
  username?: string;

  @IsOptional()
  @IsString()
  @MaxLength(4)
  mbtiType?: string;

  @IsOptional()
  @IsBoolean()
  notificationEmailDigest?: boolean;

  @IsOptional()
  @IsBoolean()
  notificationPush?: boolean;

  @IsOptional()
  @IsBoolean()
  notificationStreakReminders?: boolean;

  @IsOptional()
  @IsString()
  @IsIn(["dark", "light", "system"])
  theme?: string;

  @IsOptional()
  @IsString()
  @IsIn(["en", "zh"])
  language?: string;

  @IsOptional()
  @IsBoolean()
  privacyProfileVisible?: boolean;

  @IsOptional()
  @IsBoolean()
  privacyReadingVisible?: boolean;
}
