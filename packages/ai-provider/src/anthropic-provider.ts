import Anthropic from "@anthropic-ai/sdk";
import type { AIProvider, GenerateOptions } from "./types";

export class AnthropicProvider implements AIProvider {
  private client: Anthropic;
  private model: string;

  constructor(apiKey: string, model: string = "claude-sonnet-4-20250514") {
    this.client = new Anthropic({ apiKey });
    this.model = model;
  }

  async generateCompletion(prompt: string, options?: GenerateOptions): Promise<string> {
    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: options?.maxTokens ?? 2048,
      ...(options?.systemPrompt ? { system: options.systemPrompt } : {}),
      messages: [{ role: "user", content: prompt }],
    });

    const block = response.content[0];
    return block?.type === "text" ? block.text : "";
  }
}
