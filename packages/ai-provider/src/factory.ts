import type { AIProvider, AIProviderConfig } from "./types";
import { OpenAIProvider } from "./openai-provider";
import { AnthropicProvider } from "./anthropic-provider";
import { GoogleProvider } from "./google-provider";

export function createAIProvider(config: AIProviderConfig): AIProvider {
  switch (config.provider) {
    case "openai":
      return new OpenAIProvider(config.apiKey, config.model);
    case "anthropic":
      return new AnthropicProvider(config.apiKey, config.model);
    case "google":
      return new GoogleProvider(config.apiKey, config.model);
    default:
      throw new Error(`Unknown AI provider: ${config.provider}`);
  }
}
