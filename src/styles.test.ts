import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const styles = readFileSync(fileURLToPath(new URL("./styles.css", import.meta.url)), "utf8");

describe("scientific typography contract", () => {
  it("uses the shared mono token for inputs, values, coordinates and identifiers", () => {
    expect(styles).toMatch(/\.scientific-number-field input,[\s\S]*\.scientific-value,[\s\S]*\.scientific-coordinate,[\s\S]*\.scientific-identifier \{[\s\S]*font-family: var\(--scientific-ui-font-mono\);[\s\S]*font-variant-numeric: tabular-nums;/);
  });

  it("uses mono tabular numerals for metric values", () => {
    expect(styles).toMatch(/\.scientific-metric dd \{[\s\S]*font-family: var\(--scientific-ui-font-mono\);[\s\S]*font-variant-numeric: tabular-nums;/);
  });
});
