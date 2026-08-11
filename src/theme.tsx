import { GlobalTheme, Theme, usePrefersDarkScheme } from "@carbon/react";
import { createContext, useContext, useEffect, type HTMLAttributes, type ReactNode } from "react";
import type { ScientificThemePreference } from "./types.js";

interface ScientificThemeContextValue {
  preference: ScientificThemePreference;
  resolvedTheme: "g10" | "g100";
  isDark: boolean;
}

const ScientificThemeContext = createContext<ScientificThemeContextValue>({
  preference: "light",
  resolvedTheme: "g10",
  isDark: false,
});

export interface ScientificThemeProviderProps extends HTMLAttributes<HTMLDivElement> {
  preference?: ScientificThemePreference;
  children: ReactNode;
}

/** Applies one complete Carbon theme to chrome, panels and application content. */
export function ScientificThemeProvider({
  preference = "light",
  children,
  className,
  ...props
}: ScientificThemeProviderProps) {
  const prefersDark = usePrefersDarkScheme();
  const isDark = preference === "dark" || preference === "g100" || (preference === "system" && prefersDark);
  const resolvedTheme = isDark ? "g100" : "g10";
  useEffect(() => {
    const themeClasses = ["cds--white", "cds--g10", "cds--g90", "cds--g100"];
    const roots = [document.documentElement, document.body];
    const previous = roots.map((root) => themeClasses.filter((themeClass) => root.classList.contains(themeClass)));
    roots.forEach((root) => root.classList.remove(...themeClasses));
    document.documentElement.classList.add(`cds--${resolvedTheme}`);
    return () => {
      roots.forEach((root) => root.classList.remove(...themeClasses));
      roots.forEach((root, index) => root.classList.add(...previous[index]));
    };
  }, [resolvedTheme]);
  return (
    <ScientificThemeContext.Provider value={{ preference, resolvedTheme, isDark }}>
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
