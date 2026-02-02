import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsString, IsEnum, IsOptional, IsUUID, MaxLength } from "class-validator";

export class CreateReportDto {
  @IsEnum(["reading", "comment", "user"])
  @ApiProperty({ enum: ["reading", "comment", "user"] })
  targetType!: "reading" | "comment" | "user";

  @IsUUID()
  @ApiProperty({ description: "ID of reported entity" })
  targetId!: string;

  @IsEnum(["spam", "inappropriate", "harassment", "other"])
  @ApiProperty({ enum: ["spam", "inappropriate", "harassment", "other"] })
  reason!: "spam" | "inappropriate" | "harassment" | "other";

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  @ApiPropertyOptional({ description: "Additional details" })
  details?: string;
}

export class UpdateReportStatusDto {
  @IsEnum(["pending", "reviewed", "dismissed"])
  @ApiProperty({ enum: ["pending", "reviewed", "dismissed"] })
  status!: "pending" | "reviewed" | "dismissed";
}
