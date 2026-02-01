import { describe, it, expect, vi, beforeEach } from "vitest";
import { AnthropicProvider } from "../anthropic-provider";

const mockCreate = vi.fn().mockResolvedValue({
  content: [{ type: "text", text: "mocked anthropic response" }],
});

vi.mock("@anthropic-ai/sdk", () => ({
  default: vi.fn().mockImplementation(() => ({
    messages: { create: mockCreate },
  })),
}));

describe("AnthropicProvider", () => {
  let provider: AnthropicProvider;

  beforeEach(() => {
    vi.clearAllMocks();
    provider = new AnthropicProvider("test-api-key");
  });

  it("sends prompt as user message", async () => {
    await provider.generateCompletion("Hello world");
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        messages: [{ role: "user", content: "Hello world" }],
      })
    );
  });

  it("includes system prompt when provided", async () => {
    await provider.generateCompletion("Hello", { systemPrompt: "You are helpful" });
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        system: "You are helpful",
        messages: [{ role: "user", content: "Hello" }],
      })
    );
  });

  it("uses default max_tokens", async () => {
    await provider.generateCompletion("test");
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({ max_tokens: 2048 })
    );
  });

  it("passes custom maxTokens", async () => {
    await provider.generateCompletion("test", { maxTokens: 512 });
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({ max_tokens: 512 })
    );
  });

  it("returns the text content", async () => {
    const result = await provider.generateCompletion("test");
    expect(result).toBe("mocked anthropic response");
  });

  it("returns empty string for non-text content", async () => {
    mockCreate.mockResolvedValueOnce({ content: [{ type: "tool_use", id: "x" }] });
    const result = await provider.generateCompletion("test");
    expect(result).toBe("");
  });

  it("returns empty string for empty content", async () => {
    mockCreate.mockResolvedValueOnce({ content: [] });
    const result = await provider.generateCompletion("test");
    expect(result).toBe("");
  });

  it("propagates API errors", async () => {
    mockCreate.mockRejectedValueOnce(new Error("API error"));
    await expect(provider.generateCompletion("test")).rejects.toThrow("API error");
  });

  it("uses default model", () => {
    expect(provider).toBeInstanceOf(AnthropicProvider);
  });

  it("accepts custom model", () => {
    const custom = new AnthropicProvider("key", "claude-3-opus-20240229");
    expect(custom).toBeInstanceOf(AnthropicProvider);
  });
});
