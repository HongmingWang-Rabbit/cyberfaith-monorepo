import { GoogleGenerativeAI } from "@google/generative-ai";
import type { AIProvider, GenerateOptions } from "./types";

export class GoogleProvider implements AIProvider {
  private genAI: GoogleGenerativeAI;
  private model: string;

  constructor(apiKey: string, model: string = "gemini-1.5-flash") {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = model;
  }

  async generateCompletion(prompt: string, options?: GenerateOptions): Promise<string> {
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

    return result.response.text();
  }
}
