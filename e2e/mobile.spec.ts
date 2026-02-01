import { test, expect } from "@playwright/test";
import { mockApiRoutes } from "./helpers";

test.beforeEach(async ({ page }) => {
  await mockApiRoutes(page);
});

test.describe("Mobile", () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test("home page has no horizontal overflow", async ({ page }) => {
    await page.goto("/en");
    await page.waitForLoadState("networkidle");
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1); // 1px tolerance
  });

  test("sidebar is hidden on mobile", async ({ page }) => {
    await page.goto("/en");
    const sidebar = page.locator("aside");
    await expect(sidebar).not.toBeVisible();
  });

  test("bottom nav is visible on mobile", async ({ page }) => {
    await page.goto("/en");
    // Bottom nav should be visible (md:hidden means visible on mobile)
    const bottomNav = page.locator("nav.md\\:hidden, nav").last();
    await expect(bottomNav).toBeVisible();
  });

  test("bottom nav navigation works", async ({ page }) => {
    await page.goto("/en");
    // Click tarot icon in bottom nav (the nav has first 5 items)
    const bottomNav = page.locator("nav").last();
    await bottomNav.locator('a[href*="/tarot"]').click();
    await expect(page).toHaveURL(/\/en\/tarot/);
  });

  test("MBTI test works on mobile", async ({ page }) => {
    await page.goto("/en/mbti/test");
    await expect(page.getByText(/Question 1 of 20/)).toBeVisible();
    // Answer first question
    await page.getByRole("button", { name: "Agree" }).first().click();
    await page.waitForTimeout(300);
    await expect(page.getByText(/Question 2 of 20/)).toBeVisible();
  });

  test("four pillars page has no horizontal overflow", async ({ page }) => {
    await page.goto("/en/four-pillars");
    await page.waitForLoadState("networkidle");
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
  });
});
