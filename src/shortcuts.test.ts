import { describe, expect, it } from "vitest";
import { shortcutMatchesEvent } from "./shortcuts.js";

function keyboardEvent(key: string, modifiers: Partial<KeyboardEvent> = {}) {
  return { key, ctrlKey: false, metaKey: false, altKey: false, shiftKey: false, ...modifiers } as KeyboardEvent;
}

describe("shortcutMatchesEvent", () => {
  it("maps Mod to Control or Command", () => {
    expect(shortcutMatchesEvent("Mod+Enter", keyboardEvent("Enter", { ctrlKey: true }))).toBe(true);
    expect(shortcutMatchesEvent("Mod+Enter", keyboardEvent("Enter", { metaKey: true }))).toBe(true);
  });

  it("requires exact modifiers", () => {
    expect(shortcutMatchesEvent("Shift+R", keyboardEvent("r", { shiftKey: true }))).toBe(true);
    expect(shortcutMatchesEvent("Shift+R", keyboardEvent("r", { shiftKey: true, altKey: true }))).toBe(false);
  });
});
