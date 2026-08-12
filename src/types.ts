import type { ComponentType, ReactNode } from "react";

export type ScientificState =
  | "needs-input"
  | "ready"
  | "running"
  | "paused"
  | "up-to-date"
  | "modified"
  | "validated"
  | "warning"
  | "failed";

export interface WorkflowItem {
  id: string;
  label: string;
  icon?: ReactNode;
  controlsId: string;
  triggerId?: string;
  disabled?: boolean;
  disabledReason?: string;
  status?: "loading" | "error" | "success";
  statusLabel?: string;
  className?: string;
  dataAttributes?: Record<`data-${string}`, string>;
}

export interface ScientificStatusDescriptor {
  state: ScientificState;
  label: string;
  progress?: number;
  detail?: string;
}

export interface ValidationMessage {
  id: string;
  title: string;
  detail?: string;
  severity: "info" | "success" | "warning" | "error";
}

export interface ResultOption {
  id: string;
  label: string;
  disabled?: boolean;
}

export type ScientificActionEmphasis = "primary" | "secondary" | "tertiary" | "ghost";
export type ScientificActionCollapseAt = "sm" | "md" | "lg" | "never";

export interface ScientificIconProps {
  size?: number | string;
  className?: string;
  "aria-hidden"?: boolean | "true" | "false";
}

/**
 * Presentation-only description of an application command. Scientific
 * algorithms stay behind `onClick`; the design system owns placement,
 * responsive overflow, iconography and accessible naming.
 */
export interface ScientificActionDescriptor {
  id: string;
  label: string;
  shortLabel?: string;
  icon?: ComponentType<ScientificIconProps>;
  onClick: () => void;
  emphasis?: ScientificActionEmphasis;
  collapseAt?: ScientificActionCollapseAt;
  overflowOnly?: boolean;
  disabled?: boolean;
  disabledReason?: string;
  destructive?: boolean;
  pressed?: boolean;
  shortcut?: string;
  shortcutKeys?: readonly string[];
}

export interface ScientificExecutionDescriptor extends ScientificStatusDescriptor {
  onRun: () => void;
  onPause?: () => void;
  onStop?: () => void;
  runLabel?: string;
  resumeLabel?: string;
  pauseLabel?: string;
  stopLabel?: string;
  disabled?: boolean;
  disabledReason?: string;
}

export interface ScientificMetricDescriptor {
  id: string;
  label: ReactNode;
  value: ReactNode;
  unit?: ReactNode;
  detail?: ReactNode;
  status?: "neutral" | "success" | "warning" | "error";
}

/**
 * Evidence state for a preflight or validation check. `passed` means that one
 * check passed; it never implies that the complete result is validated.
 */
export type ScientificCheckState =
  | "not-run"
  | "ready"
  | "running"
  | "passed"
  | "warning"
  | "failed"
  | "not-applicable";

export interface ScientificCheckDescriptor {
  id: string;
  label: ReactNode;
  state: ScientificCheckState;
  detail?: ReactNode;
  value?: ReactNode;
}

export interface ScientificProvenanceItem {
  id: string;
  label: ReactNode;
  value: ReactNode;
  detail?: ReactNode;
}

export interface ScientificLegendItem {
  id: string;
  label: ReactNode;
  color?: string;
  symbol?: ReactNode;
  detail?: ReactNode;
}

export interface ScientificShortcutDescriptor {
  id: string;
  shortcut: string;
  description: ReactNode;
  handler: (event: KeyboardEvent) => void;
  displayKeys?: readonly string[];
  enabled?: boolean;
  allowInEditable?: boolean;
  priority?: number;
}

export type ScientificThemePreference = "light" | "dark" | "system" | "g10" | "g100";

export interface ScientificNotificationDescriptor {
  id: string;
  kind: "info" | "info-square" | "success" | "warning" | "warning-alt" | "error";
  title: string;
  subtitle?: string;
  caption?: string;
  timeout?: number;
}
