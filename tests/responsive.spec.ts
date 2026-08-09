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
    for (const button of await page.getByRole("navigation", { name: "Scientific tools" }).getByRole("button").all()) {
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

test("tool rail toggles, restores focus and supports directional keys", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const navigation = page.getByRole("navigation", { name: "Scientific tools" });
  const configure = navigation.getByRole("button", { name: "Configure" });
  const results = navigation.getByRole("button", { name: "Results" });
  await expect(configure).toHaveAttribute("aria-expanded", "true");
  await configure.click();
  await expect(configure).toHaveAttribute("aria-expanded", "false");
  await results.click();
  await expect(results).toHaveAttribute("aria-expanded", "true");
  await results.press("Escape");
  await expect(results).toHaveAttribute("aria-expanded", "false");
  await configure.focus();
  await configure.press("ArrowDown");
  await expect(results).toBeFocused();
});

test("tool rail uses common responsive geometry", async ({ page }) => {
  await page.goto("/");
  const navigation = page.getByRole("navigation", { name: "Scientific tools" });
  for (const [width, expected] of [[390, 390], [768, 768], [1024, 1024], [1440, 160]] as const) {
    await page.setViewportSize({ width, height: 900 });
    const box = await navigation.boundingBox();
    expect(Math.abs(Math.round(box?.width ?? 0) - expected)).toBeLessThanOrEqual(1);
    for (const button of await navigation.getByRole("button").all()) {
      const alignment = await button.evaluate((element) => {
        const buttonBox = element.getBoundingClientRect();
        const iconBox = element.querySelector(".scientific-tool-rail__icon")?.getBoundingClientRect();
        const label = element.querySelector(".scientific-tool-rail__label");
        const labelBox = label?.getBoundingClientRect();
        if (!labelBox || !label) return null;
        const parts = iconBox ? [iconBox, labelBox] : [labelBox];
        const contentCenter = (Math.min(...parts.map((part) => part.left)) + Math.max(...parts.map((part) => part.right))) / 2;
        return {
          delta: Math.abs(buttonBox.left + buttonBox.width / 2 - contentCenter),
          visible: getComputedStyle(label).visibility === "visible",
        };
      });
      expect(alignment?.visible).toBe(true);
      expect(alignment?.delta ?? Number.POSITIVE_INFINITY).toBeLessThan(0.1);
    }
  }
});
