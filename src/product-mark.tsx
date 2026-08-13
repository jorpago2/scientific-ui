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
      return <>
        <path fill="currentColor" stroke="none" d="M16 3.5c-2.8 3.4-4.2 5.6-4.2 7.5a4.2 4.2 0 0 0 8.4 0c0-1.9-1.4-4.1-4.2-7.5Z" />
        <ellipse cx="16" cy="19" rx="8.5" ry="3.5" />
        <path d="M8 22.5c1.8 2.4 5 3.7 8.6 3.5 3.4-.1 6.3-1.5 7.9-3.8" />
        <path fill="currentColor" stroke="none" d="m22.4 20.9 4.8-.7-1.8 4.5-3-3.8Z" />
      </>;
    case "rf-circuit":
      return <>
        <circle cx="4.5" cy="16" r="3" fill="currentColor" stroke="none" />
        <circle cx="27.5" cy="16" r="3" fill="currentColor" stroke="none" />
        <path strokeWidth="3" d="M7.5 16h1.7c2.1 0 2.3-5 4.2-5s2 10 4.1 10 2.2-10 4.1-10 2.1 5 4.2 5h1.7" />
      </>;
    case "gds-layout":
      return <>
        <path d="M4 10V4h6M22 4h6v6M4 22v6h6" />
        <path fill="currentColor" stroke="none" d="M6 6h12v12H6z" />
        <rect x="14" y="14" width="12" height="12" />
        <path d="m14 20 6-6m-6 12 12-12m-6 12 6-6" />
      </>;
    case "reflectometry":
      return <>
        <path strokeWidth="3" d="m6 5 10 11" />
        <path strokeDasharray="3 3" d="m16 16 7.5-8.2" />
        <path fill="currentColor" stroke="none" d="m21.3 6.8 5-2-1.4 5.2-3.6-3.2Z" />
        <path strokeWidth="3" d="M5 19h22M6.5 23h19M8 27h16" />
      </>;
    case "semiconductor-device":
      return <>
        <circle cx="5" cy="9" r="3" />
        <circle cx="27" cy="23" r="3" />
        <path d="M3.5 9h3M5 7.5v3M25.5 23h3" />
        <path strokeWidth="3" d="M8 9h4l4 4h3l5-4M24 23h-4l-4-4h-3l-5 4" />
        <path fill="currentColor" stroke="none" d="m10.5 6.8 4.6 2.1-3.7 3.4-.9-5.5Zm11 18.4-4.6-2.1 3.7-3.4.9 5.5Z" />
      </>;
    case "waveguide":
      return <>
        <path strokeWidth="3" d="M4 10c5 0 7-3 12-3s7 3 12 3M4 22c5 0 7 3 12 3s7-3 12-3" />
        <ellipse cx="16" cy="16" rx="5.5" ry="3.5" />
        <ellipse cx="16" cy="16" rx="2" ry="1.2" fill="currentColor" stroke="none" />
      </>;
    case "fdtd":
      return <>
        <path fill="currentColor" stroke="none" d="M4 5h5v5H4zm0 8.5h5v5H4zM4 22h5v5H4zm8.5-17h5v5h-5zm0 17h5v5h-5zM21 5h5v5h-5z" />
        <circle cx="14.5" cy="16" r="2" fill="currentColor" stroke="none" />
        <path d="M18 12.5a5 5 0 0 1 0 7M21 9.5a9 9 0 0 1 0 13" />
      </>;
    case "setup-sketch":
      return <>
        <path strokeWidth="3" d="M16 16 7 8m9 8 9-8m-9 8v10" />
        <circle cx="7" cy="8" r="3.5" fill="currentColor" stroke="none" />
        <rect x="21.5" y="4.5" width="7" height="7" fill="currentColor" stroke="none" />
        <circle cx="16" cy="27" r="3.5" fill="currentColor" stroke="none" />
        <path fill="currentColor" stroke="none" d="m16 11 5 5-5 5-5-5 5-5Z" />
      </>;
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
      strokeWidth="2.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      {...props}
    >
      {title ? <title>{title}</title> : null}
      <ProductGlyph product={product} />
    </svg>
  );
}
