import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, MaxLength, IsIn } from "class-validator";
import { PaginationDto } from "../../common/dto";

export class AdminUsersQueryDto extends PaginationDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  @ApiPropertyOptional({ description: "Search by name or email" })
  search?: string;
}

export class AdminReadingsQueryDto extends PaginationDto {
  @IsOptional()
  @IsString()
  @MaxLength(20)
  @ApiPropertyOptional({ description: "Filter by reading type" })
  type?: string;

  @IsOptional()
  @IsIn(["true", "false"])
  @ApiPropertyOptional({ description: "Filter by public status" })
  isPublic?: string;
}

export class UpdateUserDto {
  @IsOptional()
  @IsIn(["user", "admin"])
  @ApiPropertyOptional({ enum: ["user", "admin"] })
  role?: "user" | "admin";

  @IsOptional()
  @IsIn(["free", "pro"])
  @ApiPropertyOptional({ enum: ["free", "pro"] })
  subscriptionTier?: string;

  @IsOptional()
  @ApiPropertyOptional({ description: "Ban/unban user" })
  isActive?: boolean;
}
