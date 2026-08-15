import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const expectAccessible = async (page: Page) => {
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
  expect(results.violations).toEqual([]);
};

test("light desktop shell is accessible", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await expectAccessible(page);
});

test("dark mobile shell and open Help are accessible", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/?theme=dark");
  await page.getByRole("button", { name: "Help" }).click();
  await expectAccessible(page);
});

test("open inspector is modal and accessible", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page.getByRole("button", { name: "Inspect" }).click();
  await expect(page.getByRole("dialog", { name: "Result inspector" })).toBeVisible();
  await expectAccessible(page);
});

test("recovery and open mobile panel are accessible together", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/?recovery=1");
  await expect(page.getByRole("complementary", { name: "Session recovery" })).toBeVisible();
  await expectAccessible(page);
});
