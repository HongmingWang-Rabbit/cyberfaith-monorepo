import { describe, it, expect } from "vitest";
import { createAIProvider } from "../factory";
import { OpenAIProvider } from "../openai-provider";

describe("createAIProvider", () => {
  it("creates an OpenAI provider", () => {
    const provider = createAIProvider({ provider: "openai", apiKey: "test-key" });
    expect(provider).toBeInstanceOf(OpenAIProvider);
  });

  it("creates an OpenAI provider with custom model", () => {
    const provider = createAIProvider({ provider: "openai", apiKey: "test-key", model: "gpt-4" });
    expect(provider).toBeInstanceOf(OpenAIProvider);
  });

  it("throws for anthropic provider (not yet implemented)", () => {
    expect(() => createAIProvider({ provider: "anthropic", apiKey: "key" })).toThrow("not yet implemented");
  });

  it("throws for google provider (not yet implemented)", () => {
    expect(() => createAIProvider({ provider: "google", apiKey: "key" })).toThrow("not yet implemented");
  });

  it("throws for unknown provider", () => {
    expect(() => createAIProvider({ provider: "unknown" as any, apiKey: "key" })).toThrow("Unknown AI provider");
  });
});
