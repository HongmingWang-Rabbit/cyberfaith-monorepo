/**
 * Fire-and-forget save of a reading to core-api for authenticated users.
 * Does not throw — failures are logged silently.
 */
export function saveReadingAsync(
  authHeader: string | null,
  type: "mbti" | "tarot" | "i-ching" | "four-pillars" | "zodiac",
  input: unknown,
  result: unknown,
  locale?: string | null
) {
  if (!authHeader) return;

  const coreApiUrl = process.env.CORE_API_URL || "http://localhost:4000";

  fetch(`${coreApiUrl}/readings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: authHeader,
    },
    body: JSON.stringify({ type, input, result, locale: locale || null }),
  }).catch((err) => {
    console.error(`[save-reading] Failed to save ${type} reading:`, err.message);
  });
}
