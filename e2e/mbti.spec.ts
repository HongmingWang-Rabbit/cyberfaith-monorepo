import { test, expect } from "@playwright/test";
import { mockApiRoutes } from "./helpers";

test.beforeEach(async ({ page }) => {
  await mockApiRoutes(page);
});

test.describe("MBTI", () => {
  test("navigate to MBTI and start test", async ({ page }) => {
    await page.goto("/en/mbti");
    await expect(page.locator("h1")).toContainText(/MBTI/i);
    // Click "Start the Test" button — it's a Link wrapping a Button
    await page.getByRole("link", { name: /start the test/i }).click();
    await expect(page).toHaveURL(/\/en\/mbti\/test/, { timeout: 10000 });
  });

  test("answer all 20 questions and see result", async ({ page }) => {
    await page.goto("/en/mbti/test");
    // Should show question 1 of 20
    await expect(page.getByText(/Question 1 of 20/)).toBeVisible();

    // Answer all 20 questions by clicking "Agree" each time
    for (let i = 0; i < 20; i++) {
      await expect(page.getByText(`Question ${i + 1} of 20`)).toBeVisible();
      await page.getByRole("button", { name: "Agree" }).first().click();
      await page.waitForTimeout(300);
    }

    // Should navigate to result page
    await expect(page).toHaveURL(/\/en\/mbti\/result/);
    await expect(page.locator("h1")).toBeVisible();
    const h1Text = await page.locator("h1").innerText();
    expect(h1Text).toMatch(/^[EINS][SNTF][TFNS][JPEI]{0,4}/);
  });

  test("result page has share buttons", async ({ page }) => {
    await page.goto("/en/mbti/result?type=INTJ&scores=%7B%22EI%22%3A-3%2C%22SN%22%3A-2%2C%22TF%22%3A2%2C%22JP%22%3A3%7D");
    // Should display INTJ in the heading
    await expect(page.getByRole("heading", { name: "INTJ" })).toBeVisible();
    // Share buttons should exist
    await expect(page.locator('[class*="share"], button:has-text("Share"), button:has-text("Copy")').first()).toBeVisible();
  });

  test("result page shows dimension breakdown", async ({ page }) => {
    await page.goto("/en/mbti/result?type=ENFP&scores=%7B%22EI%22%3A4%2C%22SN%22%3A-3%2C%22TF%22%3A-2%2C%22JP%22%3A-4%7D");
    await expect(page.getByRole("heading", { name: "ENFP" })).toBeVisible();
    // Should show dimension labels
    await expect(page.getByText(/E \(/).first()).toBeVisible();
    await expect(page.getByText(/I \(/).first()).toBeVisible();
  });
});
