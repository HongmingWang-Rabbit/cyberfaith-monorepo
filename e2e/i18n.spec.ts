import { test, expect } from "@playwright/test";
import { mockApiRoutes, assertNoI18nKeys } from "./helpers";

test.beforeEach(async ({ page }) => {
  await mockApiRoutes(page);
});

test.describe("i18n", () => {
  test("default locale is English", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/en\/?$/);
    // Title should be in English (use .first() since sidebar + header both show it)
    await expect(page.getByText("Destiny Loom").first()).toBeVisible();
  });

  test("switch to Chinese and text changes", async ({ page }) => {
    await page.goto("/en");
    // The locale switcher button shows the OTHER language name
    const switcher = page.locator("button").filter({ hasText: "中文" });
    await expect(switcher).toBeVisible();
    await switcher.click();

    // Should now be on /zh
    await expect(page).toHaveURL(/\/zh\/?$/);
    // Page content should be in Chinese
    await expect(page.getByText("命运织机").first()).toBeVisible();
    // Switcher should now show "English"
    await expect(page.locator("button").filter({ hasText: "English" })).toBeVisible();
  });

  test("switch back to English from Chinese", async ({ page }) => {
    await page.goto("/zh");
    const switcher = page.locator("button").filter({ hasText: "English" });
    await expect(switcher).toBeVisible();
    await switcher.click();
    await expect(page).toHaveURL(/\/en\/?$/);
  });

  test("no missing i18n keys on home page (EN)", async ({ page }) => {
    await page.goto("/en");
    await page.waitForLoadState("networkidle");
    const suspicious = await assertNoI18nKeys(page);
    const realKeys = suspicious.filter((s) => s.match(/^(common|home|mbti|tarot|zodiac|iching|fourPillars|results)\./));
    expect(realKeys).toHaveLength(0);
  });

  test("no missing i18n keys on home page (ZH)", async ({ page }) => {
    await page.goto("/zh");
    await page.waitForLoadState("networkidle");
    const suspicious = await assertNoI18nKeys(page);
    const realKeys = suspicious.filter((s) => s.match(/^(common|home|mbti|tarot|zodiac|iching|fourPillars|results)\./));
    expect(realKeys).toHaveLength(0);
  });

  test("feature pages work in Chinese", async ({ page }) => {
    const paths = ["/zh/mbti", "/zh/tarot", "/zh/zodiac", "/zh/i-ching", "/zh/four-pillars"];
    for (const path of paths) {
      await page.goto(path);
      await expect(page.locator("text=404")).not.toBeVisible();
      await expect(page.locator("h1")).toBeVisible();
    }
  });
});
