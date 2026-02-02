import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean } from "class-validator";

export class TogglePublicDto {
  @IsBoolean()
  @ApiProperty({ description: "Toggle public visibility" })
  isPublic!: boolean;
}
