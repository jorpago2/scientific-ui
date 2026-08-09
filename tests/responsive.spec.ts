import { expect, test } from "@playwright/test";

const widths = [320, 375, 414, 768, 1024, 1440];

for (const width of widths) {
  test(`workbench remains usable at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: width < 600 ? 844 : 900 });
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1, name: "Scientific UI" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Run model" }).first()).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
    for (const button of await page.getByRole("navigation", { name: "Scientific workflow" }).getByRole("button").all()) {
      const box = await button.boundingBox();
      expect(box?.height ?? 0).toBeGreaterThanOrEqual(width <= 768 ? 44 : 24);
    }
  });
}

test("announces and updates simulation state", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Run model" }).first().click();
  await expect(page.getByText("Simulation running").first()).toBeVisible();
  await expect(page.getByRole("button", { name: "Stop" })).toBeVisible();
});
