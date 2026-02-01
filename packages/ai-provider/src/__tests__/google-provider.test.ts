import { describe, it, expect, vi, beforeEach } from "vitest";
import { GoogleProvider } from "../google-provider";

const mockGenerateContent = vi.fn().mockResolvedValue({
  response: { text: () => "mocked google response" },
});

const mockGetGenerativeModel = vi.fn().mockReturnValue({
  generateContent: mockGenerateContent,
});

vi.mock("@google/generative-ai", () => ({
  GoogleGenerativeAI: vi.fn().mockImplementation(() => ({
    getGenerativeModel: mockGetGenerativeModel,
  })),
}));

describe("GoogleProvider", () => {
  let provider: GoogleProvider;

  beforeEach(() => {
    vi.clearAllMocks();
    provider = new GoogleProvider("test-api-key");
  });

  it("sends prompt as user content", async () => {
    await provider.generateCompletion("Hello world");
    expect(mockGenerateContent).toHaveBeenCalledWith(
      expect.objectContaining({
        contents: [{ role: "user", parts: [{ text: "Hello world" }] }],
      })
    );
  });

  it("passes system instruction when provided", async () => {
    await provider.generateCompletion("Hello", { systemPrompt: "You are helpful" });
    expect(mockGetGenerativeModel).toHaveBeenCalledWith(
      expect.objectContaining({ systemInstruction: "You are helpful" })
    );
  });

  it("uses default generation config", async () => {
    await provider.generateCompletion("test");
    expect(mockGenerateContent).toHaveBeenCalledWith(
      expect.objectContaining({
        generationConfig: { maxOutputTokens: 2048, temperature: 0.7 },
      })
    );
  });

  it("passes custom maxTokens and temperature", async () => {
    await provider.generateCompletion("test", { maxTokens: 512, temperature: 0.5 });
    expect(mockGenerateContent).toHaveBeenCalledWith(
      expect.objectContaining({
        generationConfig: { maxOutputTokens: 512, temperature: 0.5 },
      })
    );
  });

  it("returns the text response", async () => {
    const result = await provider.generateCompletion("test");
    expect(result).toBe("mocked google response");
  });

  it("propagates API errors", async () => {
    mockGenerateContent.mockRejectedValueOnce(new Error("Google API error"));
    await expect(provider.generateCompletion("test")).rejects.toThrow("Google API error");
  });

  it("uses default model", () => {
    expect(provider).toBeInstanceOf(GoogleProvider);
  });

  it("accepts custom model", () => {
    const custom = new GoogleProvider("key", "gemini-1.5-pro");
    expect(custom).toBeInstanceOf(GoogleProvider);
  });
});
