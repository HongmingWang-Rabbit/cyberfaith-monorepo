import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsString, IsOptional, IsObject, MaxLength } from "class-validator";

export class PlayGameDto {
  @IsString()
  @MaxLength(50)
  @ApiProperty({ description: "Game slug identifier" })
  gameSlug!: string;

  @IsOptional()
  @IsObject()
  @ApiPropertyOptional({ description: "Game input data" })
  input?: Record<string, any>;
}
