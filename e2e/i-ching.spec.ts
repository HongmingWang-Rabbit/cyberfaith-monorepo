import { test, expect } from "@playwright/test";
import { mockApiRoutes } from "./helpers";

test.beforeEach(async ({ page }) => {
  await mockApiRoutes(page);
});

test.describe("I Ching", () => {
  test("landing page loads with cast button", async ({ page }) => {
    await page.goto("/en/i-ching");
    await expect(page.locator("h1")).toBeVisible();
    // Should have a cast button
    const castBtn = page.locator("button").filter({ hasText: /cast|throw|consult/i });
    await expect(castBtn).toBeVisible();
  });

  test("cast coins and navigate to result", async ({ page }) => {
    await page.goto("/en/i-ching");
    // Click cast button
    const castBtn = page.locator("button").filter({ hasText: /cast|throw|consult/i });
    await castBtn.click();

    // Wait for navigation to result (there's a 1200ms delay + Next.js routing)
    await page.waitForURL(/\/en\/i-ching\/result/, { timeout: 10000 });
    await expect(page).toHaveURL(/\/en\/i-ching\/result/);
  });

  test("result page shows hexagram", async ({ page }) => {
    // We need to set sessionStorage before navigation
    await page.goto("/en/i-ching");

    // Cast and go to result
    const castBtn = page.locator("button").filter({ hasText: /cast|throw|consult/i });
    await castBtn.click();
    await page.waitForURL(/\/en\/i-ching\/result/, { timeout: 10000 });

    // Should show hexagram number and name
    await expect(page.getByText(/Hexagram #\d+/i).first()).toBeVisible();
    // Should show hexagram display (the lines)
    await expect(page.locator("h1, h2").first()).toBeVisible();
  });
});
