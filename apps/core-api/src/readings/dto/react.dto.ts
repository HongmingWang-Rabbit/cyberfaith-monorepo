import { IsIn } from "class-validator";

const VALID_EMOJIS = ["👍", "❤️", "🔮", "✨", "🌟"] as const;

export class ReactDto {
  @IsIn(VALID_EMOJIS, { message: `emoji must be one of: ${VALID_EMOJIS.join(" ")}` })
  emoji!: string;
}
