import type { ReactNode } from "react";
import { ScientificNotificationProvider } from "./notifications.js";
import { ScientificShortcutProvider } from "./shortcuts.js";
import { ScientificThemeProvider } from "./theme.js";
import type { ScientificThemePreference } from "./types.js";

export interface ScientificUiProviderProps {
  children: ReactNode;
  theme?: ScientificThemePreference;
  themeStorageKey?: string;
  notificationTimeout?: number;
}

/** Recommended root provider for theme, shortcuts and transient feedback. */
export function ScientificUiProvider({
  children,
  theme,
  themeStorageKey,
  notificationTimeout,
}: ScientificUiProviderProps) {
  return (
    <ScientificThemeProvider
      {...(theme === undefined ? {} : { preference: theme })}
      {...(themeStorageKey === undefined ? {} : { storageKey: themeStorageKey })}
    >
      <ScientificShortcutProvider>
        <ScientificNotificationProvider defaultTimeout={notificationTimeout}>
          {children}
        </ScientificNotificationProvider>
      </ScientificShortcutProvider>
    </ScientificThemeProvider>
  );
}
