import { NextRequest, NextResponse } from "next/server";
import { createAIProvider, type AIProvider } from "@cyberfaith/ai-provider";
import { getTierConfig, type TierAIConfig } from "./ai-tier-config";

/**
 * Get AI provider from env. Defaults to OpenAI gpt-4o-mini (cheapest).
 * Set AI_PROVIDER=anthropic|google and AI_MODEL to override.
 * Each provider reads its own key: OPENAI_API_KEY, ANTHROPIC_API_KEY, GOOGLE_AI_API_KEY
 */
export function getAIProvider(tier?: string): { provider: AIProvider | null; unavailableResponse: NextResponse | null; tierConfig: TierAIConfig } {
  const tierConfig = getTierConfig(tier || "free");
  const providerName = tierConfig.provider;
  const keyMap: Record<string, string | undefined> = {
    openai: process.env.OPENAI_API_KEY,
    anthropic: process.env.ANTHROPIC_API_KEY,
    google: process.env.GOOGLE_AI_API_KEY,
  };
  const apiKey = keyMap[providerName];
  if (!apiKey) {
    return { provider: null, unavailableResponse: NextResponse.json({ analysis: null, message: "AI analysis unavailable — no API key configured" }), tierConfig };
  }
  return { provider: createAIProvider({ provider: providerName, apiKey, model: tierConfig.model }), unavailableResponse: null, tierConfig };
}

/**
 * Resolve the user's subscription tier from core-api via JWT token.
 * Returns "free" if unauthenticated or on error.
 */
export async function getUserTier(authHeader: string | null): Promise<string> {
  if (!authHeader) return "free";
  try {
    const coreApiUrl = process.env.CORE_API_URL || "http://localhost:4000";
    const res = await fetch(`${coreApiUrl}/users/me`, {
      headers: { Authorization: authHeader },
    });
    if (!res.ok) return "free";
    const data = await res.json();
    return data?.subscriptionTier || data?.data?.subscriptionTier || "free";
  } catch {
    return "free";
  }
}

/**
 * Consistent error response format for all API endpoints
 */
export function errorResponse(error: string, status: number, details?: string): NextResponse {
  const body: { error: string; details?: string } = { error };
  if (details) body.details = details;
  return NextResponse.json(body, { status });
}

/**
 * Add rate limiting headers to a response (placeholder values for now)
 */
export function withRateLimitHeaders(response: NextResponse): NextResponse {
  response.headers.set("X-RateLimit-Limit", "100");
  response.headers.set("X-RateLimit-Remaining", "99");
  response.headers.set("X-RateLimit-Reset", String(Math.floor(Date.now() / 1000) + 3600));
  return response;
}

/**
 * Parse and validate JSON body with size limit
 */
export async function parseBody<T = any>(
  request: NextRequest,
  maxSizeBytes = 10_000
): Promise<{ data?: T; error?: NextResponse }> {
  try {
    const contentLength = request.headers.get("content-length");
    if (contentLength && parseInt(contentLength, 10) > maxSizeBytes) {
      return { error: errorResponse("Request body too large", 413, `Maximum size is ${maxSizeBytes} bytes`) };
    }

    const text = await request.text();
    if (text.length > maxSizeBytes) {
      return { error: errorResponse("Request body too large", 413, `Maximum size is ${maxSizeBytes} bytes`) };
    }

    if (!text) {
      return { data: {} as T };
    }

    const data = JSON.parse(text) as T;
    return { data };
  } catch {
    return { error: errorResponse("Invalid JSON body", 400) };
  }
}

/**
 * Sanitize user-supplied string: strip HTML, limit length
 */
export function sanitizeString(input: string, maxLength = 500): string {
  return input
    .replace(/[\u200B-\u200F\u2028-\u202F\uFEFF\u00AD]/g, "") // strip zero-width & invisible chars
    .slice(0, maxLength)
    .replace(/<[^>]*>/g, "") // strip HTML tags
    .replace(/[<>{}[\]\\]/g, "") // strip injection chars
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
