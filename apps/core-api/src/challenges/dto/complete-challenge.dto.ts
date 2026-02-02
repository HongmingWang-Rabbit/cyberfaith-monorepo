import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, MaxLength } from "class-validator";

export class CompleteChallengeDto {
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  @ApiPropertyOptional({ description: "Optional note about completing the challenge" })
  note?: string;
}
