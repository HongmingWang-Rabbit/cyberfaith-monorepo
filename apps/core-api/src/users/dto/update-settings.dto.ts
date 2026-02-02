import { IsOptional, IsString, IsBoolean, IsIn, MaxLength } from "class-validator";

export class UpdateSettingsDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  displayName?: string;

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
