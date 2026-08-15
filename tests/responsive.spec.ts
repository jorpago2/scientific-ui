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
          iconDelta: iconBox ? Math.abs(buttonBox.left + buttonBox.width / 2 - (iconBox.left + iconBox.width / 2)) : 0,
          labelDelta: Math.abs(buttonBox.left + buttonBox.width / 2 - (labelBox.left + labelBox.width / 2)),
          axisDelta: iconBox ? Math.abs((iconBox.left + iconBox.width / 2) - (labelBox.left + labelBox.width / 2)) : 0,
          visible: getComputedStyle(label).visibility === "visible",
        };
      });
      expect(alignment?.visible).toBe(true);
      if (width < 1056) {
        expect(alignment?.delta ?? Number.POSITIVE_INFINITY).toBeLessThanOrEqual(1);
        expect(alignment?.iconDelta ?? Number.POSITIVE_INFINITY).toBeLessThanOrEqual(1);
        expect(alignment?.labelDelta ?? Number.POSITIVE_INFINITY).toBeLessThanOrEqual(1);
        expect(alignment?.axisDelta ?? Number.POSITIVE_INFINITY).toBeLessThanOrEqual(1);
      }
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
      contentInset: icon ? icon.left - button.left : Number.POSITIVE_INFINITY,
      contentGap: icon && labelBox ? labelBox.left - icon.right : Number.POSITIVE_INFINITY,
      fontSize: labelStyle?.fontSize,
      fontWeight: labelStyle?.fontWeight,
      background: getComputedStyle(element).backgroundColor,
    };
  });
  expect(geometry.height).toBe(32);
  expect(geometry.iconSize).toBe(16);
  expect(geometry.contentInset).toBe(20);
  expect(geometry.contentGap).toBe(24);
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
  const tracks = await header.evaluate((element) => {
    const brand = element.querySelector(".scientific-header__brand")?.getBoundingClientRect();
    const context = element.querySelector(".scientific-header__context")?.getBoundingClientRect();
    const actions = element.querySelector(".scientific-header__actions")?.getBoundingClientRect();
    return { brandRight: brand?.right ?? 0, contextLeft: context?.left ?? 0, contextRight: context?.right ?? 0, actionsLeft: actions?.left ?? 0 };
  });
  expect(tracks.contextLeft).toBeGreaterThanOrEqual(tracks.brandRight - 1);
  expect(tracks.contextRight).toBeLessThanOrEqual(tracks.actionsLeft + 1);
});

test("header Help is the terminal Carbon action and supports keyboard toggling", async ({ page }) => {
  await page.goto("/");
  const header = page.locator(".scientific-header");
  const help = header.getByRole("button", { name: "Help" });
  for (const width of [320, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: width < 600 ? 844 : 900 });
    await expect(help).toBeVisible();
    const geometry = await header.evaluate((element) => {
      const actions = element.querySelector(".scientific-header__actions")?.getBoundingClientRect();
      const helpButton = element.querySelector(".scientific-header-help__button")?.getBoundingClientRect();
      const lastAction = element.querySelector(".scientific-header__actions")?.lastElementChild;
      return {
        actionsRight: actions?.right ?? 0,
        helpRight: helpButton?.right ?? 0,
        helpSize: helpButton?.width ?? 0,
        helpIsLast: lastAction?.classList.contains("scientific-header__help") ?? false,
      };
    });
    expect(Math.abs(geometry.actionsRight - geometry.helpRight)).toBeLessThanOrEqual(1);
    expect(geometry.helpSize).toBe(48);
    expect(geometry.helpIsLast).toBe(true);
  }

  await help.click();
  await expect(help).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByText("Configure the fixture, run the model and inspect the deterministic result.")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(help).toHaveAttribute("aria-expanded", "false");
  await expect(page.getByText("Configure the fixture, run the model and inspect the deterministic result.")).toBeHidden();
  await page.keyboard.press("?");
  await expect(page.getByText("Configure the fixture, run the model and inspect the deterministic result.")).toBeVisible();
  await page.getByRole("button", { name: "Open documentation" }).click();
  await expect(page.locator("body")).toHaveAttribute("data-help-action", "triggered");
  await expect(help).toHaveAttribute("aria-expanded", "false");
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
  await body.evaluate((element) => {
    const longConfiguration = document.createElement("div");
    longConfiguration.style.blockSize = "1200px";
    longConfiguration.textContent = "Long configuration";
    element.append(longConfiguration);
  });
  await body.hover();
  await page.mouse.wheel(0, 500);
  await page.waitForTimeout(100);
  expect(await body.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
  expect(await page.locator(".scientific-workbench__panel").evaluate((element) => element.scrollTop)).toBe(0);
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

test("long scientific results remain scrollable inside the workbench stage", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.locator("#fixture-panel").getByRole("button", { name: "Close panel" }).click();

  const stage = page.locator(".scientific-workbench__stage");
  await stage.evaluate((element) => {
    const longResult = document.createElement("div");
    longResult.style.blockSize = "1800px";
    longResult.className = "scientific-plot-surface";
    longResult.textContent = "Long scientific result";
    element.append(longResult);
  });
  await expect(stage).toHaveCSS("overflow-y", "auto");
  await stage.locator(".scientific-plot-surface").hover();
  await page.mouse.wheel(0, 600);
  await page.waitForTimeout(100);
  expect(await stage.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
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

test("shared commands collapse into Carbon overflow without global overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.locator("#fixture-panel").getByRole("button", { name: "Close panel" }).click();
  const viewport = page.getByRole("group", { name: "Viewport controls" });
  await expect(viewport.getByRole("button", { name: "Fit all" })).toBeVisible();
  await expect(viewport.getByRole("button", { name: "Zoom in" })).toBeHidden();
  const overflow = viewport.getByRole("button", { name: "More actions" });
  await expect(overflow).toBeVisible();
  await overflow.click();
  await expect(page.getByRole("menuitem", { name: "Zoom in" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
});

test("registered commands appear in Help and execute from one shortcut registry", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Help" }).click();
  const runShortcut = page.locator(".scientific-header-help__popover").getByText("Run model", { exact: true });
  await expect(runShortcut).toBeVisible();
  await expect(runShortcut).toHaveCount(1);
  await page.keyboard.press("Escape");
  await page.keyboard.press("Control+Enter");
  await expect(page.getByText("Simulation running").first()).toBeVisible();
});

test("theme provider applies Carbon g100 to the complete workbench", async ({ page }) => {
  await page.goto("/?theme=dark");
  const theme = page.locator(".scientific-theme");
  await expect(theme).toHaveAttribute("data-scientific-theme", "g100");
  const colors = await theme.evaluate((element) => ({
    background: getComputedStyle(element).backgroundColor,
    panel: getComputedStyle(document.querySelector(".scientific-task-panel")!).backgroundColor,
  }));
  expect(colors.background).not.toBe("rgba(0, 0, 0, 0)");
  expect(colors.panel).not.toBe("rgba(0, 0, 0, 0)");
  await page.getByRole("group", { name: "Viewport controls" }).getByRole("button", { name: "More actions" }).click();
  const floatingBackground = await page.evaluate(() => {
    const menu = document.querySelector<HTMLElement>('[role="menu"]');
    return menu ? getComputedStyle(menu).backgroundColor : null;
  });
  expect(floatingBackground).toBe(colors.panel);
});

test("theme remains usable when browser storage is blocked", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      get() { throw new DOMException("Blocked by test policy", "SecurityError"); },
    });
  });
  await page.goto("/?theme=dark");
  await expect(page.getByRole("link", { name: "Scientific UI" })).toBeVisible();
  await expect(page.locator(".scientific-theme")).toHaveAttribute("data-scientific-theme", "g100");
});

for (const width of [320, 390, 768, 1024]) {
  test(`recovery notice does not intercept panel close at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: width <= 390 ? 844 : 900 });
    await page.goto("/?recovery=1");
    const close = page.locator("#fixture-panel").getByRole("button", { name: "Close panel" });
    const receivesPointer = await close.evaluate((element) => {
      const bounds = element.getBoundingClientRect();
      const hit = document.elementFromPoint(bounds.left + bounds.width / 2, bounds.top + bounds.height / 2);
      return hit === element || Boolean(hit && element.contains(hit));
    });
    expect(receivesPointer).toBe(true);
    await close.click();
    await expect(page.locator("#fixture-panel")).toBeHidden();
    await expect(page.getByRole("complementary", { name: "Session recovery" })).toBeVisible();
  });
}
