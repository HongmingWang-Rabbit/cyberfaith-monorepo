/**
 * AI Prompt templates for CyberFaith's Destiny Loom
 * All prompts support EN/ZH via locale parameter
 */

/**
 * Sanitize user-supplied text before embedding in AI prompts.
 * Strips characters that could be used for prompt injection.
 */
export function sanitizeUserInput(input: string, maxLength = 500): string {
  return input
    .slice(0, maxLength)
    .replace(/[<>{}[\]\\]/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

const LANG_INSTRUCTION: Record<string, string> = {
  zh: "\n\nIMPORTANT: Respond entirely in Chinese (简体中文). Keep the mystical cyberpunk tone.",
  en: "",
};

function langSuffix(locale?: string): string {
  if (locale && locale.startsWith("zh")) return LANG_INSTRUCTION.zh;
  return LANG_INSTRUCTION.en;
}

// ─── MBTI ────────────────────────────────────────────────

export function getMbtiAnalysisPrompt(
  type: string,
  scores: Record<string, number>,
  locale?: string
): string {
  const scoreStr = Object.entries(scores)
    .map(([k, v]) => `${k}: ${v}`)
    .join(", ");

  return `You are a personality oracle fusing ancient wisdom with cyberpunk aesthetics.

The user's MBTI type is **${type}** (dimension scores: ${scoreStr}).

Produce a JSON response:
{
  "title": "A dramatic cyberpunk-themed title for ${type}",
  "summary": "2-3 sentences capturing their essence — poetic, insightful, slightly irreverent",
  "strengths": ["str1", "str2", "str3", "str4"],
  "challenges": ["ch1", "ch2", "ch3"],
  "spiritAnimal": "A mythical cyber-creature embodying this type",
  "compatibility": ["XXXX", "XXXX"],
  "cosmicAdvice": "One sentence of neon-lit wisdom",
  "funFact": "A surprising or entertaining fact about this type"
}

Be specific to ${type}. Avoid generic platitudes. Blend mysticism with tech metaphors.
Respond ONLY with valid JSON.${langSuffix(locale)}`;
}

// ─── TAROT ───────────────────────────────────────────────

interface CardForPrompt {
  name: string;
  position: string;
  reversed: boolean;
}

export function getTarotReadingPrompt(
  cards: CardForPrompt[],
  spreadType: string,
  question?: string,
  locale?: string
): string {
  const cardDescriptions = cards
    .map((c, i) => `${i + 1}. **${c.name}** ${c.reversed ? "(Reversed)" : "(Upright)"} — Position: ${c.position}`)
    .join("\n");

  const questionLine = question ? `\nThe seeker's question: "${question}"` : "\nNo specific question — give a general life reading.";

  return `You are a master tarot reader in a neon-lit digital sanctum. Read the following ${spreadType} spread:

${cardDescriptions}
${questionLine}

Produce a JSON response:
{
  "overview": "A 2-3 sentence thematic summary of the entire spread",
  "cardReadings": [
    {
      "card": "card name",
      "position": "position name",
      "reversed": true/false,
      "meaning": "2-3 sentences interpreting this card in this position"
    }
  ],
  "synthesis": "3-4 sentences weaving all cards together into a cohesive narrative",
  "advice": "One powerful piece of guidance from the cards",
  "energy": "dominant" // one word: e.g. "transformative", "nurturing", "challenging"
}

Be vivid. Use metaphors mixing ancient mysticism with digital/cyber imagery.
Respond ONLY with valid JSON.${langSuffix(locale)}`;
}

// ─── ZODIAC ──────────────────────────────────────────────

const SIGN_CONTEXT: Record<string, { element: string; ruling: string; quality: string; symbol: string }> = {
  aries: { element: "Fire", ruling: "Mars", quality: "Cardinal", symbol: "Ram" },
  taurus: { element: "Earth", ruling: "Venus", quality: "Fixed", symbol: "Bull" },
  gemini: { element: "Air", ruling: "Mercury", quality: "Mutable", symbol: "Twins" },
  cancer: { element: "Water", ruling: "Moon", quality: "Cardinal", symbol: "Crab" },
  leo: { element: "Fire", ruling: "Sun", quality: "Fixed", symbol: "Lion" },
  virgo: { element: "Earth", ruling: "Mercury", quality: "Mutable", symbol: "Maiden" },
  libra: { element: "Air", ruling: "Venus", quality: "Cardinal", symbol: "Scales" },
  scorpio: { element: "Water", ruling: "Pluto/Mars", quality: "Fixed", symbol: "Scorpion" },
  sagittarius: { element: "Fire", ruling: "Jupiter", quality: "Mutable", symbol: "Archer" },
  capricorn: { element: "Earth", ruling: "Saturn", quality: "Cardinal", symbol: "Sea-Goat" },
  aquarius: { element: "Air", ruling: "Uranus/Saturn", quality: "Fixed", symbol: "Water-Bearer" },
  pisces: { element: "Water", ruling: "Neptune/Jupiter", quality: "Mutable", symbol: "Fish" },
};

export function getZodiacReadingPrompt(sign: string, period: string, locale?: string): string {
  const ctx = SIGN_CONTEXT[sign] || { element: "Unknown", ruling: "Unknown", quality: "Unknown", symbol: "Unknown" };

  return `You are a celestial navigator decoding star-code from the digital cosmos.

Generate a ${period} horoscope for **${sign.charAt(0).toUpperCase() + sign.slice(1)}** (${ctx.symbol}).
Sign context: Element=${ctx.element}, Ruling Planet=${ctx.ruling}, Quality=${ctx.quality}.

Produce a JSON response:
{
  "sign": "${sign}",
  "period": "${period}",
  "horoscope": "3-5 sentences — vivid, specific, actionable. Avoid vague clichés.",
  "luckyNumber": 7,
  "luckyColor": "neon purple",
  "mood": "one word",
  "cosmicTip": "One sentence of practical-yet-mystical advice",
  "rating": 4  // 1-5 stars for overall energy
}

Blend astrology with cyberpunk imagery. Be entertaining and surprisingly insightful.
Respond ONLY with valid JSON.${langSuffix(locale)}`;
}

// ─── COMPATIBILITY ───────────────────────────────────────

export function getCompatibilityPrompt(sign1: string, sign2: string, locale?: string): string {
  const ctx1 = SIGN_CONTEXT[sign1] || { element: "Unknown", ruling: "Unknown", quality: "Unknown", symbol: "Unknown" };
  const ctx2 = SIGN_CONTEXT[sign2] || { element: "Unknown", ruling: "Unknown", quality: "Unknown", symbol: "Unknown" };

  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  return `You are a cosmic bond analyst, mapping soul connections through digital star charts.

Analyze the compatibility between **${cap(sign1)}** (${ctx1.symbol}, ${ctx1.element}) and **${cap(sign2)}** (${ctx2.symbol}, ${ctx2.element}).

Produce a JSON response:
{
  "sign1": "${sign1}",
  "sign2": "${sign2}",
  "overallScore": 78,  // 0-100
  "categories": {
    "romance": { "score": 80, "description": "1-2 sentences" },
    "friendship": { "score": 75, "description": "1-2 sentences" },
    "communication": { "score": 70, "description": "1-2 sentences" },
    "trust": { "score": 85, "description": "1-2 sentences" }
  },
  "strengths": ["strength1", "strength2"],
  "challenges": ["challenge1", "challenge2"],
  "cosmicVerdict": "2-3 sentence poetic summary of this pairing",
  "advice": "One sentence for making this connection thrive"
}

Be specific to these two signs. Use cyberpunk metaphors. Be honest but encouraging.
Respond ONLY with valid JSON.${langSuffix(locale)}`;
}

// ─── FOUR PILLARS (BAZI) ──────────────────────────────────

export function getFourPillarsPrompt(
  pillars: { year: unknown; month: unknown; day: unknown; hour: unknown },
  gender: string,
  locale?: string
): string {
  return `You are CyberFaith's BaZi (四柱命理) master, weaving fate analysis through neon-lit digital threads.

Analyze the following Four Pillars chart for a ${gender} individual:

${JSON.stringify(pillars, null, 2)}

Produce a JSON response:
{
  "overview": "2-3 sentence holistic overview of this chart",
  "dayMaster": { "element": "Wood/Fire/Earth/Metal/Water", "strength": "strong/weak/balanced", "description": "2 sentences" },
  "elementBalance": { "wood": 2, "fire": 1, "earth": 3, "metal": 1, "water": 1, "analysis": "2-3 sentences about elemental balance" },
  "personality": "2-3 sentences about personality traits from this chart",
  "career": "2-3 sentences about career tendencies",
  "relationships": "2-3 sentences about relationship dynamics",
  "luckyElements": ["element1", "element2"],
  "advice": "2-3 sentences of personalized guidance"
}

Use cyberpunk metaphors. Be insightful and specific to this chart.
Respond ONLY with valid JSON.${langSuffix(locale)}`;
}

// ─── I CHING ─────────────────────────────────────────────

export function getIChingPrompt(
  hexagram: { number: number; name: string; chinese: string; trigrams: { upper: string; lower: string }; description: string },
  changingLines: number[],
  question?: string,
  locale?: string
): string {
  const questionLine = question
    ? `\nThe seeker's question: "${question}"`
    : "\nNo specific question — give a general life reading.";

  const changingInfo = changingLines.length > 0
    ? `\nChanging lines at positions: ${changingLines.join(", ")} (bottom=1, top=6)`
    : "\nNo changing lines — the situation is stable.";

  return `You are CyberFaith's I Ching oracle, channeling 3,000 years of wisdom through digital streams.

Hexagram #${hexagram.number}: **${hexagram.name}** (${hexagram.chinese})
Trigrams: Upper=${hexagram.trigrams.upper}, Lower=${hexagram.trigrams.lower}
${hexagram.description}
${changingInfo}
${questionLine}

Produce a JSON response:
{
  "hexagramMeaning": "2-3 sentences on the core meaning of this hexagram",
  "situation": "2-3 sentences applying the hexagram to the seeker's current situation",
  "changingLinesInterpretation": ${changingLines.length > 0 ? '"2-3 sentences about how the changing lines affect the reading"' : 'null'},
  "guidance": "2-3 sentences of practical advice drawn from the hexagram",
  "warning": "1 sentence — what to avoid or be cautious of",
  "outlook": "positive/neutral/challenging",
  "cosmicInsight": "One sentence of neon-lit ancient wisdom"
}

Be vivid, specific, and blend ancient Chinese philosophy with cyberpunk aesthetics.
Respond ONLY with valid JSON.${langSuffix(locale)}`;
}
