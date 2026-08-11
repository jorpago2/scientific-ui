import type { ReactNode } from "react";
import { ScientificNotificationProvider } from "./notifications.js";
import { ScientificShortcutProvider } from "./shortcuts.js";
import { ScientificThemeProvider } from "./theme.js";
import type { ScientificThemePreference } from "./types.js";

export interface ScientificUiProviderProps {
  children: ReactNode;
  theme?: ScientificThemePreference;
  notificationTimeout?: number;
}

/** Recommended root provider for theme, shortcuts and transient feedback. */
export function ScientificUiProvider({
  children,
  theme = "light",
  notificationTimeout,
}: ScientificUiProviderProps) {
  return (
    <ScientificThemeProvider preference={theme}>
      <ScientificShortcutProvider>
        <ScientificNotificationProvider defaultTimeout={notificationTimeout}>
          {children}
        </ScientificNotificationProvider>
      </ScientificShortcutProvider>
    </ScientificThemeProvider>
  );
}
