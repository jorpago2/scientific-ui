import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button, Slider } from "@carbon/react";
import { useState } from "react";
import {
  ScientificMetricGrid,
  ScientificModelScope,
  ScientificOutcomeSummary,
  ScientificPanelFooter,
  ScientificPanelSection,
  ScientificParameterGroup,
  ScientificPreflightSummary,
  ScientificProjectActions,
  ScientificResultProvenance,
  ScientificResultsLayout,
  ScientificRunControl,
  ScientificUiProvider,
  ScientificValidationSummary,
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
      <ScientificOutcomeSummary
        title="Latest solver outcome"
        status={state === "running"
          ? { state: "running", label: "Solving", progress: 38, detail: "Assembling the eigenproblem" }
          : state === "paused"
            ? { state: "modified", label: "Paused result", detail: "Resume to produce a current result" }
            : { state: "up-to-date", label: "Result current" }}
        summary="The fundamental guided mode is available. Review numerical evidence before treating the result as validated."
        metrics={[
          { id: "neff-outcome", label: "Effective index", value: "2.4381" },
          { id: "residual-outcome", label: "Relative residual", value: "2.1e-8" },
          { id: "mesh-outcome", label: "Mesh", value: "320 Ã— 240", unit: "cells" },
        ]}
        actions={[
          { id: "validate", label: "Review validation", emphasis: "primary", onClick: () => undefined },
          { id: "export", label: "Export result", emphasis: "secondary", collapseAt: "sm", onClick: () => undefined },
        ]}
      />
      <ScientificResultsLayout title="Results" description="Presentation is shared; scientific rendering remains local." actions={<ScientificViewportToolbar onZoomIn={() => undefined} onZoomOut={() => undefined} onFitWidth={() => undefined} onFitSelection={() => undefined} onFitAll={() => undefined} onReset={() => undefined} />}>
        <ScientificMetricGrid metrics={[{ id: "neff", label: "Effective index", value: "2.4381", status: "success" }, { id: "loss", label: "Loss", value: "0.021", unit: "dB/cm" }, { id: "modes", label: "Modes", value: 4 }]} />
        <ScientificPreflightSummary
          status={{ state: "warning", label: "Review before run" }}
          description="Checks that determine whether the numerical problem is safe to execute."
          checks={[
            { id: "inputs", label: "Inputs", state: "passed", detail: "All required quantities have units." },
            { id: "mesh", label: "Mesh", state: "warning", value: "8 cells / feature", detail: "Refine before quantitative use." },
            { id: "stability", label: "Stability", state: "passed", value: "CFL 0.62" },
          ]}
        />
        <ScientificValidationSummary
          status={{ state: "ready", label: "Validation not complete" }}
          checks={[
            { id: "convergence", label: "Convergence", state: "not-run" },
            { id: "conservation", label: "Conservation", state: "not-run" },
          ]}
        />
        <ScientificModelScope
          model="Scalar, frequency-domain eigenmode approximation."
          assumptions={["Linear isotropic media", "Invariant propagation axis"]}
          limits={["Near-cutoff modes require mesh convergence", "Material dispersion must be supplied by the user"]}
        />
        <ScientificResultProvenance
          status={{ state: "modified", label: "Result uses an earlier configuration" }}
          items={[
            { id: "solver", label: "Solver", value: "Eigenmode 2.1" },
            { id: "mesh", label: "Mesh", value: "320 × 240" },
            { id: "time", label: "Generated", value: "2026-08-12 10:24 UTC" },
          ]}
        />
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
