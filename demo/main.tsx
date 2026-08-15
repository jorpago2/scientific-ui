import { Button } from "@carbon/react";
import { ChartLine, Download, SettingsAdjust } from "@carbon/icons-react";
import "./carbon.scss";
import "../tokens.css";
import "../src/styles.css";
import "./demo.css";
import { createRoot } from "react-dom/client";
import { useRef, useState } from "react";
import {
  InspectorPanel,
  ScientificAppShell,
  ScientificHeader,
  ScientificMetricGrid,
  ScientificNumberField,
  ScientificPanelSection,
  ScientificParameterGroup,
  ScientificProjectActions,
  ScientificRecoveryNotice,
  ScientificResultsLayout,
  ScientificRunControl,
  ScientificStatusBar,
  ScientificTaskPanel,
  ScientificToolRail,
  ScientificUiProvider,
  ScientificViewportToolbar,
  useScientificNotifications,
} from "@jorpago2/scientific-ui";

function Demo() {
  const [active, setActive] = useState<string | null>("configure");
  const [running, setRunning] = useState(false);
  const [parameter, setParameter] = useState<number | null>(1e-6);
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const inspectorTriggerRef = useRef<HTMLButtonElement>(null);
  const { notify } = useScientificNotifications();
  const showRecovery = new URLSearchParams(window.location.search).has("recovery");
  const status = running
    ? { state: "running" as const, label: "Simulation running", detail: "Solving deterministic fixture", progress: 42 }
    : { state: "ready" as const, label: "Ready", detail: "Inputs are valid" };

  return <ScientificAppShell
    header={<ScientificHeader
      product="Scientific UI"
      compactProduct="SciUI"
      context="Conformance fixture"
      status={status}
      secondaryActions={<>
        <ScientificProjectActions
          onExport={() => notify({ kind: "success", title: "Export ready", subtitle: "fixture.json" })}
          onCopyUrl={() => notify({ kind: "info", title: "URL copied" })}
        />
        <Button ref={inspectorTriggerRef} kind="ghost" onClick={() => setInspectorOpen(true)}>Inspect</Button>
      </>}
      primaryAction={<ScientificRunControl execution={{
        ...status,
        onRun: () => setRunning(true),
        onStop: () => setRunning(false),
        runLabel: "Run model",
      }} />}
      help={{
        summary: "Configure the fixture, run the model and inspect the deterministic result.",
        action: { label: "Open documentation", onClick: () => { document.body.dataset.helpAction = "triggered"; } },
      }}
    />}
    navigation={<ScientificToolRail activeId={active} onChange={setActive} items={[
      { id: "configure", label: "Configure", icon: <SettingsAdjust />, controlsId: "fixture-panel" },
      { id: "results", label: "Results", icon: <ChartLine />, controlsId: "fixture-panel" },
      { id: "export", label: "Export", icon: <Download />, controlsId: "fixture-panel" },
    ]} />}
    recovery={showRecovery ? <ScientificRecoveryNotice savedAt="2026-08-15T10:00:00.000Z" onRestore={() => undefined} onDiscard={() => undefined} /> : undefined}
    panel={active ? <ScientificTaskPanel
      id="fixture-panel"
      className="fixture-panel"
      title={active === "configure" ? "Configure" : active === "results" ? "Results" : "Export"}
      titleId="fixture-panel-title"
      eyebrow="Scientific workflow parameters and constraints"
      onClose={() => setActive(null)}
    >
      <ScientificPanelSection title="Model parameters" description="The panel remains readable at every Carbon breakpoint.">
        <ScientificParameterGroup columns={2}>
          <ScientificNumberField id="fixture-length" labelText="Length" value={parameter ?? ""} unit="m" min={0} onValueChange={setParameter} />
          <ScientificNumberField id="fixture-frequency" labelText="Frequency" value={2e14} unit="Hz" min={0} onValueChange={() => undefined} />
        </ScientificParameterGroup>
      </ScientificPanelSection>
      <ScientificPanelSection title="Advanced checks" meta="Optional" collapsible defaultOpen={false}>
        <p>Deterministic validation controls.</p>
      </ScientificPanelSection>
    </ScientificTaskPanel> : undefined}
    panelOpen={active !== null}
    previewStageWhenPanelOpen
    inspector={<InspectorPanel open={inspectorOpen} title="Result inspector" triggerRef={inspectorTriggerRef} onClose={() => setInspectorOpen(false)}>
      <p>Carbon manages focus, Escape and return focus for this inspector.</p>
      <Button kind="secondary" data-modal-primary-focus onClick={() => setInspectorOpen(false)}>Apply</Button>
    </InspectorPanel>}
    statusBar={<ScientificStatusBar status={status} metadata="390–1440 px" />}
  >
    <div className="fixture-stage">
      <ScientificResultsLayout
        title="Deterministic result"
        description="Stable fixture used for responsive and accessibility conformance."
        actions={<ScientificViewportToolbar
          onZoomIn={() => undefined}
          onZoomOut={() => undefined}
          onFitWidth={() => undefined}
          onFitSelection={() => undefined}
          selectionAvailable
          onFitAll={() => undefined}
          onReset={() => undefined}
        />}
      >
        <ScientificMetricGrid metrics={[
          { id: "mesh", label: "Mesh cells", value: "360 × 240" },
          { id: "cfl", label: "CFL", value: "0.50", status: "success" },
          { id: "energy", label: "Energy", value: "1.00", unit: "a.u." },
        ]} />
      </ScientificResultsLayout>
    </div>
    <ScientificTaskPanel id="hidden-fixture-panel" title="Hidden panel" hidden>Hidden content</ScientificTaskPanel>
  </ScientificAppShell>;
}

const theme = new URLSearchParams(window.location.search).get("theme") === "dark" ? "dark" : "light";
createRoot(document.getElementById("root")!).render(<ScientificUiProvider theme={theme}><Demo /></ScientificUiProvider>);
