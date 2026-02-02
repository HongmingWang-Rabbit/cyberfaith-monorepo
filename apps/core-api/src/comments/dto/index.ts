import { IsString, MaxLength, IsOptional, IsUUID } from "class-validator";

export class CreateCommentDto {
  @IsString()
  @MaxLength(500)
  content!: string;

  @IsOptional()
  @IsUUID()
  parentId?: string;
}
