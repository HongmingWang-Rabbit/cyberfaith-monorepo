import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsString, MaxLength, IsOptional, IsUUID } from "class-validator";

export class CreateCommentDto {
  @IsString()
  @MaxLength(500)
  @ApiProperty({ description: "Comment text", maxLength: 500 })
  content!: string;

  @IsOptional()
  @IsUUID()
  @ApiPropertyOptional({ description: "Parent comment ID for replies" })
  parentId?: string;
}
