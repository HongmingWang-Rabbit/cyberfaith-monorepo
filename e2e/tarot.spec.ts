import { test, expect } from "@playwright/test";
import { mockApiRoutes } from "./helpers";

test.beforeEach(async ({ page }) => {
  await mockApiRoutes(page);
});

test.describe("Tarot", () => {
  test("tarot landing shows spread options", async ({ page }) => {
    await page.goto("/en/tarot");
    await expect(page.locator("h1")).toBeVisible();
    // Should show spread options (single, three-card, celtic-cross)
    await expect(page.getByText("Single Card")).toBeVisible();
    await expect(page.getByText("Three Card")).toBeVisible();
    await expect(page.getByText("Celtic Cross")).toBeVisible();
  });

  test("select single spread and draw a card", async ({ page }) => {
    await page.goto("/en/tarot");
    // Click single card spread link
    await page.getByText("Single Card").click();
    await expect(page).toHaveURL(/\/en\/tarot\/reading/, { timeout: 10000 });

    // Should show instruction to select cards
    await expect(page.getByText(/select|choose|pick|tap/i).first()).toBeVisible();

    // Click on a card
    const cards = page.locator('[class*="cursor-pointer"]').first();
    await cards.click();

    // After selecting required number of cards, confirm button should appear
    const confirmBtn = page.getByRole("button", { name: /view|reading|confirm|reveal/i });
    await expect(confirmBtn).toBeVisible({ timeout: 5000 });
    await confirmBtn.click();

    // Should navigate to result
    await expect(page).toHaveURL(/\/en\/tarot\/result/, { timeout: 10000 });
  });

  test("tarot result page shows cards", async ({ page }) => {
    const cards = encodeURIComponent(
      JSON.stringify([{ id: 0, reversed: false, position: "Present", positionZh: "现在" }])
    );
    await page.goto(`/en/tarot/result?spread=single&cards=${cards}`);
    await expect(page.locator("h1")).toBeVisible();
    // Should show card details (position name) — use .first() for strict mode
    await expect(page.getByText("Present").first()).toBeVisible();
  });
});
