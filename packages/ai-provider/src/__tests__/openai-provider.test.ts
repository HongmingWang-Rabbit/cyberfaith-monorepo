import { describe, it, expect, vi, beforeEach } from "vitest";
import { OpenAIProvider } from "../openai-provider";

// Mock the OpenAI module
vi.mock("openai", () => {
  const mockCreate = vi.fn().mockResolvedValue({
    choices: [{ message: { content: "mocked response" } }],
  });
  return {
    default: vi.fn().mockImplementation(() => ({
      chat: { completions: { create: mockCreate } },
    })),
    __mockCreate: mockCreate,
  };
});

describe("OpenAIProvider", () => {
  let provider: OpenAIProvider;
  let mockCreate: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    vi.clearAllMocks();
    const openaiModule = await import("openai");
    mockCreate = (openaiModule as any).__mockCreate;
    provider = new OpenAIProvider("test-api-key", "gpt-4o-mini");
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
        messages: [
          { role: "system", content: "You are helpful" },
          { role: "user", content: "Hello" },
        ],
      })
    );
  });

  it("passes model correctly", async () => {
    await provider.generateCompletion("test");
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({ model: "gpt-4o-mini" })
    );
  });

  it("uses default maxTokens and temperature", async () => {
    await provider.generateCompletion("test");
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({ max_tokens: 2048, temperature: 0.7 })
    );
  });

  it("passes custom maxTokens and temperature", async () => {
    await provider.generateCompletion("test", { maxTokens: 512, temperature: 0.5 });
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({ max_tokens: 512, temperature: 0.5 })
    );
  });

  it("returns the content from the response", async () => {
    const result = await provider.generateCompletion("test");
    expect(result).toBe("mocked response");
  });

  it("returns empty string when no content in response", async () => {
    mockCreate.mockResolvedValueOnce({ choices: [{ message: { content: null } }] });
    const result = await provider.generateCompletion("test");
    expect(result).toBe("");
  });

  it("returns empty string when choices array is empty", async () => {
    mockCreate.mockResolvedValueOnce({ choices: [] });
    const result = await provider.generateCompletion("test");
    expect(result).toBe("");
  });

  it("propagates API errors", async () => {
    mockCreate.mockRejectedValueOnce(new Error("API rate limit exceeded"));
    await expect(provider.generateCompletion("test")).rejects.toThrow("API rate limit exceeded");
  });

  it("uses default model when none specified", () => {
    const defaultProvider = new OpenAIProvider("key");
    // Just verify it instantiates without error
    expect(defaultProvider).toBeInstanceOf(OpenAIProvider);
  });
});
