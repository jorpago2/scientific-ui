import type { Meta, StoryObj } from "@storybook/react-vite";
import { ScientificProductMark, type ScientificProductIcon } from "./product-mark";

const products: Array<{ id: ScientificProductIcon; label: string }> = [
  { id: "spin-coating", label: "Spin coating" },
  { id: "rf-circuit", label: "RF circuit" },
  { id: "gds-layout", label: "GDS layout" },
  { id: "reflectometry", label: "Reflectometry" },
  { id: "semiconductor-device", label: "Semiconductor device" },
  { id: "waveguide", label: "Waveguide" },
  { id: "fdtd", label: "FDTD" },
  { id: "setup-sketch", label: "Setup sketch" },
];

function ProductMarkFamily() {
  return <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(9rem, 1fr))", gap: "1rem" }}>
    {products.map(({ id, label }) => <figure key={id} style={{ margin: 0, display: "grid", gap: ".5rem" }}>
      <div style={{ width: "2rem", height: "2rem", display: "grid", placeItems: "center", color: "white", background: "#161616" }}>
        <ScientificProductMark product={id} />
      </div>
      <figcaption>{label}</figcaption>
    </figure>)}
  </div>;
}

const meta = { title: "Brand/Product marks", component: ProductMarkFamily } satisfies Meta<typeof ProductMarkFamily>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Family: Story = {};
