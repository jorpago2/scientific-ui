import {
  CopyLink,
  DocumentAdd,
  Download,
  Reset,
  Save,
  Upload,
} from "@carbon/icons-react";
import type { HTMLAttributes } from "react";
import { ScientificCommandBar } from "./actions.js";
import type { ScientificActionDescriptor } from "./types.js";

export interface ScientificProjectActionsProps extends HTMLAttributes<HTMLDivElement> {
  onNew?: () => void;
  onOpen?: () => void;
  onSave?: () => void;
  onExport?: () => void;
  onCopyUrl?: () => void;
  onReset?: () => void;
  saveDisabled?: boolean;
  exportDisabled?: boolean;
  labels?: Partial<Record<"new" | "open" | "save" | "export" | "copyUrl" | "reset", string>>;
}

export function ScientificProjectActions({
  onNew,
  onOpen,
  onSave,
  onExport,
  onCopyUrl,
  onReset,
  saveDisabled,
  exportDisabled,
  labels = {},
  className,
  ...props
}: ScientificProjectActionsProps) {
  const actions: ScientificActionDescriptor[] = [
    ...(onNew ? [{ id: "new", label: labels.new ?? "New", icon: DocumentAdd, onClick: onNew, overflowOnly: true }] : []),
    ...(onOpen ? [{ id: "open", label: labels.open ?? "Open", icon: Upload, onClick: onOpen, collapseAt: "md" as const }] : []),
    ...(onSave ? [{ id: "save", label: labels.save ?? "Save", icon: Save, onClick: onSave, disabled: saveDisabled, emphasis: "secondary" as const, collapseAt: "sm" as const, shortcut: "Mod+S", shortcutKeys: ["Ctrl/⌘", "S"] }] : []),
    ...(onExport ? [{ id: "export", label: labels.export ?? "Export", icon: Download, onClick: onExport, disabled: exportDisabled, emphasis: "secondary" as const, collapseAt: "sm" as const }] : []),
    ...(onCopyUrl ? [{ id: "copy-url", label: labels.copyUrl ?? "Copy URL", icon: CopyLink, onClick: onCopyUrl, overflowOnly: true }] : []),
    ...(onReset ? [{ id: "reset", label: labels.reset ?? "Reset", icon: Reset, onClick: onReset, destructive: true, overflowOnly: true }] : []),
  ];
  return <ScientificCommandBar actions={actions} label="Project actions" className={["scientific-project-actions", className].filter(Boolean).join(" ")} {...props} />;
}
