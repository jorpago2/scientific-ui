import { GlobalTheme, IconButton, Theme, usePrefersDarkScheme } from "@carbon/react";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import type { ScientificThemePreference } from "./types.js";

const SCIENTIFIC_THEME_EVENT = "scientific-ui:theme-change";
const DEFAULT_THEME_STORAGE_KEY = "scientific-ui-theme";

export interface ScientificThemeContextValue {
  preference: ScientificThemePreference;
  resolvedTheme: "g10" | "g100";
  isDark: boolean;
  hasProvider: boolean;
  setPreference: (preference: ScientificThemePreference) => void;
  toggleTheme: () => void;
}

const ScientificThemeContext = createContext<ScientificThemeContextValue>({
  preference: "system",
  resolvedTheme: "g10",
  isDark: false,
  hasProvider: false,
  setPreference: () => undefined,
  toggleTheme: () => undefined,
});

export interface ScientificThemeProviderProps extends HTMLAttributes<HTMLDivElement> {
  preference?: ScientificThemePreference;
  defaultPreference?: ScientificThemePreference;
  storageKey?: string;
  onPreferenceChange?: (preference: ScientificThemePreference) => void;
  children: ReactNode;
}

function normalizeThemePreference(value: unknown): ScientificThemePreference | null {
  return value === "light" || value === "dark" || value === "system" || value === "g10" || value === "g100"
    ? value
    : null;
}

/** Carbon Contrast glyph (Apache-2.0), kept inline to avoid a separate icon chunk. */
function CarbonContrastIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 32 32" fill="currentColor" aria-hidden="true">
      <path d="M29.37 11.84a13.6 13.6 0 0 0-1.06-2.51A14.17 14.17 0 0 0 25.9 6.1a14 14 0 1 0 0 19.8 14.17 14.17 0 0 0 2.41-3.23 13.6 13.6 0 0 0 1.06-2.51 14 14 0 0 0 0-8.32ZM4 16A12 12 0 0 1 16 4v24A12 12 0 0 1 4 16Z" />
    </svg>
  );
}

/** Applies one complete Carbon theme to chrome, panels and application content. */
export function ScientificThemeProvider({
  preference: controlledPreference,
  defaultPreference = "system",
  storageKey = DEFAULT_THEME_STORAGE_KEY,
  onPreferenceChange,
  children,
  className,
  ...props
}: ScientificThemeProviderProps) {
  const [internalPreference, setInternalPreference] = useState<ScientificThemePreference>(() => {
    if (controlledPreference !== undefined || typeof window === "undefined") return defaultPreference;
    return normalizeThemePreference(window.localStorage.getItem(storageKey)) ?? defaultPreference;
  });
  const preference = controlledPreference ?? internalPreference;
  const prefersDark = usePrefersDarkScheme();
  const isDark = preference === "dark" || preference === "g100" || (preference === "system" && prefersDark);
  const resolvedTheme = isDark ? "g100" : "g10";

  useEffect(() => {
    if (controlledPreference !== undefined || typeof window === "undefined") return;
    const storedPreference = normalizeThemePreference(window.localStorage.getItem(storageKey));
    if (storedPreference) setInternalPreference(storedPreference);
  }, [controlledPreference, storageKey]);

  useEffect(() => {
    if (controlledPreference !== undefined || typeof window === "undefined") return undefined;
    const synchronizeTheme = (event: Event) => {
      const nextPreference = normalizeThemePreference((event as CustomEvent<{ preference?: unknown }>).detail?.preference);
      if (nextPreference) setInternalPreference(nextPreference);
    };
    const synchronizeStoredTheme = (event: StorageEvent) => {
      if (event.key !== storageKey) return;
      const nextPreference = normalizeThemePreference(event.newValue);
      setInternalPreference(nextPreference ?? defaultPreference);
    };
    window.addEventListener(SCIENTIFIC_THEME_EVENT, synchronizeTheme);
    window.addEventListener("storage", synchronizeStoredTheme);
    return () => {
      window.removeEventListener(SCIENTIFIC_THEME_EVENT, synchronizeTheme);
      window.removeEventListener("storage", synchronizeStoredTheme);
    };
  }, [controlledPreference, defaultPreference, storageKey]);

  const setPreference = (nextPreference: ScientificThemePreference) => {
    if (controlledPreference === undefined) setInternalPreference(nextPreference);
    onPreferenceChange?.(nextPreference);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(storageKey, nextPreference);
      window.dispatchEvent(new CustomEvent(SCIENTIFIC_THEME_EVENT, {
        detail: { preference: nextPreference },
      }));
    }
  };

  const toggleTheme = () => setPreference(isDark ? "light" : "dark");

  useEffect(() => {
    const themeClasses = ["cds--white", "cds--g10", "cds--g90", "cds--g100"];
    const roots = [document.documentElement, document.body];
    const previous = roots.map((root) => themeClasses.filter((themeClass) => root.classList.contains(themeClass)));
    roots.forEach((root) => root.classList.remove(...themeClasses));
    roots.forEach((root) => root.classList.add(`cds--${resolvedTheme}`));
    const previousColorScheme = document.documentElement.style.colorScheme;
    const previousTheme = document.documentElement.dataset.scientificTheme;
    document.documentElement.style.colorScheme = isDark ? "dark" : "light";
    document.documentElement.dataset.scientificTheme = resolvedTheme;
    window.dispatchEvent(new CustomEvent("scientific-ui:theme-applied", {
      detail: { preference, resolvedTheme, isDark },
    }));
    return () => {
      roots.forEach((root) => root.classList.remove(...themeClasses));
      roots.forEach((root, index) => root.classList.add(...previous[index]));
      document.documentElement.style.colorScheme = previousColorScheme;
      if (previousTheme === undefined) delete document.documentElement.dataset.scientificTheme;
      else document.documentElement.dataset.scientificTheme = previousTheme;
    };
  }, [isDark, preference, resolvedTheme]);

  return (
    <ScientificThemeContext.Provider value={{ preference, resolvedTheme, isDark, hasProvider: true, setPreference, toggleTheme }}>
      <GlobalTheme theme={resolvedTheme}>
        <Theme
          theme={resolvedTheme}
          className={["scientific-theme", className].filter(Boolean).join(" ")}
          data-scientific-theme={resolvedTheme}
          {...props}
        >
          {children}
        </Theme>
      </GlobalTheme>
    </ScientificThemeContext.Provider>
  );
}

export function useScientificTheme() {
  return useContext(ScientificThemeContext);
}

export interface ScientificThemeToggleProps {
  className?: string;
  lightLabel?: string;
  darkLabel?: string;
}

/** Carbon header action that switches the complete application theme. */
export function ScientificThemeToggle({
  className,
  lightLabel = "Use light theme",
  darkLabel = "Use dark theme",
}: ScientificThemeToggleProps) {
  const { hasProvider, isDark, toggleTheme } = useScientificTheme();
  if (!hasProvider) return null;
  const label = isDark ? lightLabel : darkLabel;
  return (
    <IconButton
      type="button"
      kind="ghost"
      size="lg"
      align="bottom-end"
      label={label}
      className={["scientific-theme-toggle", className].filter(Boolean).join(" ")}
      aria-pressed={isDark}
      onClick={toggleTheme}
    >
      <CarbonContrastIcon />
    </IconButton>
  );
}
