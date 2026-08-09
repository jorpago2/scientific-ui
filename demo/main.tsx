import { Button, GlobalTheme } from "@carbon/react";
import "./carbon.scss";
import "../tokens.css";
import "../src/styles.css";
import "./demo.css";
import { createRoot } from "react-dom/client";
import { useRef, useState } from "react";
import { InspectorPanel, ScientificAppShell, ScientificEmptyState, ScientificHeader, ScientificStatusBar, ScientificToolRail } from "@jorpago2/scientific-ui";

const FixtureIcon = () => <svg viewBox="0 0 16 16"><path d="M2 3h12v2H2zm0 4h12v2H2zm0 4h12v2H2z" /></svg>;

function Demo() {
  const [active, setActive] = useState<string | null>("configure");
  const [running, setRunning] = useState(false);
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const inspectorTriggerRef = useRef<HTMLButtonElement>(null);
  const status = running
    ? { state: "running" as const, label: "Simulation running", detail: "Solving deterministic fixture", progress: 42 }
    : { state: "ready" as const, label: "Ready", detail: "Inputs are valid" };
  return <GlobalTheme theme="g10"><ScientificAppShell
    header={<ScientificHeader product="Scientific UI" context="Conformance fixture" status={status} secondaryActions={<Button ref={inspectorTriggerRef} kind="ghost" onClick={() => setInspectorOpen(true)}>Inspect</Button>} primaryAction={<Button onClick={() => setRunning((value) => !value)}>{running ? "Stop" : "Run model"}</Button>} />}
    navigation={<ScientificToolRail activeId={active} onChange={setActive} items={[
      { id: "configure", label: "Configure", icon: <FixtureIcon />, controlsId: "fixture-panel" },
      { id: "results", label: "Results", icon: <FixtureIcon />, controlsId: "fixture-panel" },
      { id: "export", label: "Export", icon: <FixtureIcon />, controlsId: "fixture-panel" },
    ]} />}
    panel={active ? <section id="fixture-panel" className="fixture-panel"><h2>{active}</h2><p>The panel remains readable at every Carbon breakpoint.</p></section> : undefined}
    panelOpen={active !== null}
    inspector={<InspectorPanel open={inspectorOpen} title="Result inspector" triggerRef={inspectorTriggerRef} onClose={() => setInspectorOpen(false)}><p>Carbon manages focus, Escape and return focus for this inspector.</p><Button data-modal-primary-focus onClick={() => setInspectorOpen(false)}>Apply</Button></InspectorPanel>}
    statusBar={<ScientificStatusBar status={status} metadata="390–1440 px" />}
  ><div className="fixture-stage"><ScientificEmptyState title="No result yet" description="Run the model to populate this scientific canvas." action={<Button size="sm" onClick={() => setRunning(true)}>Run model</Button>} /></div></ScientificAppShell></GlobalTheme>;
}

createRoot(document.getElementById("root")!).render(<Demo />);
