import { IsOptional, IsString, MaxLength, IsIn } from "class-validator";
import { PaginationDto } from "../../common/dto";

export class AdminUsersQueryDto extends PaginationDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  search?: string;
}

export class AdminReadingsQueryDto extends PaginationDto {
  @IsOptional()
  @IsString()
  @MaxLength(20)
  type?: string;

  @IsOptional()
  @IsIn(["true", "false"])
  isPublic?: string;
}

export class UpdateUserDto {
  @IsOptional()
  @IsIn(["user", "admin"])
  role?: "user" | "admin";

  @IsOptional()
  @IsIn(["free", "pro"])
  subscriptionTier?: string;
}
