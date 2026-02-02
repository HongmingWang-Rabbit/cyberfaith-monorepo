import { IsString, IsOptional, IsObject, MaxLength } from "class-validator";

export class PlayGameDto {
  @IsString()
  @MaxLength(50)
  gameSlug!: string;

  @IsOptional()
  @IsObject()
  input?: Record<string, any>;
}
