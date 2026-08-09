import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "@carbon/react";
import { useRef, useState } from "react";
import {
  ExportReceipt,
  InspectorPanel,
  ResultSwitcher,
  ScientificNumberField,
  ScientificStatus,
  ValidationSummary,
} from "./components";

function ComponentCatalogue() {
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [resultView, setResultView] = useState("field");
  const [value, setValue] = useState<number | null>(1e16);
  const triggerRef = useRef<HTMLButtonElement>(null);
  return <main style={{ display: "grid", gap: "1.5rem", padding: "1rem", maxWidth: "48rem" }}>
    <h1>Scientific interface components</h1>
    <ScientificStatus status={{ state: "validated", label: "Validated", detail: "All numerical checks passed." }} />
    <ScientificNumberField id="carrier-density" labelText="Carrier density" value={value ?? ""} unit="cm⁻³" min={0} onValueChange={setValue} helperText="Scientific notation is accepted." />
    <ValidationSummary messages={[{ id: "mesh", severity: "warning", title: "Mesh requires review", detail: "Refine the active region before publication-quality export." }]} />
    <ResultSwitcher activeId={resultView} onChange={setResultView} options={[{ id: "field", label: "Field" }, { id: "spectrum", label: "Spectrum" }]} />
    <ExportReceipt fileName="result.csv" format="CSV" destination="Downloads" />
    <Button ref={triggerRef} onClick={() => setInspectorOpen(true)}>Open inspector</Button>
    <InspectorPanel open={inspectorOpen} title="Result inspector" onClose={() => setInspectorOpen(false)} triggerRef={triggerRef}>
      <p>Escape closes this sheet and restores focus to the trigger.</p>
    </InspectorPanel>
  </main>;
}

const meta = { title: "Components/Scientific controls", component: ComponentCatalogue } satisfies Meta<typeof ComponentCatalogue>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Catalogue: Story = {};
