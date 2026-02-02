import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsUUID, IsString, IsOptional, MaxLength } from "class-validator";
import { Type } from "class-transformer";
import { PaginationDto } from "../../common/dto";

export class SendFriendRequestDto {
  @IsUUID("4", { message: "addresseeId must be a valid UUID" })
  @ApiProperty({ description: "Target user ID" })
  addresseeId!: string;
}

export class SearchUsersDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  @ApiPropertyOptional({ description: "Search query" })
  q?: string;
}
