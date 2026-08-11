import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { ScientificShortcutDescriptor } from "./types.js";

interface ScientificShortcutRegistry {
  register: (shortcut: ScientificShortcutDescriptor) => () => void;
}

const ShortcutRegistryContext = createContext<ScientificShortcutRegistry | null>(null);
const ShortcutSnapshotContext = createContext<readonly ScientificShortcutDescriptor[]>([]);

function isEditableTarget(target: EventTarget | null) {
  return target instanceof HTMLElement
    && (target.matches("input, select, textarea, [role='textbox']") || target.isContentEditable);
}

function normaliseKey(value: string) {
  const key = value.trim().toLowerCase();
  if (key === "cmd" || key === "command" || key === "⌘") return "meta";
  if (key === "control" || key === "⌃") return "ctrl";
  if (key === "option" || key === "⌥") return "alt";
  if (key === "return") return "enter";
  return key;
}

export function shortcutMatchesEvent(shortcut: string, event: KeyboardEvent) {
  const tokens = shortcut.split("+").map(normaliseKey).filter(Boolean);
  const expectedKey = tokens.find((token) => !["mod", "ctrl", "meta", "alt", "shift"].includes(token));
  const expectsMod = tokens.includes("mod");
  const expectsCtrl = tokens.includes("ctrl") || (expectsMod && !event.metaKey);
  const expectsMeta = tokens.includes("meta") || (expectsMod && event.metaKey);
  const expectsAlt = tokens.includes("alt");
  const expectsShift = tokens.includes("shift");
  const keyMatches = expectedKey === undefined || normaliseKey(event.key) === expectedKey;

  return keyMatches
    && event.ctrlKey === expectsCtrl
    && event.metaKey === expectsMeta
    && event.altKey === expectsAlt
    && event.shiftKey === expectsShift;
}

export interface ScientificShortcutProviderProps {
  children: ReactNode;
}

/** One keyboard listener and one conflict policy for the whole application. */
export function ScientificShortcutProvider({ children }: ScientificShortcutProviderProps) {
  const shortcutsRef = useRef(new Map<string, ScientificShortcutDescriptor>());
  const [snapshot, setSnapshot] = useState<readonly ScientificShortcutDescriptor[]>([]);

  const publish = useCallback(() => {
    setSnapshot(Array.from(shortcutsRef.current.values()).sort((left, right) =>
      (right.priority ?? 0) - (left.priority ?? 0)));
  }, []);

  const register = useCallback((shortcut: ScientificShortcutDescriptor) => {
    shortcutsRef.current.set(shortcut.id, shortcut);
    publish();
    return () => {
      if (shortcutsRef.current.get(shortcut.id) === shortcut) {
        shortcutsRef.current.delete(shortcut.id);
        publish();
      }
    };
  }, [publish]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.repeat) return;
      const registered = Array.from(shortcutsRef.current.values())
        .filter((shortcut) => shortcut.enabled !== false)
        .sort((left, right) => (right.priority ?? 0) - (left.priority ?? 0));
      const match = registered.find((shortcut) =>
        (shortcut.allowInEditable || !isEditableTarget(event.target))
        && shortcutMatchesEvent(shortcut.shortcut, event));
      if (!match) return;
      event.preventDefault();
      match.handler(event);
    };
    document.addEventListener("keydown", onKeyDown, true);
    return () => document.removeEventListener("keydown", onKeyDown, true);
  }, []);

  const registry = useMemo(() => ({ register }), [register]);
  return (
    <ShortcutRegistryContext.Provider value={registry}>
      <ShortcutSnapshotContext.Provider value={snapshot}>{children}</ShortcutSnapshotContext.Provider>
    </ShortcutRegistryContext.Provider>
  );
}

export function useScientificShortcuts() {
  return useContext(ShortcutSnapshotContext);
}

export function useScientificShortcut(shortcut: ScientificShortcutDescriptor | null) {
  const registry = useContext(ShortcutRegistryContext);
  useEffect(() => {
    if (!registry || !shortcut) return undefined;
    return registry.register(shortcut);
  }, [registry, shortcut]);
}

/** Used by descriptor-driven shared controls without creating one listener per action. */
export function useScientificShortcutRegistration(shortcuts: readonly ScientificShortcutDescriptor[]) {
  const registry = useContext(ShortcutRegistryContext);
  useEffect(() => {
    if (!registry) return undefined;
    const unregister = shortcuts.map((shortcut) => registry.register(shortcut));
    return () => unregister.forEach((cleanup) => cleanup());
  }, [registry, shortcuts]);
}
