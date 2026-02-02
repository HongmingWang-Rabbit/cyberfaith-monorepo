import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty } from "class-validator";

export class SubscribeDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: "Push subscription endpoint" })
  endpoint!: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: "P256DH key" })
  p256dh!: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: "Auth key" })
  auth!: string;
}

export class UnsubscribeDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: "Push subscription endpoint" })
  endpoint!: string;
}
