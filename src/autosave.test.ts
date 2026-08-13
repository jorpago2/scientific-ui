import { describe, expect, it } from "vitest";
import {
  parseScientificAutosave,
  readScientificAutosave,
  removeScientificAutosave,
  SCIENTIFIC_AUTOSAVE_FORMAT,
  serializeScientificAutosave,
  writeScientificAutosave,
  type ScientificStorage,
} from "./autosave.js";

class MemoryStorage implements ScientificStorage {
  private values = new Map<string, string>();
  getItem(key: string) { return this.values.get(key) ?? null; }
  setItem(key: string, value: string) { this.values.set(key, value); }
  removeItem(key: string) { this.values.delete(key); }
}

describe("scientific autosave", () => {
  it("round-trips a versioned local draft", () => {
    const storage = new MemoryStorage();
    const written = writeScientificAutosave(storage, "app:draft", { wavelength: 1.55 }, 2);
    expect(written.format).toBe(SCIENTIFIC_AUTOSAVE_FORMAT);
    expect(readScientificAutosave(storage, "app:draft", 2)?.data).toEqual({ wavelength: 1.55 });
  });

  it("rejects malformed, incompatible and invalid drafts", () => {
    expect(parseScientificAutosave("not json", 1)).toBeNull();
    const versioned = serializeScientificAutosave({ wavelength: 1.55 }, 2);
    expect(parseScientificAutosave(versioned, 1)).toBeNull();
    expect(parseScientificAutosave(versioned, 2, (value): value is { wavelength: number } => Boolean(value) && typeof value === "object" && (value as { wavelength?: unknown }).wavelength === 2)).toBeNull();
  });

  it("limits draft size and clears safely", () => {
    expect(() => serializeScientificAutosave({ data: "x".repeat(100) }, 1, new Date().toISOString(), 20)).toThrow(/too large/i);
    const storage = new MemoryStorage();
    writeScientificAutosave(storage, "app:draft", { ready: true });
    removeScientificAutosave(storage, "app:draft");
    expect(storage.getItem("app:draft")).toBeNull();
  });
});
