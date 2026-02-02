import { IsString, IsEnum, IsOptional, IsUUID, MaxLength } from "class-validator";

export class CreateReportDto {
  @IsEnum(["reading", "comment", "user"])
  targetType!: "reading" | "comment" | "user";

  @IsUUID()
  targetId!: string;

  @IsEnum(["spam", "inappropriate", "harassment", "other"])
  reason!: "spam" | "inappropriate" | "harassment" | "other";

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  details?: string;
}

export class UpdateReportStatusDto {
  @IsEnum(["pending", "reviewed", "dismissed"])
  status!: "pending" | "reviewed" | "dismissed";
}
