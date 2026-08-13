import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "@carbon/react";
import { ScientificPlotFrame } from "./plots.js";

const meta = {
  title: "Scientific UI/Plots/Plot frame",
  component: ScientificPlotFrame,
  parameters: { layout: "padded" },
} satisfies Meta<typeof ScientificPlotFrame>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Complete: Story = {
  args: {
    eyebrow: "Material model",
    title: "Complex refractive index",
    description: "Independent scientific result with consistent plot chrome.",
    legend: [
      { id: "n", label: "n", color: "#0f62fe" },
      { id: "k", label: "k", color: "#8a3ffc", style: "dash" },
    ],
    instructions: "Hover to inspect · Drag to pan · Double-click to reset",
    actions: <Button kind="ghost">Reset view</Button>,
    children: (
      <div className="scientific-plot-surface" role="img" aria-label="Example complex refractive-index plot" style={{ minHeight: "20rem", display: "grid", placeItems: "center" }}>
        Plot renderer surface
      </div>
    ),
  },
};

export const Mobile: Story = {
  ...Complete,
  parameters: { viewport: { defaultViewport: "mobile1" } },
};
