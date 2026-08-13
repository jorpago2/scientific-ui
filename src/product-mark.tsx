import type { SVGAttributes } from "react";

export type ScientificProductIcon =
  | "spin-coating"
  | "rf-circuit"
  | "gds-layout"
  | "reflectometry"
  | "semiconductor-device"
  | "waveguide"
  | "fdtd"
  | "setup-sketch";

export interface ScientificProductMarkProps extends SVGAttributes<SVGSVGElement> {
  product: ScientificProductIcon;
  title?: string;
}

function ProductGlyph({ product }: { product: ScientificProductIcon }) {
  switch (product) {
    case "spin-coating":
      return <><path d="M16 4s-4 4.4-4 7a4 4 0 0 0 8 0c0-2.6-4-7-4-7Z" /><ellipse cx="16" cy="22" rx="9" ry="4" /><path d="M10 18.5c1.4-1.1 3.5-1.7 6-1.7s4.6.6 6 1.7M16 17v9" /></>;
    case "rf-circuit":
      return <><circle cx="4.5" cy="16" r="2" /><circle cx="27.5" cy="16" r="2" /><path d="M6.5 16h2.25c1.8 0 2.25-5 4.25-5s2.5 10 4.5 10 2.5-10 4.5-10 2.2 5 3.5 5h2" /></>;
    case "gds-layout":
      return <><path d="M5 6h14v14H5zM13 12h14v14H13z" /><path d="M9 10h6v6H9zM17 16h6v6h-6z" /></>;
    case "reflectometry":
      return <><path d="M5 25h22M7 21h18M9 17h14" /><path d="m7 5 9 12 9-12M13 12l3 5 3-5" /><path d="m8.5 9-1.5-4 4.2.5M23.5 9 25 5l-4.2.5" /></>;
    case "semiconductor-device":
      return <><path d="M13 7v18M13 11H8L4 7M13 21H8l-4 4M13 12l10-5v8M13 20l10 5v-8" /><path d="m19.5 21.3 3.5 3.7-.4-5.1" /></>;
    case "waveguide":
      return <><rect x="4" y="9" width="24" height="14" rx="2" /><path d="M5 16h2.5c2.3 0 2.3-5 4.6-5s2.3 10 4.6 10 2.3-10 4.6-10 2.3 5 4.7 5h1" /></>;
    case "fdtd":
      return <><path d="M5 5h22v22H5zM12.3 5v22M19.7 5v22M5 12.3h22M5 19.7h22" /><path d="M5 16h3c2 0 2-5 4-5s2 10 4 10 2-10 4-10 2 5 4 5h3" /></>;
    case "setup-sketch":
      return <><path d="m8 9 8 7 8-8M8 9l1 14 7-7 8 8" /><rect x="4" y="5" width="8" height="8" /><circle cx="24" cy="8" r="4" /><path d="m16 12 4 4-4 4-4-4 4-4ZM20 20h8v8h-8zM5 20h8v8H5z" /></>;
  }
}

/** A compact, monochrome product image designed for the shared Carbon header. */
export function ScientificProductMark({ product, title, className, ...props }: ScientificProductMarkProps) {
  return (
    <svg
      className={["scientific-product-mark", className].filter(Boolean).join(" ")}
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="square"
      strokeLinejoin="miter"
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      {...props}
    >
      {title ? <title>{title}</title> : null}
      <ProductGlyph product={product} />
    </svg>
  );
}
