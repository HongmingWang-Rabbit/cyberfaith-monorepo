import { test, expect } from "@playwright/test";
import { mockApiRoutes } from "./helpers";

test.beforeEach(async ({ page }) => {
  await mockApiRoutes(page);
});

test.describe("Four Pillars", () => {
  test("landing page loads with birth date form", async ({ page }) => {
    await page.goto("/en/four-pillars");
    await expect(page.locator("h1")).toBeVisible();
    // Should have year, month, day, hour selects
    await expect(page.locator("#fp-year")).toBeVisible();
    await expect(page.locator("#fp-month")).toBeVisible();
    await expect(page.locator("#fp-day")).toBeVisible();
    await expect(page.locator("#fp-hour")).toBeVisible();
  });

  test("enter birth date and calculate", async ({ page }) => {
    await page.goto("/en/four-pillars");

    // Select birth details
    await page.locator("#fp-year").selectOption("1990");
    await page.locator("#fp-month").selectOption("6");
    await page.locator("#fp-day").selectOption("15");
    await page.locator("#fp-hour").selectOption("8");

    // Click calculate button
    await page.locator("button").filter({ hasText: /calculate|analyze|submit/i }).click();

    // Should navigate to result (router.push is async)
    await expect(page).toHaveURL(/\/en\/four-pillars\/result/, { timeout: 10000 });
  });

  test("result page shows four pillars", async ({ page }) => {
    await page.goto("/en/four-pillars/result?year=1990&month=6&day=15&hour=8&gender=male");
    // Should show the four pillars (year, month, day, hour)
    await expect(page.locator("h1")).toBeVisible();
    // Should show Chinese characters for stems/branches
    const pillars = page.locator('[class*="grid-cols-4"]');
    await expect(pillars).toBeVisible();
    // Should show five elements section
    await expect(page.getByText(/element/i).first()).toBeVisible();
  });

  test("gender selection works", async ({ page }) => {
    await page.goto("/en/four-pillars");
    // Click "Female" gender button
    const femaleBtn = page.getByRole("radio", { name: /female/i });
    await femaleBtn.click();
    await expect(femaleBtn).toHaveAttribute("aria-checked", "true");
  });
});
