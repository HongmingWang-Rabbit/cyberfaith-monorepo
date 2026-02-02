import { IsBoolean } from "class-validator";

export class TogglePublicDto {
  @IsBoolean()
  isPublic!: boolean;
}
