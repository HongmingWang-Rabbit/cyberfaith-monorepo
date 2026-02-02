import { Injectable, Logger } from "@nestjs/common";
import { createAIProvider, type AIProvider } from "@cyberfaith/ai-provider";
import { getTierConfig, type TierAIConfig } from "./ai-tier-config";
import {
  getTarotReadingPrompt,
  getMbtiAnalysisPrompt,
  getZodiacReadingPrompt,
  getCompatibilityPrompt,
  getIChingPrompt,
  getFourPillarsPrompt,
  getDreamInterpretationPrompt,
  getFengShuiPrompt,
  getNumerologyPrompt,
  getDailyAffirmationPrompt,
} from "./prompts";

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  private getProvider(tier: string): { provider: AIProvider | null; tierConfig: TierAIConfig } {
    const tierConfig = getTierConfig(tier || "free");
    const keyMap: Record<string, string | undefined> = {
      openai: process.env.OPENAI_API_KEY,
      anthropic: process.env.ANTHROPIC_API_KEY,
      google: process.env.GOOGLE_AI_API_KEY,
    };
    const apiKey = keyMap[tierConfig.provider];
    if (!apiKey) {
      return { provider: null, tierConfig };
    }
    return {
      provider: createAIProvider({ provider: tierConfig.provider, apiKey, model: tierConfig.model }),
      tierConfig,
    };
  }

  private async generate(
    tier: string,
    prompt: string,
    systemPrompt: string,
    temperature: number,
  ): Promise<{ result: any; usage: any; tier: string }> {
    const { provider, tierConfig } = this.getProvider(tier);
    if (!provider) {
      return { result: null, usage: null, tier };
    }

    const aiResult = await provider.generateWithUsage(prompt, {
      temperature,
      maxTokens: tierConfig.maxTokens,
      systemPrompt: `${systemPrompt} ${tierConfig.systemPromptSuffix}`,
    });

    let parsed: any;
    try {
      parsed = JSON.parse(aiResult.text);
    } catch {
      parsed = { raw: aiResult.text };
    }

    return { result: parsed, usage: aiResult.usage, tier };
  }

  async tarot(body: { cards: any[]; spreadType: string; question?: string; locale?: string; tier?: string }) {
    const prompt = getTarotReadingPrompt(body.cards, body.spreadType, body.question, body.locale);
    return this.generate(
      body.tier || "free",
      prompt,
      "You are CyberFaith's Destiny Loom — a mystical AI oracle weaving tarot wisdom through neon-lit digital threads.",
      0.9,
    );
  }

  async mbti(body: { type: string; scores: Record<string, number>; locale?: string; tier?: string }) {
    const prompt = getMbtiAnalysisPrompt(body.type, body.scores, body.locale);
    return this.generate(
      body.tier || "free",
      prompt,
      "You are CyberFaith's Destiny Loom — a mystical AI oracle that reveals personality insights with a playful cyberpunk aesthetic.",
      0.8,
    );
  }

  async zodiac(body: { sign: string; period: string; locale?: string; tier?: string }) {
    const prompt = getZodiacReadingPrompt(body.sign, body.period, body.locale);
    return this.generate(
      body.tier || "free",
      prompt,
      "You are CyberFaith's Celestial Navigator — mapping star patterns through digital constellations.",
      0.85,
    );
  }

  async zodiacCompatibility(body: {
    sign1: string; sign2: string;
    mbtiType1?: string; mbtiType2?: string;
    locale?: string; tier?: string;
  }) {
    let prompt = getCompatibilityPrompt(body.sign1, body.sign2, body.locale);

    if (body.mbtiType1 || body.mbtiType2) {
      prompt += `\n\nAlso factor in MBTI types: ${body.mbtiType1 ? `Person 1 is ${body.mbtiType1}` : ""}${body.mbtiType1 && body.mbtiType2 ? ", " : ""}${body.mbtiType2 ? `Person 2 is ${body.mbtiType2}` : ""}.
Include how their MBTI types interact with their zodiac compatibility.`;
    }

    prompt += `\n\nAlso include these additional fields in the JSON:
  "loveScore": 0-100,
  "friendshipScore": 0-100,
  "workScore": 0-100`;

    return this.generate(
      body.tier || "free",
      prompt,
      "You are CyberFaith's Celestial Navigator — analyzing cosmic bonds between souls.",
      0.85,
    );
  }

  async iChing(body: {
    hexagram: { number: number; name: string; chinese: string; trigrams: { upper: string; lower: string }; description: string };
    changingLines: number[];
    question?: string;
    locale?: string;
    tier?: string;
  }) {
    const prompt = getIChingPrompt(body.hexagram, body.changingLines, body.question, body.locale);
    return this.generate(
      body.tier || "free",
      prompt,
      "You are CyberFaith's Destiny Loom — an I Ching oracle channeling ancient wisdom through digital streams.",
      0.9,
    );
  }

  async fourPillars(body: {
    pillars: { year: unknown; month: unknown; day: unknown; hour: unknown };
    gender: string;
    locale?: string;
    tier?: string;
  }) {
    const prompt = getFourPillarsPrompt(body.pillars, body.gender, body.locale);
    return this.generate(
      body.tier || "free",
      prompt,
      "You are CyberFaith's Destiny Loom — a BaZi master weaving fate analysis through neon-lit digital threads.",
      0.85,
    );
  }

  async dream(body: { dreamText: string; locale?: string; tier?: string }) {
    const prompt = getDreamInterpretationPrompt(body.dreamText, body.locale);
    return this.generate(
      body.tier || "free",
      prompt,
      "You are CyberFaith's Dream Oracle — a mystical AI that interprets dreams through the lens of psychology and digital mysticism.",
      0.9,
    );
  }

  async fengShui(body: {
    birthYear: number; chineseElement: string;
    roomType: string; compassDirection: string;
    locale?: string; tier?: string;
  }) {
    const prompt = getFengShuiPrompt(body.birthYear, body.chineseElement, body.roomType, body.compassDirection, body.locale);
    return this.generate(
      body.tier || "free",
      prompt,
      "You are CyberFaith's Feng Shui Architect — harmonizing ancient elemental wisdom with digital energy flows.",
      0.8,
    );
  }

  async numerology(body: {
    fullName: string; lifePathNumber: number;
    expressionNumber: number; soulUrgeNumber: number;
    locale?: string; tier?: string;
  }) {
    const prompt = getNumerologyPrompt(body.fullName, body.lifePathNumber, body.expressionNumber, body.soulUrgeNumber, body.locale);
    return this.generate(
      body.tier || "free",
      prompt,
      "You are CyberFaith's Numerology Oracle — decoding destiny through digital numerical frequencies.",
      0.8,
    );
  }

  async affirmations(body: { zodiacSign?: string | null; recentMood?: string | null; locale?: string; tier?: string }) {
    const prompt = getDailyAffirmationPrompt(body.zodiacSign || null, body.recentMood || null, body.locale);
    return this.generate(
      body.tier || "free",
      prompt,
      "You are CyberFaith's Affirmation Weaver — channeling cosmic energy into empowering digital mantras.",
      0.9,
    );
  }
}
