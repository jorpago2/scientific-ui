import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export const SCIENTIFIC_AUTOSAVE_FORMAT = "scientific-ui/autosave@1";

export interface ScientificAutosaveEnvelope<T> {
  format: typeof SCIENTIFIC_AUTOSAVE_FORMAT;
  schemaVersion: number;
  savedAt: string;
  data: T;
}

export interface ScientificStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export type ScientificAutosavePhase = "idle" | "saving" | "saved" | "unavailable" | "error";

export interface ScientificAutosaveOptions<T> {
  storageKey: string;
  value: T;
  onRestore: (value: T) => void;
  schemaVersion?: number;
  debounceMs?: number;
  enabled?: boolean;
  maxBytes?: number;
  validate?: (value: unknown) => value is T;
  shouldSave?: (value: T) => boolean;
  storage?: ScientificStorage | null;
  initialRecovery?: ScientificAutosaveEnvelope<T> | null;
}

export interface ScientificAutosaveController<T> {
  recovery: ScientificAutosaveEnvelope<T> | null;
  status: ScientificAutosavePhase;
  lastSavedAt: string | null;
  error: string | null;
  restore: () => void;
  discard: () => void;
  clear: () => void;
}

function browserStorage(): ScientificStorage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function serializedByteLength(value: string) {
  return new TextEncoder().encode(value).byteLength;
}

function alwaysSave() {
  return true;
}

export function serializeScientificAutosave<T>(data: T, schemaVersion = 1, savedAt = new Date().toISOString(), maxBytes = 1_500_000) {
  const serialized = JSON.stringify({ format: SCIENTIFIC_AUTOSAVE_FORMAT, schemaVersion, savedAt, data });
  if (serializedByteLength(serialized) > maxBytes) throw new Error("The local draft is too large to save safely.");
  return serialized;
}

export function parseScientificAutosave<T>(serialized: string, schemaVersion = 1, validate?: (value: unknown) => value is T, maxBytes = 1_500_000): ScientificAutosaveEnvelope<T> | null {
  if (serializedByteLength(serialized) > maxBytes) return null;
  let value: unknown;
  try {
    value = JSON.parse(serialized);
  } catch {
    return null;
  }
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const candidate = value as Partial<ScientificAutosaveEnvelope<unknown>>;
  if (candidate.format !== SCIENTIFIC_AUTOSAVE_FORMAT || candidate.schemaVersion !== schemaVersion || typeof candidate.savedAt !== "string") return null;
  if (!Number.isFinite(Date.parse(candidate.savedAt))) return null;
  if (validate && !validate(candidate.data)) return null;
  return candidate as ScientificAutosaveEnvelope<T>;
}

export function readScientificAutosave<T>(storage: ScientificStorage | null, storageKey: string, schemaVersion = 1, validate?: (value: unknown) => value is T, maxBytes = 1_500_000) {
  if (!storage) return null;
  try {
    const serialized = storage.getItem(storageKey);
    return serialized ? parseScientificAutosave<T>(serialized, schemaVersion, validate, maxBytes) : null;
  } catch {
    return null;
  }
}

export function writeScientificAutosave<T>(storage: ScientificStorage, storageKey: string, data: T, schemaVersion = 1, maxBytes = 1_500_000) {
  const serialized = serializeScientificAutosave(data, schemaVersion, new Date().toISOString(), maxBytes);
  storage.setItem(storageKey, serialized);
  return parseScientificAutosave<T>(serialized, schemaVersion, undefined, maxBytes)!;
}

export function removeScientificAutosave(storage: ScientificStorage | null, storageKey: string) {
  try {
    storage?.removeItem(storageKey);
  } catch {
    // Storage can be blocked by browser policy. Clearing a draft must remain safe.
  }
}

/**
 * Debounced local persistence that never overwrites an unread recovery draft.
 * The initial application defaults are treated as a baseline and are not saved
 * until the user changes something or restores a previous session.
 */
export function useScientificAutosave<T>({
  storageKey,
  value,
  onRestore,
  schemaVersion = 1,
  debounceMs = 750,
  enabled = true,
  maxBytes = 1_500_000,
  validate,
  shouldSave = alwaysSave,
  storage: providedStorage,
  initialRecovery = null,
}: ScientificAutosaveOptions<T>): ScientificAutosaveController<T> {
  const storage = useMemo(() => providedStorage === undefined ? browserStorage() : providedStorage, [providedStorage]);
  const [recovery, setRecovery] = useState<ScientificAutosaveEnvelope<T> | null>(() => readScientificAutosave(storage, storageKey, schemaVersion, validate, maxBytes) ?? initialRecovery);
  const [status, setStatus] = useState<ScientificAutosavePhase>(() => storage ? "idle" : "unavailable");
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const initialFingerprint = useRef<string | null>(null);
  const restored = useRef(false);
  const decisionMade = useRef(recovery === null);
  const valueFingerprint = useMemo(() => {
    try {
      return JSON.stringify(value);
    } catch {
      return null;
    }
  }, [value]);

  if (initialFingerprint.current === null && valueFingerprint !== null) initialFingerprint.current = valueFingerprint;

  useEffect(() => {
    if (!enabled || !storage || !decisionMade.current || recovery || valueFingerprint === null || !shouldSave(value)) return;
    if (!restored.current && valueFingerprint === initialFingerprint.current) return;
    setStatus("saving");
    setError(null);
    const timer = window.setTimeout(() => {
      try {
        const record = writeScientificAutosave(storage, storageKey, value, schemaVersion, maxBytes);
        setLastSavedAt(record.savedAt);
        setStatus("saved");
      } catch (reason) {
        setError(reason instanceof Error ? reason.message : "The local draft could not be saved.");
        setStatus("error");
      }
    }, debounceMs);
    return () => window.clearTimeout(timer);
  }, [debounceMs, enabled, maxBytes, recovery, schemaVersion, shouldSave, storage, storageKey, value, valueFingerprint]);

  const restore = useCallback(() => {
    if (!recovery) return;
    onRestore(recovery.data);
    restored.current = true;
    decisionMade.current = true;
    setLastSavedAt(recovery.savedAt);
    setRecovery(null);
    setStatus("saved");
    setError(null);
  }, [onRestore, recovery]);

  const discard = useCallback(() => {
    removeScientificAutosave(storage, storageKey);
    decisionMade.current = true;
    initialFingerprint.current = valueFingerprint;
    setRecovery(null);
    setLastSavedAt(null);
    setStatus(storage ? "idle" : "unavailable");
    setError(null);
  }, [storage, storageKey, valueFingerprint]);

  const clear = useCallback(() => {
    removeScientificAutosave(storage, storageKey);
    setLastSavedAt(null);
    setStatus(storage ? "idle" : "unavailable");
    setError(null);
  }, [storage, storageKey]);

  return { recovery, status, lastSavedAt, error, restore, discard, clear };
}
