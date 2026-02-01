import OpenAI from "openai";
import type { AIProvider, AIResult, GenerateOptions } from "./types";

// gpt-4o-mini pricing per 1M tokens
const PRICING: Record<string, { input: number; output: number }> = {
  "gpt-4o-mini": { input: 0.15, output: 0.60 },
  "gpt-4o": { input: 2.50, output: 10.00 },
  "gpt-3.5-turbo": { input: 0.50, output: 1.50 },
};

export class OpenAIProvider implements AIProvider {
  private client: OpenAI;
  private model: string;

  constructor(apiKey: string, model: string = "gpt-4o-mini") {
    this.client = new OpenAI({ apiKey });
    this.model = model;
  }

  private buildMessages(prompt: string, options?: GenerateOptions): OpenAI.ChatCompletionMessageParam[] {
    const messages: OpenAI.ChatCompletionMessageParam[] = [];
    if (options?.systemPrompt) {
      messages.push({ role: "system", content: options.systemPrompt });
    }
    messages.push({ role: "user", content: prompt });
    return messages;
  }

  async generateCompletion(prompt: string, options?: GenerateOptions): Promise<string> {
    const result = await this.generateWithUsage(prompt, options);
    return result.text;
  }

  async generateWithUsage(prompt: string, options?: GenerateOptions): Promise<AIResult> {
    const messages = this.buildMessages(prompt, options);

    const response = await this.client.chat.completions.create({
      model: this.model,
      messages,
      max_tokens: options?.maxTokens ?? 2048,
      temperature: options?.temperature ?? 0.7,
    });

    const text = response.choices[0]?.message?.content ?? "";
    const u = response.usage;
    const pricing = PRICING[this.model] ?? PRICING["gpt-4o-mini"];

    const usage = u ? {
      promptTokens: u.prompt_tokens,
      completionTokens: u.completion_tokens,
      totalTokens: u.total_tokens,
      model: this.model,
      provider: "openai",
      estimatedCost: (u.prompt_tokens * pricing.input + u.completion_tokens * pricing.output) / 1_000_000,
    } : null;

    return { text, usage };
  }
}
