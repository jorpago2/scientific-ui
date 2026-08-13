import { describe, expect, it } from "vitest";
import { formatScientificValue, parseScientificNumber, validateScientificNumber } from "./number.js";

describe("formatScientificValue", () => {
  it("uses one deterministic notation contract", () => {
    expect(formatScientificValue(-0)).toBe("0");
    expect(formatScientificValue(2.438123)).toBe("2.438");
    expect(formatScientificValue(2.1e-8)).toBe("2.1e-8");
    expect(formatScientificValue(12_500)).toBe("1.25e4");
  });

  it("supports explicit scientific and standard notation", () => {
    expect(formatScientificValue(1250, { notation: "scientific", significantDigits: 3 })).toBe("1.25e3");
    expect(formatScientificValue(0.012345, { notation: "standard", significantDigits: 3 })).toBe("0.0123");
    expect(formatScientificValue(Number.NaN)).toBe("—");
  });
});

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
