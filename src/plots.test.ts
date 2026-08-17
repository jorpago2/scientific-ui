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
    expect(SCIENTIFIC_PLOT_LINE_WIDTHS).toEqual({ reference: 1, secondary: 1.25, primary: 1.75, emphasis: 2.5 });
  });

  it("uses a publication layout independent of Carbon and merges scientific axis overrides", () => {
    const layout = createScientificPlotlyLayout({
      theme,
      xTitle: "Wavelength (µm)",
      yTitle: "Effective index",
      overrides: { xaxis: { type: "log" } },
    });
    expect(layout.font).toMatchObject({ family: SCIENTIFIC_PLOT_FONT });
    expect(layout).toMatchObject({ paper_bgcolor: "white", plot_bgcolor: "white" });
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

  it("creates restrained publication axes", () => {
    expect(createScientificPlotlyAxis(theme, "Voltage (V)")).toMatchObject({
      color: "gray",
      gridcolor: "silver",
      gridwidth: 0.5,
      linecolor: "dimgray",
      linewidth: 1,
      showline: true,
      zeroline: false,
    });
  });
});
