import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "@carbon/react";
import { useState } from "react";
import { ScientificAppShell, ScientificEmptyState, ScientificHeader, ScientificStatusBar, ScientificTaskPanel, WorkflowNavigation } from "./components";
import type { ScientificStatusDescriptor } from "./types";

function WorkbenchExample({ status = { state: "modified", label: "Parameters modified", detail: "Run the model to refresh results." }, longContent = false }: { status?: ScientificStatusDescriptor; longContent?: boolean }) {
  const [activeId, setActiveId] = useState("configure");
  return (
    <ScientificAppShell
      header={<ScientificHeader product="Scientific workbench" compactProduct="Workbench" context="Example experiment" status={status} primaryAction={<Button>Run model</Button>} help={{ summary: "Configure the example, run the model and inspect the result.", shortcuts: [{ keys: ["Ctrl/⌘", "Enter"], description: "Run model" }] }} />}
      navigation={<WorkflowNavigation activeId={activeId} onChange={setActiveId} items={[
        { id: "configure", label: "Configure", controlsId: "example-panel" },
        { id: "results", label: "Results", controlsId: "example-panel" },
        { id: "export", label: "Export", controlsId: "example-panel" },
      ]} />}
      panel={<ScientificTaskPanel id="example-panel" title={activeId} titleId="example-panel-title" eyebrow="Scientific workflow"><p>{longContent ? "A deliberately long configuration description verifies wrapping without changing the width of the scientific canvas or hiding the primary action." : "Controlled application content."}</p></ScientificTaskPanel>}
      previewStageWhenPanelOpen
      statusBar={<ScientificStatusBar status={status} metadata="Fixture · deterministic" />}
    >
      <ScientificEmptyState title="No result yet" description="Configure the model and run it to create the first result." action={<Button size="sm">Run model</Button>} />
    </ScientificAppShell>
  );
}

const meta = { title: "Workbench/ScientificAppShell", component: WorkbenchExample } satisfies Meta<typeof WorkbenchExample>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Running: Story = { render: () => <WorkbenchExample status={{ state: "running", label: "Simulation running", detail: "Solving deterministic example", progress: 42 }} /> };
export const Failed: Story = { render: () => <WorkbenchExample status={{ state: "failed", label: "Simulation failed", detail: "Review the validation summary." }} /> };
export const LongContent: Story = { render: () => <WorkbenchExample longContent /> };
export const Mobile: Story = { parameters: { viewport: { defaultViewport: "mobile1" } } };
export const Tablet: Story = { parameters: { viewport: { defaultViewport: "tablet" } } };
