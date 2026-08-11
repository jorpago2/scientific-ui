import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button, Slider } from "@carbon/react";
import { useState } from "react";
import {
  ScientificMetricGrid,
  ScientificPanelFooter,
  ScientificPanelSection,
  ScientificParameterGroup,
  ScientificProjectActions,
  ScientificResultsLayout,
  ScientificRunControl,
  ScientificUiProvider,
  ScientificViewportToolbar,
} from "./index";

function PatternCatalogue({ dark = false }: { dark?: boolean }) {
  const [state, setState] = useState<"ready" | "running" | "paused">("ready");
  return <ScientificUiProvider theme={dark ? "dark" : "light"}>
    <main style={{ minHeight: "100vh", padding: "1rem" }}>
      <ScientificPanelSection title="Simulation" description="Shared parameter hierarchy and responsive action placement." actions={<ScientificRunControl execution={{ state, label: state, progress: state === "running" ? 38 : undefined, onRun: () => setState("running"), onPause: () => setState("paused"), onStop: () => setState("ready") }} />}>
        <ScientificParameterGroup columns={2}>
          <Slider id="mesh" labelText="Mesh density" min={8} max={80} value={32} hideTextInput />
          <Slider id="duration" labelText="Duration" min={1} max={100} value={20} hideTextInput />
        </ScientificParameterGroup>
        <ScientificPanelFooter summary="Inputs are valid"><Button kind="secondary">Validate</Button><Button>Apply</Button></ScientificPanelFooter>
      </ScientificPanelSection>
      <ScientificResultsLayout title="Results" description="Presentation is shared; scientific rendering remains local." actions={<ScientificViewportToolbar onZoomIn={() => undefined} onZoomOut={() => undefined} onFitWidth={() => undefined} onFitSelection={() => undefined} onFitAll={() => undefined} onReset={() => undefined} />}>
        <ScientificMetricGrid metrics={[{ id: "neff", label: "Effective index", value: "2.4381", status: "success" }, { id: "loss", label: "Loss", value: "0.021", unit: "dB/cm" }, { id: "modes", label: "Modes", value: 4 }]} />
      </ScientificResultsLayout>
      <ScientificProjectActions onOpen={() => undefined} onSave={() => undefined} onExport={() => undefined} onCopyUrl={() => undefined} onReset={() => undefined} />
    </main>
  </ScientificUiProvider>;
}

const meta = { title: "Patterns/Scientific composition", component: PatternCatalogue } satisfies Meta<typeof PatternCatalogue>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Light: Story = {};
export const Dark: Story = { args: { dark: true }, parameters: { backgrounds: { default: "g100" } } };
export const Mobile: Story = { parameters: { viewport: { defaultViewport: "mobile1" } } };
export const Tablet: Story = { parameters: { viewport: { defaultViewport: "tablet" } } };
