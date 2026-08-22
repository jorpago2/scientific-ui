import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { ScientificToolRail } from "./components";
import "./tool-rail.preview.css";

const previewStates = ["default", "hover", "focus", "active", "disabled", "loading", "error", "success"] as const;

function ToolRailStatePreview() {
  return <main className="tool-rail-preview">
    <h1>Scientific tool rail states</h1>
    <div className="tool-rail-preview__grid">
      {previewStates.map((previewState) => <section data-preview={previewState} key={previewState}>
        <h2>{previewState}</h2>
        <ScientificToolRail
          activeId={previewState === "active" ? previewState : null}
          collapsible
          items={[{
            id: previewState,
            label: "Configure",
            controlsId: `${previewState}-panel`,
            disabled: previewState === "disabled",
            disabledReason: previewState === "disabled" ? "Unavailable until data is loaded" : undefined,
            status: previewState === "loading" || previewState === "error" || previewState === "success" ? previewState : undefined,
            statusLabel: previewState === "loading" ? "Loading configuration" : previewState === "error" ? "Configuration error" : previewState === "success" ? "Configuration validated" : undefined,
          }]}
          onChange={() => undefined}
        />
      </section>)}
    </div>
  </main>;
}

function InteractiveToolRail({ compact = false }: { compact?: boolean }) {
  const [activeId, setActiveId] = useState<string | null>("input");
  return <main className="tool-rail-interactive">
    <ScientificToolRail activeId={activeId} compact={compact} onChange={setActiveId} items={[
      { id: "input", label: "Input", controlsId: "interactive-panel" },
      { id: "model", label: "Model", controlsId: "interactive-panel" },
      { id: "results", label: "Results", controlsId: "interactive-panel", status: "success", statusLabel: "Results up to date" },
      { id: "export", label: "Export with a deliberately long label", controlsId: "interactive-panel" },
    ]} />
    <section id="interactive-panel"><h1>{activeId ?? "Panel closed"}</h1></section>
  </main>;
}

const meta = { title: "Components/ScientificToolRail", component: ToolRailStatePreview } satisfies Meta<typeof ToolRailStatePreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const EightStates: Story = {};
export const Interactive: Story = { render: () => <InteractiveToolRail /> };
export const Compact: Story = { render: () => <InteractiveToolRail compact /> };
