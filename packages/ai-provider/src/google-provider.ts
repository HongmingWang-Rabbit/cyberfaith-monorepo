import { GoogleGenerativeAI } from "@google/generative-ai";
import type { AIProvider, AIResult, GenerateOptions } from "./types";

const PRICING: Record<string, { input: number; output: number }> = {
  "gemini-1.5-flash": { input: 0.075, output: 0.30 },
  "gemini-1.5-pro": { input: 1.25, output: 5.00 },
  "gemini-2.0-flash": { input: 0.10, output: 0.40 },
};

export class GoogleProvider implements AIProvider {
  private genAI: GoogleGenerativeAI;
  private model: string;

  constructor(apiKey: string, model: string = "gemini-1.5-flash") {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = model;
  }

  async generateCompletion(prompt: string, options?: GenerateOptions): Promise<string> {
    const result = await this.generateWithUsage(prompt, options);
    return result.text;
  }

  async generateWithUsage(prompt: string, options?: GenerateOptions): Promise<AIResult> {
    const model = this.genAI.getGenerativeModel({
      model: this.model,
      ...(options?.systemPrompt ? { systemInstruction: options.systemPrompt } : {}),
    });

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        maxOutputTokens: options?.maxTokens ?? 2048,
        temperature: options?.temperature ?? 0.7,
      },
    });

    const text = result.response.text();
    const u = result.response.usageMetadata;
    const pricing = PRICING[this.model] ?? PRICING["gemini-1.5-flash"];

    const usage = u ? {
      promptTokens: u.promptTokenCount ?? 0,
      completionTokens: u.candidatesTokenCount ?? 0,
      totalTokens: u.totalTokenCount ?? 0,
      model: this.model,
      provider: "google",
      estimatedCost: ((u.promptTokenCount ?? 0) * pricing.input + (u.candidatesTokenCount ?? 0) * pricing.output) / 1_000_000,
    } : null;

    return { text, usage };
  }
}
