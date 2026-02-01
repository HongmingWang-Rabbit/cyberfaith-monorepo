import { NextRequest, NextResponse } from "next/server";

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
    .slice(0, maxLength)
    .replace(/<[^>]*>/g, "") // strip HTML tags
    .replace(/[<>{}[\]\\]/g, "") // strip injection chars
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
