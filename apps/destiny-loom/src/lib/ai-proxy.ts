/**
 * Proxy AI requests to core-api instead of calling AI providers directly.
 */

const CORE_API_URL = process.env.CORE_API_URL || "http://localhost:4000";

export async function proxyToAI(
  endpoint: string,
  body: Record<string, unknown>,
  authHeader: string | null,
): Promise<{ data: any; error?: string; status?: number }> {
  try {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (authHeader) headers["Authorization"] = authHeader;

    const res = await fetch(`${CORE_API_URL}/ai/${endpoint}`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return { data: null, error: text || `AI service error: ${res.status}`, status: res.status };
    }

    return { data: await res.json() };
  } catch (err: any) {
    console.error(`AI proxy error (${endpoint}):`, err?.message);
    return { data: null, error: "AI service unavailable", status: 503 };
  }
}
