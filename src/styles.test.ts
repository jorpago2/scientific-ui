import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const styles = readFileSync(fileURLToPath(new URL("./styles.css", import.meta.url)), "utf8");
const layout = readFileSync(fileURLToPath(new URL("./scientific-layout.tsx", import.meta.url)), "utf8");
const components = readFileSync(fileURLToPath(new URL("./components.tsx", import.meta.url)), "utf8");
const plots = readFileSync(fileURLToPath(new URL("./plots.tsx", import.meta.url)), "utf8");
const theme = readFileSync(fileURLToPath(new URL("./theme.tsx", import.meta.url)), "utf8");
const providers = readFileSync(fileURLToPath(new URL("./providers.tsx", import.meta.url)), "utf8");
const workflow = readFileSync(fileURLToPath(new URL("./workflow.ts", import.meta.url)), "utf8");
const autosave = readFileSync(fileURLToPath(new URL("./autosave.ts", import.meta.url)), "utf8");

describe("scientific typography contract", () => {
  it("uses IBM Plex Sans for inputs, values, coordinates and identifiers", () => {
    expect(styles).toMatch(/\.scientific-number-field input,[\s\S]*\.scientific-value,[\s\S]*\.scientific-coordinate,[\s\S]*\.scientific-identifier \{[\s\S]*font-family: var\(--scientific-ui-font-sans\);[\s\S]*font-variant-numeric: tabular-nums;/);
  });

  it("uses IBM Plex Sans with tabular numerals for metric values", () => {
    expect(styles).toMatch(/\.scientific-metric dd \{[\s\S]*font-family: var\(--scientific-ui-font-sans\);[\s\S]*font-variant-numeric: tabular-nums;/);
    expect(styles).not.toContain("var(--scientific-ui-font-mono)");
  });

  it("keeps mobile result metrics compact and scannable", () => {
    expect(layout).toContain('<Column sm={2} md={4} lg={lg}');
    expect(styles).toMatch(/\.scientific-metric \{[\s\S]*min-block-size: 5\.5rem;[\s\S]*grid-template-rows: auto auto;/);
    expect(styles).toContain("grid-template-rows: minmax(calc(2 * var(--scientific-ui-label-line-height)), auto) auto");
  });

  it("keeps nested metric values distinct from units", () => {
    expect(layout).toContain('className="scientific-metric__value"');
    expect(layout).toContain('className="scientific-metric__unit"');
    expect(styles).toMatch(/\.scientific-metric__value > span,[\s\S]*color: inherit;[\s\S]*font: inherit;/);
    expect(styles).not.toContain(".scientific-metric dd span");
  });
});

describe("scientific workbench contract", () => {
  it("keeps a closed task panel mounted but hidden for DOM-backed scientific engines", () => {
    expect(components).toContain("{panel && (");
    expect(components).toContain("hidden={!panelOpen}");
    expect(components).not.toContain("{panelOpen && panel &&");
  });

  it("keeps compact header actions accessible and touch sized", () => {
    expect(components).toBeDefined();
    const actions = readFileSync(fileURLToPath(new URL("./actions.tsx", import.meta.url)), "utf8");
    expect(actions).toContain('aria-label={action.label}');
    expect(styles).toMatch(/\.scientific-header__context a,[\s\S]*min-inline-size: var\(--scientific-ui-target-size\);/);
    expect(styles).toMatch(/@media \(max-width: 25\.875rem\)[\s\S]*\.scientific-header__primary-action \.scientific-command-bar__label[\s\S]*display: none;/);
    expect(styles).toContain("a.scientific-header__brand.scientific-app-header__brand");
  });

  it("preserves Carbon tab and content-switcher heights on touch viewports", () => {
    expect(styles).toContain('.scientific-task-panel button:not([role="tab"])');
    expect(styles).toContain('.scientific-inspector button:not([role="tab"])');
    expect(styles).toContain('.scientific-workbench button:not([role="tab"])');
    expect(styles).not.toContain("  .scientific-result-switcher button,");
  });

  it("owns panel rhythm and plot theme synchronization centrally", () => {
    expect(styles).toMatch(/\.scientific-task-panel__body \{[\s\S]*display: grid;[\s\S]*gap: var\(--scientific-ui-spacing-05\);/);
    expect(plots).toContain('window.addEventListener("scientific-ui:theme-applied", update)');
    expect(plots).toContain('toolbar.className = "scientific-plot-frame__toolbar"');
    expect(styles).toContain(".scientific-plot-frame__toolbar .modebar");
    expect(styles).toContain(".scientific-plot-frame__toolbar .modebar-btn svg path");
    expect(styles).toContain('.scientific-plot-frame__toolbar .modebar-btn[data-title]::after');
    expect(styles).not.toContain(".scientific-plot-surface .modebar {");
  });

  it("gives panel fields the full Carbon grid width and standardizes handoff behavior", () => {
    expect(layout).toContain('lg={columns === 2 ? 8 : 16}');
    expect(layout).toContain('<Accordion align="end" size="sm">');
    expect(styles).toMatch(/\.scientific-panel-section--collapsible \.scientific-panel-section__content \{[\s\S]*inline-size: calc\(125% \+ var\(--scientific-ui-spacing-03\)\);/);
    expect(styles).toMatch(/@media \(max-width: 41\.99rem\)[\s\S]*\.scientific-panel-section--collapsible \.scientific-panel-section__content,[\s\S]*inline-size: calc\(100% \+ 2 \* var\(--scientific-ui-spacing-05\)\);/);
    expect(layout).toContain("export function ScientificParameterSection");
    expect(components).toContain("export function ScientificExampleWorkflow");
    expect(components).toContain("target.scrollIntoView");
    expect(workflow).toContain("export function useScientificResultTransition");
    expect(workflow).toContain('prior.state === "running"');
    expect(workflow).toContain('result.dataset.scientificResultFocusTarget = "true"');
    expect(styles).toContain("[data-scientific-result-focus-target]:focus");
    expect(layout).toContain("export function ScientificStageHeader");
  });

  it("keeps evidence cards balanced without orphaned grid tracks", () => {
    expect(styles).toMatch(/\.scientific-evidence-summary__checks \{[\s\S]*grid-template-columns: repeat\(2, minmax\(0, 1fr\)\);/);
    expect(styles).toMatch(/@media \(max-width: 41\.99rem\)[\s\S]*\.scientific-evidence-summary__checks \{[\s\S]*grid-template-columns: minmax\(0, 1fr\);/);
    expect(styles).not.toContain("repeat(auto-fit, minmax(min(100%, 16rem), 1fr))");
    expect(layout).toContain('data-density={compact ? "compact" : "regular"}');
    expect(layout).toContain('iconOnly={compact}');
    expect(styles).toContain('.scientific-evidence-summary[data-density="compact"]');
  });

  it("centers run labels with their Carbon icons", () => {
    expect(styles).toMatch(/\.scientific-run-control \.scientific-command-bar__action \{[\s\S]*grid-template-columns: auto auto;[\s\S]*justify-content: center;/);
    expect(styles).toContain(".scientific-run-control .scientific-command-bar__action > svg");
  });

  it("defines one Carbon-grid post-operation handoff for every scientific app", () => {
    expect(layout).toContain("export function ScientificOutcomeSummary");
    expect(layout).toContain('sm={4}');
    expect(layout).toContain('md={hasActions ? 5 : 8}');
    expect(layout).toContain('lg={hasActions ? 11 : 16}');
    expect(layout).toContain('label="Outcome actions"');
    expect(styles).toContain(".scientific-outcome-summary");
    expect(styles).toContain('.scientific-outcome-summary[data-state="modified"]');
  });

  it("keeps the shared theme action before the terminal help action", () => {
    expect(components.indexOf("scientific-header__theme")).toBeLessThan(components.indexOf("scientific-header__help"));
    expect(theme).toContain("ScientificThemeToggle");
    expect(theme).toContain('data-scientific-theme={resolvedTheme}');
    expect(theme).toContain('normalizeThemePreference(window.localStorage.getItem(storageKey)) ?? defaultPreference');
    expect(theme).toContain('defaultPreference = "light"');
    expect(theme).not.toContain('defaultPreference = "system"');
    expect(theme).toContain('window.addEventListener("storage", synchronizeStoredTheme)');
    expect(providers).toContain('theme === undefined ? {} : { preference: theme }');
    expect(providers).toContain('themeStorageKey === undefined ? {} : { storageKey: themeStorageKey }');
    expect(providers).not.toContain('theme = "system"');
  });

  it("provides versioned recovery without overwriting an unread draft", () => {
    expect(components).toContain("export function ScientificRecoveryNotice");
    expect(components).toContain("Restore session");
    expect(components).toContain("export function ScientificAutosaveStatus");
    expect(autosave).toContain('SCIENTIFIC_AUTOSAVE_FORMAT = "scientific-ui/autosave@1"');
    expect(autosave).toContain("!decisionMade.current || recovery");
    expect(styles).toContain(".scientific-recovery-notice");
  });
});
