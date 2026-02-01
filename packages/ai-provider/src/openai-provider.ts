import OpenAI from "openai";
import type { AIProvider, GenerateOptions } from "./types";

export class OpenAIProvider implements AIProvider {
  private client: OpenAI;
  private model: string;

  constructor(apiKey: string, model: string = "gpt-4o-mini") {
    this.client = new OpenAI({ apiKey });
    this.model = model;
  }

  async generateCompletion(prompt: string, options?: GenerateOptions): Promise<string> {
    const messages: OpenAI.ChatCompletionMessageParam[] = [];

    if (options?.systemPrompt) {
      messages.push({ role: "system", content: options.systemPrompt });
    }

    messages.push({ role: "user", content: prompt });

    const response = await this.client.chat.completions.create({
      model: this.model,
      messages,
      max_tokens: options?.maxTokens ?? 2048,
      temperature: options?.temperature ?? 0.7,
    });

    return response.choices[0]?.message?.content ?? "";
  }
}
