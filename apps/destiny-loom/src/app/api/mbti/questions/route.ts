import { NextResponse } from "next/server";
import { withRateLimitHeaders } from "@/lib/api-utils";

interface MBTIQuestion {
  id: number;
  text: string;
  dimension: "EI" | "SN" | "TF" | "JP";
  optionA: { text: string; value: string };
  optionB: { text: string; value: string };
}

const questions: MBTIQuestion[] = [
  // E vs I
  { id: 1, dimension: "EI", text: "At a party, you tend to:", optionA: { text: "Talk to many people, including strangers", value: "E" }, optionB: { text: "Stay with people you already know", value: "I" } },
  { id: 2, dimension: "EI", text: "You recharge by:", optionA: { text: "Being around others", value: "E" }, optionB: { text: "Spending time alone", value: "I" } },
  { id: 3, dimension: "EI", text: "You prefer working:", optionA: { text: "In a team environment", value: "E" }, optionB: { text: "Independently", value: "I" } },
  { id: 4, dimension: "EI", text: "When thinking through a problem, you:", optionA: { text: "Talk it out with others", value: "E" }, optionB: { text: "Reflect on it internally", value: "I" } },
  { id: 5, dimension: "EI", text: "Your ideal weekend involves:", optionA: { text: "Going out and socializing", value: "E" }, optionB: { text: "Quiet time at home", value: "I" } },
  // S vs N
  { id: 6, dimension: "SN", text: "You focus more on:", optionA: { text: "Present realities", value: "S" }, optionB: { text: "Future possibilities", value: "N" } },
  { id: 7, dimension: "SN", text: "You prefer instructions that are:", optionA: { text: "Step-by-step and detailed", value: "S" }, optionB: { text: "General, leaving room for interpretation", value: "N" } },
  { id: 8, dimension: "SN", text: "You trust more:", optionA: { text: "Experience and facts", value: "S" }, optionB: { text: "Gut feelings and intuition", value: "N" } },
  { id: 9, dimension: "SN", text: "You're more drawn to:", optionA: { text: "Practical solutions", value: "S" }, optionB: { text: "Innovative ideas", value: "N" } },
  { id: 10, dimension: "SN", text: "When reading, you prefer:", optionA: { text: "Literal, factual content", value: "S" }, optionB: { text: "Figurative, symbolic content", value: "N" } },
  // T vs F
  { id: 11, dimension: "TF", text: "When making decisions, you prioritize:", optionA: { text: "Logic and consistency", value: "T" }, optionB: { text: "People and values", value: "F" } },
  { id: 12, dimension: "TF", text: "In conflicts, you tend to:", optionA: { text: "Seek the objective truth", value: "T" }, optionB: { text: "Seek harmony", value: "F" } },
  { id: 13, dimension: "TF", text: "You're more impressed by:", optionA: { text: "Competence and achievement", value: "T" }, optionB: { text: "Compassion and empathy", value: "F" } },
  { id: 14, dimension: "TF", text: "When giving feedback, you:", optionA: { text: "Are direct and honest", value: "T" }, optionB: { text: "Are tactful and encouraging", value: "F" } },
  { id: 15, dimension: "TF", text: "You'd rather be seen as:", optionA: { text: "Competent", value: "T" }, optionB: { text: "Caring", value: "F" } },
  // J vs P
  { id: 16, dimension: "JP", text: "You prefer your days to be:", optionA: { text: "Planned and structured", value: "J" }, optionB: { text: "Flexible and spontaneous", value: "P" } },
  { id: 17, dimension: "JP", text: "Deadlines make you:", optionA: { text: "Motivated to finish early", value: "J" }, optionB: { text: "Energized at the last minute", value: "P" } },
  { id: 18, dimension: "JP", text: "You prefer to:", optionA: { text: "Make decisions quickly", value: "J" }, optionB: { text: "Keep options open", value: "P" } },
  { id: 19, dimension: "JP", text: "Your workspace is usually:", optionA: { text: "Neat and organized", value: "J" }, optionB: { text: "Creative chaos", value: "P" } },
  { id: 20, dimension: "JP", text: "When traveling, you prefer:", optionA: { text: "A detailed itinerary", value: "J" }, optionB: { text: "Going with the flow", value: "P" } },
];

export function GET() {
  return withRateLimitHeaders(NextResponse.json({ questions }));
}
