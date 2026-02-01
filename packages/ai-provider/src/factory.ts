import type { AIProvider, AIProviderConfig } from "./types";
import { OpenAIProvider } from "./openai-provider";

export function createAIProvider(config: AIProviderConfig): AIProvider {
  switch (config.provider) {
    case "openai":
      return new OpenAIProvider(config.apiKey, config.model);
    case "anthropic":
    case "google":
      throw new Error(`Provider "${config.provider}" is not yet implemented. Use "openai" for now.`);
    default:
      throw new Error(`Unknown AI provider: ${config.provider}`);
  }
}
