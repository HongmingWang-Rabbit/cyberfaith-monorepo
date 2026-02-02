import { IsInt, Min, Max, IsOptional } from "class-validator";
import { Type } from "class-transformer";

export class TapDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  tapCount!: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  duration?: number;
}
