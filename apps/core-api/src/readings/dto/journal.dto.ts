import { IsString, IsOptional, IsEnum, MaxLength, MinLength } from "class-validator";

export enum JournalMood {
  HAPPY = "happy",
  NEUTRAL = "neutral",
  SAD = "sad",
  ANXIOUS = "anxious",
  HOPEFUL = "hopeful",
  CONFUSED = "confused",
}

export class CreateJournalEntryDto {
  @IsString()
  @MinLength(1)
  @MaxLength(5000)
  content!: string;

  @IsOptional()
  @IsEnum(JournalMood)
  mood?: JournalMood;
}

export class UpdateJournalEntryDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(5000)
  content?: string;

  @IsOptional()
  @IsEnum(JournalMood)
  mood?: JournalMood;
}
