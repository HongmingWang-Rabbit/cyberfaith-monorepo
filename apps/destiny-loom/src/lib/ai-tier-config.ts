/**
 * AI model configuration per subscription tier.
 * Easy to change models — just update this file.
 */

export interface TierAIConfig {
  provider: "openai" | "anthropic" | "google";
  model: string;
  maxTokens: number;
  /** Extra system prompt suffix for this tier */
  systemPromptSuffix: string;
}

export const AI_TIER_CONFIG: Record<string, TierAIConfig> = {
  free: {
    provider: (process.env.AI_PROVIDER as "openai" | "anthropic" | "google") || "openai",
    model: process.env.AI_MODEL_FREE || "gpt-4o-mini",
    maxTokens: 1024,
    systemPromptSuffix: "Keep your response concise and focused.",
  },
  pro: {
    provider: (process.env.AI_PROVIDER_PRO as "openai" | "anthropic" | "google") || (process.env.AI_PROVIDER as "openai" | "anthropic" | "google") || "openai",
    model: process.env.AI_MODEL_PRO || "gpt-4o",
    maxTokens: 4096,
    systemPromptSuffix: "Provide a rich, detailed, and insightful response. Go deeper into symbolism, nuance, and personal guidance. Include multiple perspectives and actionable advice.",
  },
};

/** Get the tier config, defaulting to free */
export function getTierConfig(tier: string): TierAIConfig {
  return AI_TIER_CONFIG[tier] || AI_TIER_CONFIG.free;
}
