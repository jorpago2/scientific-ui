import type { ReactNode } from "react";

export type ScientificState =
  | "needs-input"
  | "ready"
  | "running"
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
  disabled?: boolean;
  disabledReason?: string;
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
