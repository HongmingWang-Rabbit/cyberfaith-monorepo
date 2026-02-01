export interface GenerateOptions {
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
}

export interface AIProvider {
  generateCompletion(prompt: string, options?: GenerateOptions): Promise<string>;
}

export interface AIProviderConfig {
  provider: "openai" | "anthropic" | "google";
  apiKey: string;
  model?: string;
}
