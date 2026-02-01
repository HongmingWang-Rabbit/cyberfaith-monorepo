import { test, expect } from "@playwright/test";
import { mockApiRoutes } from "./helpers";

test.beforeEach(async ({ page }) => {
  await mockApiRoutes(page);
});

test.describe("Error Handling", () => {
  test("404 page renders for unknown routes", async ({ page }) => {
    await page.goto("/en/this-page-does-not-exist");
    // Should show 404 text
    await expect(page.getByText("404")).toBeVisible();
  });

  test("404 page renders for nested unknown routes", async ({ page }) => {
    await page.goto("/en/zodiac/not-a-real-sign");
    // The zodiac sign page calls notFound() for invalid signs
    await expect(page.getByText("404").or(page.getByText(/not found/i))).toBeVisible();
  });

  test("AI analysis error is handled gracefully", async ({ page }) => {
    // Override the mbti analyze mock to return an error
    await page.route("**/api/mbti/analyze", (route) =>
      route.fulfill({ status: 500, body: JSON.stringify({ message: "Server error" }) })
    );

    await page.goto("/en/mbti/result?type=INTJ&scores=%7B%22EI%22%3A-3%2C%22SN%22%3A-2%2C%22TF%22%3A2%2C%22JP%22%3A3%7D");
    // Should still show the type
    await expect(page.getByRole("heading", { name: "INTJ" })).toBeVisible();
    // Should show error or retry option for AI analysis (not crash)
    // The AiAnalysisCard shows error state with retry button
    await expect(page.getByText(/retry|error|unavailable/i).first()).toBeVisible({ timeout: 10000 });
  });
});
