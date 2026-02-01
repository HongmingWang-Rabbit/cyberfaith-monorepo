import { test, expect } from "@playwright/test";
import { mockApiRoutes } from "./helpers";

test.beforeEach(async ({ page }) => {
  await mockApiRoutes(page);
});

test.describe("Zodiac", () => {
  test("zodiac page shows all 12 signs", async ({ page }) => {
    await page.goto("/en/zodiac");
    await expect(page.locator("h1")).toBeVisible();
    // Should show 12 zodiac sign cards
    const signCards = page.locator('a[href*="/zodiac/"]');
    await expect(signCards).toHaveCount(12);
  });

  test("click a sign and see detail page", async ({ page }) => {
    await page.goto("/en/zodiac");
    // Click Aries (first sign)
    await page.locator('a[href*="/zodiac/aries"]').click();
    await expect(page).toHaveURL(/\/en\/zodiac\/aries/);
    // Should show sign name and symbol
    await expect(page.getByRole("heading", { name: "Aries" })).toBeVisible();
  });

  test("zodiac detail page has period tabs", async ({ page }) => {
    await page.goto("/en/zodiac/aries");
    // Should have daily/weekly/monthly tabs
    const dailyTab = page.getByRole("button", { name: /daily/i });
    const weeklyTab = page.getByRole("button", { name: /weekly/i });
    const monthlyTab = page.getByRole("button", { name: /monthly/i });
    await expect(dailyTab).toBeVisible();
    await expect(weeklyTab).toBeVisible();
    await expect(monthlyTab).toBeVisible();

    // Click weekly tab
    await weeklyTab.click();
    // Tab should be active (has primary bg class)
    await expect(weeklyTab).toHaveClass(/bg-primary/);
  });

  test("zodiac detail shows traits and compatibility", async ({ page }) => {
    await page.goto("/en/zodiac/aries");
    // Should show traits
    await expect(page.getByText(/traits/i).first()).toBeVisible();
    // Should show compatible signs section
    await expect(page.getByText(/compatible/i).first()).toBeVisible();
  });
});
