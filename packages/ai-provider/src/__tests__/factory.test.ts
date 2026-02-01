import { describe, it, expect } from "vitest";
import { createAIProvider } from "../factory";
import { OpenAIProvider } from "../openai-provider";
import { AnthropicProvider } from "../anthropic-provider";
import { GoogleProvider } from "../google-provider";

describe("createAIProvider", () => {
  it("creates an OpenAI provider", () => {
    const provider = createAIProvider({ provider: "openai", apiKey: "test-key" });
    expect(provider).toBeInstanceOf(OpenAIProvider);
  });

  it("creates an OpenAI provider with custom model", () => {
    const provider = createAIProvider({ provider: "openai", apiKey: "test-key", model: "gpt-4" });
    expect(provider).toBeInstanceOf(OpenAIProvider);
  });

  it("creates an Anthropic provider", () => {
    const provider = createAIProvider({ provider: "anthropic", apiKey: "test-key" });
    expect(provider).toBeInstanceOf(AnthropicProvider);
  });

  it("creates a Google provider", () => {
    const provider = createAIProvider({ provider: "google", apiKey: "test-key" });
    expect(provider).toBeInstanceOf(GoogleProvider);
  });

  it("throws for unknown provider", () => {
    expect(() => createAIProvider({ provider: "unknown" as any, apiKey: "key" })).toThrow("Unknown AI provider");
  });
});
