import { IsUUID, IsString, IsOptional, MaxLength } from "class-validator";
import { Type } from "class-transformer";
import { PaginationDto } from "../../common/dto";

export class SendFriendRequestDto {
  @IsUUID("4", { message: "addresseeId must be a valid UUID" })
  addresseeId!: string;
}

export class SearchUsersDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  q?: string;
}
