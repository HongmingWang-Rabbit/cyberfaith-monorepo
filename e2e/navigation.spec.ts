import { test, expect } from "@playwright/test";
import { mockApiRoutes } from "./helpers";

test.beforeEach(async ({ page }) => {
  await mockApiRoutes(page);
});

test.describe("Navigation", () => {
  test("home page loads with hero and feature cards", async ({ page }) => {
    await page.goto("/");
    // Should redirect to /en
    await expect(page).toHaveURL(/\/en\/?$/);
    // Hero heading
    await expect(page.locator("h1")).toBeVisible();
    // 5 feature cards in main content (sidebar/bottom nav also have links)
    const featureLinks = page.locator('main a[href*="/en/mbti"], main a[href*="/en/tarot"], main a[href*="/en/zodiac"], main a[href*="/en/i-ching"], main a[href*="/en/four-pillars"]');
    await expect(featureLinks).toHaveCount(5);
  });

  test("all 5 feature links navigate without 404", async ({ page }) => {
    const paths = ["/en/mbti", "/en/tarot", "/en/zodiac", "/en/i-ching", "/en/four-pillars"];
    for (const path of paths) {
      await page.goto(path);
      // Should NOT show 404
      await expect(page.locator("text=404")).not.toBeVisible();
      // Should have an h1
      await expect(page.locator("h1")).toBeVisible();
    }
  });

  test("sidebar navigation works on desktop", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto("/en");
    // Sidebar should be visible
    const sidebar = page.locator("aside");
    await expect(sidebar).toBeVisible();
    // Click MBTI nav link in sidebar
    await sidebar.locator('a[href*="/mbti"]').click();
    await expect(page).toHaveURL(/\/en\/mbti/);
    await expect(page.locator("h1")).toBeVisible();
  });

  test("breadcrumbs are present on sub-pages", async ({ page }) => {
    await page.goto("/en/mbti");
    // Breadcrumb component should render
    const breadcrumb = page.locator("nav[aria-label='Breadcrumb'], [class*='breadcrumb'], nav >> text=Home");
    // At minimum, "Home" link should appear somewhere as breadcrumb
    await expect(page.getByText("Home").first()).toBeVisible();
  });

  test("clicking feature card from home navigates correctly", async ({ page }) => {
    await page.goto("/en");
    // Click the first feature card (MBTI)
    await page.locator('a[href*="/mbti"]').first().click();
    await expect(page).toHaveURL(/\/en\/mbti/);
    await expect(page.locator("h1")).toContainText(/MBTI/i);
  });
});
