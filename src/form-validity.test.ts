import { describe, expect, it } from "vitest";
import { updateScientificFieldValidity } from "./form-validity.js";

describe("scientific form validity", () => {
  it("tracks and clears invalid drafts without mutating the previous snapshot", () => {
    const initial = new Map<string, string>();
    const invalid = updateScientificFieldValidity(initial, "wavelength", "Use at least 0.2 µm.");
    const valid = updateScientificFieldValidity(invalid, "wavelength", null);

    expect(initial.size).toBe(0);
    expect(invalid.get("wavelength")).toBe("Use at least 0.2 µm.");
    expect(valid.size).toBe(0);
  });
});
