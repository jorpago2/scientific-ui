import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("fixture has no automatically detectable WCAG A/AA violations", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
  expect(results.violations).toEqual([]);
});
