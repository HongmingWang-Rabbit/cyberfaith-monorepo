import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsInt, Min, Max, IsOptional } from "class-validator";
import { Type } from "class-transformer";

export class TapDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @ApiProperty({ description: "Number of taps", minimum: 1, maximum: 100 })
  tapCount!: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @ApiPropertyOptional({ description: "Session duration in seconds" })
  duration?: number;
}
