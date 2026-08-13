import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ScientificProductMark, type ScientificProductIcon } from "./product-mark.js";

const products: ScientificProductIcon[] = [
  "spin-coating", "rf-circuit", "gds-layout", "reflectometry",
  "semiconductor-device", "waveguide", "fdtd", "setup-sketch",
];

describe("ScientificProductMark", () => {
  it.each(products)("renders the %s mark with the shared geometry", (product) => {
    const markup = renderToStaticMarkup(createElement(ScientificProductMark, { product }));
    expect(markup).toContain('viewBox="0 0 32 32"');
    expect(markup).toContain('stroke-width="2.25"');
    expect(markup).toContain('aria-hidden="true"');
  });
});
