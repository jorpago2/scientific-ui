import { describe, expect, it } from "vitest";
import {
  SCIENTIFIC_PLOT_FONT,
  SCIENTIFIC_PLOT_LINE_WIDTHS,
  createScientificPlotlyAxis,
  createScientificPlotlyConfig,
  createScientificPlotlyLayout,
  type ScientificPlotTheme,
} from "./plots.js";

const theme: ScientificPlotTheme = {
  background: "white",
  layer: "gray",
  grid: "silver",
  axis: "dimgray",
  text: "black",
  textSecondary: "gray",
  focus: "blue",
};

describe("scientific Plotly contract", () => {
  it("provides a shared visual hierarchy for scientific traces", () => {
    expect(SCIENTIFIC_PLOT_LINE_WIDTHS).toEqual({ reference: 2, secondary: 3, primary: 4, emphasis: 5 });
  });

  it("uses IBM Plex Sans and merges scientific axis overrides", () => {
    const layout = createScientificPlotlyLayout({
      theme,
      xTitle: "Wavelength (µm)",
      yTitle: "Effective index",
      overrides: { xaxis: { type: "log" } },
    });
    expect(layout.font).toMatchObject({ family: SCIENTIFIC_PLOT_FONT });
    expect(layout.hoverlabel).toMatchObject({
      align: "left",
      bgcolor: "gray",
      bordercolor: "dimgray",
      font: { family: SCIENTIFIC_PLOT_FONT, color: "black" },
    });
    expect(layout.xaxis).toMatchObject({ title: { text: "Wavelength (µm)" }, type: "log", gridcolor: "silver" });
    expect(layout.yaxis).toMatchObject({ title: { text: "Effective index" }, linecolor: "dimgray" });
    expect(layout).not.toHaveProperty("height");
    expect(createScientificPlotlyLayout({ theme, height: 420 })).toMatchObject({ height: 420 });
  });

  it("keeps export, reset and fullscreen behavior consistent", () => {
    const config = createScientificPlotlyConfig({ filename: "mode-profile", removeButtons: ["zoomIn2d"] });
    expect(config).toMatchObject({ displaylogo: false, responsive: true, doubleClick: "reset" });
    expect(config.modeBarButtonsToRemove).toEqual(expect.arrayContaining(["lasso2d", "select2d", "zoomIn2d"]));
    expect(config.toImageButtonOptions).toMatchObject({ format: "svg", filename: "mode-profile" });
    expect(config.modeBarButtonsToAdd).toHaveLength(1);
  });

  it("creates accessible Carbon-token axes", () => {
    expect(createScientificPlotlyAxis(theme, "Voltage (V)")).toMatchObject({
      color: "gray",
      gridcolor: "silver",
      linecolor: "dimgray",
      showline: true,
    });
  });
});
