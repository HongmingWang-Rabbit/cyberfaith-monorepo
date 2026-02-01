export interface GenerateOptions {
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
}

export interface AIUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  model: string;
  provider: string;
  estimatedCost: number; // USD
}

export interface AIResult {
  text: string;
  usage: AIUsage | null;
}

export interface AIProvider {
  generateCompletion(prompt: string, options?: GenerateOptions): Promise<string>;
  generateWithUsage(prompt: string, options?: GenerateOptions): Promise<AIResult>;
}

export interface AIProviderConfig {
  provider: "openai" | "anthropic" | "google";
  apiKey: string;
  model?: string;
}
