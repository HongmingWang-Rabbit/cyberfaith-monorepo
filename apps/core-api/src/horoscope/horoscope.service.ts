import { Injectable, Inject } from "@nestjs/common";
import { DRIZZLE } from "../db/drizzle.provider";
import { dailyHoroscopes } from "../db/schema";
import { eq, and } from "drizzle-orm";
import { createAIProvider, type AIProvider } from "@cyberfaith/ai-provider";
import { CacheService } from "../cache/cache.service";

export interface HoroscopeContent {
  mood: string;
  luckyNumber: number;
  compatibility: string;
  reading: string;
}

const ZODIAC_SIGNS = [
  "aries", "taurus", "gemini", "cancer", "leo", "virgo",
  "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces",
] as const;

export type ZodiacSign = (typeof ZODIAC_SIGNS)[number];

export function isValidZodiacSign(sign: string): sign is ZodiacSign {
  return ZODIAC_SIGNS.includes(sign as ZodiacSign);
}

@Injectable()
export class HoroscopeService {
  private aiProvider: AIProvider | null = null;

  constructor(
    @Inject(DRIZZLE) private db: any,
    private readonly cache: CacheService,
  ) {
    const providerName = (process.env.AI_PROVIDER || "openai") as "openai" | "anthropic" | "google";
    const keyMap: Record<string, string | undefined> = {
      openai: process.env.OPENAI_API_KEY,
      anthropic: process.env.ANTHROPIC_API_KEY,
      google: process.env.GOOGLE_AI_API_KEY,
    };
    const apiKey = keyMap[providerName];
    if (apiKey) {
      this.aiProvider = createAIProvider({ provider: providerName, apiKey });
    }
  }

  private getToday(): string {
    return new Date().toISOString().slice(0, 10);
  }

  async getDailyHoroscope(sign: ZodiacSign): Promise<HoroscopeContent> {
    const today = this.getToday();
    const cacheKey = `horoscope:${sign}:${today}`;

    return this.cache.wrap(cacheKey, async () => {
      return this._fetchOrGenerate(sign, today);
    }, 60 * 60 * 1000); // 1 hour TTL
  }

  private async _fetchOrGenerate(sign: ZodiacSign, today: string): Promise<HoroscopeContent> {
    // Check DB
    const [existing] = await this.db
      .select()
      .from(dailyHoroscopes)
      .where(and(eq(dailyHoroscopes.sign, sign), eq(dailyHoroscopes.date, today)));

    if (existing) {
      return existing.content as HoroscopeContent;
    }

    // Generate
    const content = await this.generateHoroscope(sign, today);

    // Store (ignore conflict if race condition)
    try {
      await this.db.insert(dailyHoroscopes).values({
        sign,
        date: today,
        content,
      });
    } catch (err: any) {
      if (err?.code !== "23505") throw err;
      // Race condition: another request already inserted
    }

    return content;
  }

  private async generateHoroscope(sign: string, date: string): Promise<HoroscopeContent> {
    if (!this.aiProvider) {
      return this.generateFallbackHoroscope(sign);
    }

    try {
      const prompt = `Generate a daily horoscope for ${sign} on ${date}. Return ONLY valid JSON with these exact keys:
{
  "mood": "<one word mood>",
  "luckyNumber": <number 1-99>,
  "compatibility": "<most compatible zodiac sign today>",
  "reading": "<2-3 sentence horoscope reading>"
}`;

      const text = await this.aiProvider.generateCompletion(prompt, {
        maxTokens: 300,
        temperature: 0.8,
        systemPrompt: "You are a mystical astrologer. Return only valid JSON, no markdown.",
      });

      const cleaned = text.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
      return JSON.parse(cleaned);
    } catch {
      return this.generateFallbackHoroscope(sign);
    }
  }

  private generateFallbackHoroscope(sign: string): HoroscopeContent {
    const moods = ["Energetic", "Reflective", "Passionate", "Calm", "Adventurous", "Dreamy"];
    const signs = ["aries", "taurus", "gemini", "cancer", "leo", "virgo", "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces"];
    const idx = signs.indexOf(sign);

    return {
      mood: moods[idx % moods.length],
      luckyNumber: ((idx + 1) * 7 + new Date().getDate()) % 99 + 1,
      compatibility: signs[(idx + 4) % 12],
      reading: `The stars align favorably for ${sign} today. Trust your intuition and embrace new opportunities that come your way.`,
    };
  }
}
