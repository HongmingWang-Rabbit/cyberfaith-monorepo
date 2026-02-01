import Anthropic from "@anthropic-ai/sdk";
import type { AIProvider, AIResult, GenerateOptions } from "./types";

const PRICING: Record<string, { input: number; output: number }> = {
  "claude-haiku-4-20250414": { input: 0.80, output: 4.00 },
  "claude-sonnet-4-20250514": { input: 3.00, output: 15.00 },
  "claude-opus-4-20250514": { input: 15.00, output: 75.00 },
};

export class AnthropicProvider implements AIProvider {
  private client: Anthropic;
  private model: string;

  constructor(apiKey: string, model: string = "claude-haiku-4-20250414") {
    this.client = new Anthropic({ apiKey });
    this.model = model;
  }

  async generateCompletion(prompt: string, options?: GenerateOptions): Promise<string> {
    const result = await this.generateWithUsage(prompt, options);
    return result.text;
  }

  async generateWithUsage(prompt: string, options?: GenerateOptions): Promise<AIResult> {
    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: options?.maxTokens ?? 2048,
      ...(options?.systemPrompt ? { system: options.systemPrompt } : {}),
      messages: [{ role: "user", content: prompt }],
    });

    const block = response.content[0];
    const text = block?.type === "text" ? block.text : "";
    const u = response.usage;
    const pricing = PRICING[this.model] ?? PRICING["claude-haiku-4-20250414"];

    const usage = u ? {
      promptTokens: u.input_tokens,
      completionTokens: u.output_tokens,
      totalTokens: u.input_tokens + u.output_tokens,
      model: this.model,
      provider: "anthropic",
      estimatedCost: (u.input_tokens * pricing.input + u.output_tokens * pricing.output) / 1_000_000,
    } : null;

    return { text, usage };
  }
}
