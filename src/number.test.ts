import { describe, expect, it } from "vitest";
import { parseScientificNumber, validateScientificNumber } from "./number.js";

describe("parseScientificNumber", () => {
  it("accepts decimal and scientific notation", () => {
    expect(parseScientificNumber("1.5e-6")).toBe(1.5e-6);
    expect(parseScientificNumber("-2,75E3")).toBe(-2750);
  });

  it("rejects non-finite or partial values", () => {
    expect(parseScientificNumber("Infinity")).toBeNull();
    expect(parseScientificNumber("1e")).toBeNull();
  });

  it("validates bounds", () => {
    expect(validateScientificNumber("-1", { min: 0 })).toContain("greater than or equal");
    expect(validateScientificNumber("11", { max: 10 })).toContain("less than or equal");
    expect(validateScientificNumber("5", { min: 0, max: 10 })).toBeNull();
  });
});
