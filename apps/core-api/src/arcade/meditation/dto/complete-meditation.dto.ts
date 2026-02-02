import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsString, Min, Max } from "class-validator";

export class CompleteMeditationDto {
  @IsNumber()
  @Min(1)
  @Max(60)
  @ApiProperty({ description: "Duration in minutes" })
  durationMinutes!: number;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: "Sound used during meditation" })
  soundUsed?: string;
}
