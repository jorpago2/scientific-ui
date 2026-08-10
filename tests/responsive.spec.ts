import { expect, test } from "@playwright/test";

const widths = [320, 375, 414, 768, 1024, 1440];

for (const width of widths) {
  test(`workbench remains usable at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: width < 600 ? 844 : 900 });
    await page.goto("/");
    await expect(page.getByRole("link", { name: "Scientific UI" })).toBeVisible();
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

test("inspector traps focus, closes with Escape and restores the trigger", async ({ page }) => {
  await page.goto("/");
  const trigger = page.getByRole("button", { name: "Inspect" });
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "Result inspector" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("button", { name: "Apply" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
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
  for (const [width, expected] of [[390, 390], [768, 768], [1024, 1024], [1440, 256]] as const) {
    await page.setViewportSize({ width, height: 900 });
    const box = await navigation.boundingBox();
    expect(Math.abs(Math.round(box?.width ?? 0) - expected), `navigation width at ${width}px: ${box?.width}px`).toBeLessThanOrEqual(1);
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
      if (width < 1056) expect(alignment?.delta ?? Number.POSITIVE_INFINITY).toBeLessThanOrEqual(2);
    }
  }
});

test("desktop tool rail follows Carbon left-panel geometry", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const navigation = page.getByRole("navigation", { name: "Scientific tools" });
  const configure = navigation.getByRole("button", { name: "Configure" });
  const geometry = await configure.evaluate((element) => {
    const button = element.getBoundingClientRect();
    const icon = element.querySelector(".scientific-tool-rail__icon")?.getBoundingClientRect();
    const label = element.querySelector(".scientific-tool-rail__label");
    const labelBox = label?.getBoundingClientRect();
    const labelStyle = label ? getComputedStyle(label) : null;
    return {
      height: button.height,
      iconSize: icon?.width ?? 0,
      contentCenterDelta: icon && labelBox
        ? Math.abs(button.left + button.width / 2 - (icon.left + labelBox.right) / 2)
        : Number.POSITIVE_INFINITY,
      fontSize: labelStyle?.fontSize,
      fontWeight: labelStyle?.fontWeight,
      background: getComputedStyle(element).backgroundColor,
    };
  });
  expect(geometry.height).toBe(32);
  expect(geometry.iconSize).toBe(16);
  expect(geometry.contentCenterDelta).toBeLessThanOrEqual(2);
  expect(geometry.fontSize).toBe("14px");
  expect(Number(geometry.fontWeight)).toBeGreaterThanOrEqual(600);
  expect(geometry.background).not.toBe("rgba(0, 0, 0, 0)");
  await expect(configure).toHaveAttribute("aria-current", "page");
});

test("application header follows Carbon UI shell geometry", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const header = page.locator(".scientific-header");
  await expect(header).toHaveJSProperty("tagName", "HEADER");
  await expect(header).toHaveCSS("min-height", "48px");
  await expect(header).toHaveCSS("border-bottom-width", "1px");
  await page.setViewportSize({ width: 390, height: 844 });
  const contextOffset = await page.locator(".scientific-header__context").evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return Math.abs(rect.left + rect.width / 2 - window.innerWidth / 2);
  });
  expect(contextOffset).toBeLessThanOrEqual(1);
});

test("task panel owns consistent Carbon surface, heading and scrolling", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const panel = page.locator("#fixture-panel");
  const heading = panel.locator(".scientific-task-panel__header");
  const body = panel.locator(".scientific-task-panel__body");
  const desktopPanelWidth = (await panel.boundingBox())?.width ?? 0;
  expect(desktopPanelWidth).toBeGreaterThanOrEqual(360);
  expect(desktopPanelWidth).toBeLessThanOrEqual(400);
  await expect(heading).toHaveCSS("min-height", "72px");
  await expect(heading).toHaveCSS("padding", "16px");
  await expect(body).toHaveCSS("overflow-y", "auto");
  await expect(panel).toHaveCSS("border-right-width", "1px");

  await page.setViewportSize({ width: 390, height: 844 });
  expect(Math.abs(((await panel.boundingBox())?.width ?? 0) - 390)).toBeLessThanOrEqual(2);
  expect(Math.round((await heading.evaluate((element) => element.getBoundingClientRect().height)))).toBe(72);
  await expect(page.locator("#hidden-fixture-panel")).toBeHidden();
  const close = panel.getByRole("button", { name: "Close panel" });
  await close.click();
  await expect(panel).toBeHidden();
});

test("mobile panels use the safe workspace above bottom navigation", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.evaluate(() => document.documentElement.style.setProperty("--scientific-ui-safe-area-bottom", "24px"));

  const navigation = page.getByRole("navigation", { name: "Scientific tools" });
  const workbench = page.locator(".scientific-workbench");
  const status = page.locator(".scientific-status-bar");
  const stage = page.locator(".scientific-workbench__stage");

  expect(Math.round((await navigation.boundingBox())?.height ?? 0)).toBe(80);
  expect(Math.round((await workbench.boundingBox())?.height ?? 0)).toBe(716);
  await expect(status).toBeHidden();
  await expect(stage).toBeHidden();

  await page.locator("#fixture-panel").getByRole("button", { name: "Close panel" }).click();
  await expect(status).toBeVisible();
  await expect(stage).toBeVisible();
  expect(Math.round((await workbench.boundingBox())?.height ?? 0)).toBe(676);
});

test("tablet panels occupy the full workbench without a preview row", async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 900 });
  await page.goto("/");

  const workbench = page.locator(".scientific-workbench");
  const panel = page.locator("#fixture-panel");
  const stage = page.locator(".scientific-workbench__stage");
  const status = page.locator(".scientific-status-bar");

  await expect(stage).toBeHidden();
  await expect(status).toBeHidden();
  expect(Math.round((await workbench.boundingBox())?.height ?? 0)).toBe(796);
  expect(Math.abs(((await panel.boundingBox())?.height ?? 0) - ((await workbench.boundingBox())?.height ?? 0))).toBeLessThanOrEqual(1);
});
