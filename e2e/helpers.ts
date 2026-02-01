import { type Page } from "@playwright/test";

/** Mock all AI/API analysis endpoints so tests don't need a live backend. */
export async function mockApiRoutes(page: Page) {
  await page.route("**/api/mbti/analyze", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        summary: "You are an analytical and creative thinker.",
        strengths: ["Strategic thinking", "Independence"],
        weaknesses: ["Perfectionism"],
        career: ["Software Engineer", "Scientist"],
      }),
    })
  );

  await page.route("**/api/tarot/analyze", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        overview: "The cards reveal a period of transformation.",
        cards: [{ interpretation: "New beginnings await." }],
        advice: "Stay open to change.",
      }),
    })
  );

  await page.route("**/api/i-ching/analyze", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        interpretation: "A time of great progress.",
        advice: "Move forward with confidence.",
      }),
    })
  );

  await page.route("**/api/four-pillars/analyze", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        overview: "Strong Wood element dominates your chart.",
        personality: "Creative and growth-oriented.",
      }),
    })
  );

  await page.route("**/api/zodiac/reading", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        overview: "Today brings opportunities for connection.",
        love: "Romance is in the air.",
        career: "Focus on your goals.",
        health: "Take time to rest.",
      }),
    })
  );

  await page.route("**/api/zodiac/compatibility", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ score: 85, summary: "Great match!" }),
    })
  );

  await page.route("**/api/history", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([]),
    })
  );
}

/**
 * Check that no visible text on the page looks like an untranslated i18n key.
 * Keys typically look like "some.nested.key" or "namespace.key".
 */
export async function assertNoI18nKeys(page: Page) {
  const bodyText = await page.locator("body").innerText();
  // Match patterns like "word.word" or "word.word.word" that look like i18n keys
  // Exclude common false positives (URLs, versions, file extensions)
  const keyPattern = /\b[a-z][a-zA-Z]*\.[a-z][a-zA-Z]*(?:\.[a-z][a-zA-Z]*)+\b/g;
  const matches = bodyText.match(keyPattern) || [];
  // Filter out likely false positives
  const suspicious = matches.filter(
    (m) =>
      !m.includes("http") &&
      !m.match(/^\d/) &&
      !m.match(/\.(com|org|net|io|js|ts|css|html|json|png|jpg|svg)$/)
  );
  return suspicious;
}
