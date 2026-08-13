import { useEffect, useId, useState, type CSSProperties, type ReactNode } from "react";

export const SCIENTIFIC_PLOT_FONT = '"IBM Plex Sans", "Helvetica Neue", Arial, sans-serif';

/** Semantic stroke widths for scientific data and plot annotations, in CSS pixels. */
export const SCIENTIFIC_PLOT_LINE_WIDTHS = {
  reference: 2,
  secondary: 3,
  primary: 4,
  emphasis: 5,
} as const;

export interface ScientificPlotTheme {
  background: string;
  layer: string;
  grid: string;
  axis: string;
  text: string;
  textSecondary: string;
  focus: string;
}

export interface ScientificPlotLegendItem {
  id: string;
  label: ReactNode;
  color: string;
  style?: "line" | "dash" | "dot";
}

export interface ScientificPlotFrameProps {
  title: ReactNode;
  children: ReactNode;
  eyebrow?: ReactNode;
  description?: ReactNode;
  legend?: readonly ScientificPlotLegendItem[];
  instructions?: ReactNode;
  actions?: ReactNode;
  status?: ReactNode;
  className?: string;
  titleId?: string;
}

export interface ScientificPlotlyLayoutOptions {
  height?: number;
  margin?: { l?: number; r?: number; t?: number; b?: number; pad?: number };
  xTitle?: string;
  yTitle?: string;
  uirevision?: string;
  hovermode?: string | false;
  dragmode?: string | false;
  showlegend?: boolean;
  theme?: Partial<ScientificPlotTheme>;
  overrides?: Record<string, unknown>;
}

export interface ScientificPlotlyConfigOptions {
  filename: string;
  format?: "svg" | "png";
  width?: number;
  height?: number;
  scale?: number;
  scrollZoom?: boolean;
  displayModeBar?: boolean;
  addFullscreen?: boolean;
  removeButtons?: readonly string[];
  overrides?: Record<string, unknown>;
}

type PlotElement = HTMLElement & { ownerDocument: Document };

const FALLBACK_THEME: ScientificPlotTheme = {
  background: "#ffffff",
  layer: "#f4f4f4",
  grid: "#e0e0e0",
  axis: "#8d8d8d",
  text: "#161616",
  textSecondary: "#525252",
  focus: "#0f62fe",
};

const FULLSCREEN_ICON = {
  width: 32,
  height: 32,
  ascent: 32,
  descent: 0,
  /* Carbon Maximize 32 glyph, adapted to Plotly's path-only icon contract. */
  path: "M20 2 20 4 26.586 4 18 12.582 19.414 14 28 5.414 28 12 30 12 30 2 20 2z M14 19.416 12.592 18 4 26.586 4 20 2 20 2 30 12 30 12 28 5.414 28 14 19.416z",
};

let fullscreenPlot: PlotElement | null = null;
let fullscreenSnapshot: { width: string; height: string; focus: HTMLElement | null } | null = null;

function cssValue(style: CSSStyleDeclaration, name: string, fallback: string): string {
  return style.getPropertyValue(name).trim() || fallback;
}

/** Reads resolved Carbon theme tokens so plots change with the application theme. */
export function readScientificPlotTheme(element?: Element): ScientificPlotTheme {
  if (typeof window === "undefined" || typeof document === "undefined") return FALLBACK_THEME;
  const style = window.getComputedStyle(element ?? document.documentElement);
  return {
    background: cssValue(style, "--cds-background", FALLBACK_THEME.background),
    layer: cssValue(style, "--cds-layer-01", FALLBACK_THEME.layer),
    grid: cssValue(style, "--cds-border-subtle-01", FALLBACK_THEME.grid),
    axis: cssValue(style, "--cds-border-strong-01", FALLBACK_THEME.axis),
    text: cssValue(style, "--cds-text-primary", FALLBACK_THEME.text),
    textSecondary: cssValue(style, "--cds-text-secondary", FALLBACK_THEME.textSecondary),
    focus: cssValue(style, "--cds-focus", FALLBACK_THEME.focus),
  };
}

/**
 * Reactive Carbon plot tokens. Plot renderers draw colors into SVG/canvas and
 * therefore cannot rely on CSS inheritance when the application theme changes.
 */
export function useScientificPlotTheme(element?: Element | null): ScientificPlotTheme {
  const [theme, setTheme] = useState<ScientificPlotTheme>(() => readScientificPlotTheme(element ?? undefined));

  useEffect(() => {
    const update = () => setTheme(readScientificPlotTheme(element ?? undefined));
    update();
    window.addEventListener("scientific-ui:theme-applied", update);
    return () => window.removeEventListener("scientific-ui:theme-applied", update);
  }, [element]);

  return theme;
}

export function createScientificPlotlyAxis(
  theme: ScientificPlotTheme,
  title?: string,
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    ...(title ? { title: { text: title } } : {}),
    color: theme.textSecondary,
    gridcolor: theme.grid,
    linecolor: theme.axis,
    zerolinecolor: theme.axis,
    showline: true,
    ticks: "outside",
    automargin: true,
    ...overrides,
  };
}

/** Renderer-neutral Plotly layout defaults. Callers retain scientific axis and trace choices. */
export function createScientificPlotlyLayout(options: ScientificPlotlyLayoutOptions = {}): Record<string, unknown> {
  const theme = { ...readScientificPlotTheme(), ...options.theme };
  const overrides = options.overrides ?? {};
  const xaxis = (overrides.xaxis ?? {}) as Record<string, unknown>;
  const yaxis = (overrides.yaxis ?? {}) as Record<string, unknown>;
  const legend = (overrides.legend ?? {}) as Record<string, unknown>;
  const font = (overrides.font ?? {}) as Record<string, unknown>;

  return {
    autosize: true,
    height: options.height ?? 360,
    margin: { l: 64, r: 24, t: 56, b: 56, ...options.margin },
    hovermode: options.hovermode ?? "x unified",
    dragmode: options.dragmode ?? "pan",
    showlegend: options.showlegend ?? true,
    legend: { orientation: "h", x: 0, y: 1.12, ...legend },
    ...(options.uirevision ? { uirevision: options.uirevision } : {}),
    ...overrides,
    paper_bgcolor: "rgba(0,0,0,0)",
    plot_bgcolor: theme.background,
    font: { size: 12, ...font, family: SCIENTIFIC_PLOT_FONT, color: theme.textSecondary },
    xaxis: { ...createScientificPlotlyAxis(theme, options.xTitle, xaxis), color: theme.textSecondary, gridcolor: theme.grid, linecolor: theme.axis, zerolinecolor: theme.axis },
    yaxis: { ...createScientificPlotlyAxis(theme, options.yTitle, yaxis), color: theme.textSecondary, gridcolor: theme.grid, linecolor: theme.axis, zerolinecolor: theme.axis },
  };
}

function requestPlotResize(plot: PlotElement): void {
  const view = plot.ownerDocument.defaultView;
  view?.requestAnimationFrame(() => view.dispatchEvent(new Event("resize")));
}

export function closeScientificPlotFullscreen(): void {
  if (!fullscreenPlot || !fullscreenSnapshot) return;
  const plot = fullscreenPlot;
  const snapshot = fullscreenSnapshot;
  fullscreenPlot = null;
  fullscreenSnapshot = null;
  plot.style.width = snapshot.width;
  plot.style.height = snapshot.height;
  plot.classList.remove("scientific-plot-fullscreen");
  plot.ownerDocument.body.classList.remove("scientific-plot-fullscreen-open");
  plot.ownerDocument.removeEventListener("keydown", closeFullscreenOnEscape);
  requestPlotResize(plot);
  snapshot.focus?.focus({ preventScroll: true });
}

function closeFullscreenOnEscape(event: KeyboardEvent): void {
  if (event.key === "Escape") closeScientificPlotFullscreen();
}

export function toggleScientificPlotFullscreen(plot: PlotElement): void {
  if (fullscreenPlot === plot) {
    closeScientificPlotFullscreen();
    return;
  }
  closeScientificPlotFullscreen();
  fullscreenPlot = plot;
  fullscreenSnapshot = {
    width: plot.style.width,
    height: plot.style.height,
    focus: plot.ownerDocument.activeElement instanceof HTMLElement ? plot.ownerDocument.activeElement : null,
  };
  plot.style.width = "100%";
  plot.style.height = "100%";
  plot.classList.add("scientific-plot-fullscreen");
  plot.ownerDocument.body.classList.add("scientific-plot-fullscreen-open");
  plot.ownerDocument.addEventListener("keydown", closeFullscreenOnEscape);
  requestPlotResize(plot);
}

/** Shared interaction/export policy for all Plotly-backed scientific plots. */
export function createScientificPlotlyConfig(options: ScientificPlotlyConfigOptions): Record<string, unknown> {
  const removed = new Set(["lasso2d", "select2d", ...(options.removeButtons ?? [])]);
  const modeBarButtonsToAdd = options.addFullscreen === false ? [] : [{
    name: "fullscreen",
    title: "Toggle fullscreen",
    icon: FULLSCREEN_ICON,
    click: (plot: PlotElement) => toggleScientificPlotFullscreen(plot),
  }];
  return {
    displaylogo: false,
    responsive: true,
    scrollZoom: options.scrollZoom ?? false,
    displayModeBar: options.displayModeBar ?? true,
    doubleClick: "reset",
    modeBarButtonsToRemove: [...removed],
    modeBarButtonsToAdd,
    toImageButtonOptions: {
      format: options.format ?? "svg",
      filename: options.filename,
      width: options.width ?? 1400,
      height: options.height ?? 800,
      scale: options.scale ?? 1,
    },
    ...options.overrides,
  };
}

/** Repairs Plotly's generated toolbar so every command is keyboard reachable. */
export function prepareScientificPlotlyToolbar(plot: Element): void {
  for (const button of plot.querySelectorAll<HTMLElement>(".modebar-btn")) {
    button.tabIndex = 0;
    button.setAttribute("role", "button");
    if (button.dataset.scientificKeyboardReady === "true") continue;
    button.dataset.scientificKeyboardReady = "true";
    button.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      button.click();
    });
  }
}

export function ScientificPlotFrame({
  title,
  children,
  eyebrow,
  description,
  legend = [],
  instructions,
  actions,
  status,
  className,
  titleId,
}: ScientificPlotFrameProps) {
  const generatedId = useId();
  const headingId = titleId ?? `scientific-plot-${generatedId.replace(/:/g, "")}`;
  return (
    <section className={["scientific-plot-frame", className].filter(Boolean).join(" ")} aria-labelledby={headingId}>
      <header className="scientific-plot-frame__header">
        <div className="scientific-plot-frame__heading">
          {eyebrow ? <p className="scientific-plot-frame__eyebrow">{eyebrow}</p> : null}
          <h2 id={headingId}>{title}</h2>
          {description ? <p className="scientific-plot-frame__description">{description}</p> : null}
        </div>
        {legend.length > 0 ? (
          <ul className="scientific-plot-legend" aria-label="Plot legend">
            {legend.map((item) => (
              <li key={item.id}>
                <span
                  className={`scientific-plot-legend__swatch scientific-plot-legend__swatch--${item.style ?? "line"}`}
                  style={{ "--scientific-plot-series-color": item.color } as CSSProperties}
                  aria-hidden="true"
                />
                {item.label}
              </li>
            ))}
          </ul>
        ) : null}
      </header>
      <div className="scientific-plot-frame__surface">{children}</div>
      {instructions || actions || status ? (
        <footer className="scientific-plot-frame__footer">
          <div className="scientific-plot-frame__meta">{status ?? instructions}</div>
          {actions ? <div className="scientific-plot-frame__actions">{actions}</div> : null}
        </footer>
      ) : null}
    </section>
  );
}
