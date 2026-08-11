import {
  ArrowsHorizontal,
  CenterToFit,
  ZoomFit,
  ZoomIn,
  ZoomOut,
  ZoomReset,
} from "@carbon/icons-react";
import type { HTMLAttributes } from "react";
import { ScientificCommandBar } from "./actions.js";
import type { ScientificActionDescriptor } from "./types.js";

export interface ScientificViewportToolbarProps extends HTMLAttributes<HTMLDivElement> {
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onFitWidth?: () => void;
  onFitSelection?: () => void;
  onFitAll: () => void;
  onReset?: () => void;
  selectionAvailable?: boolean;
  additionalActions?: readonly ScientificActionDescriptor[];
  label?: string;
}

/** Shared viewport commands; canvas and coordinate transforms remain local. */
export function ScientificViewportToolbar({
  onZoomIn,
  onZoomOut,
  onFitWidth,
  onFitSelection,
  onFitAll,
  onReset,
  selectionAvailable = false,
  additionalActions = [],
  label = "Viewport controls",
  className,
  ...props
}: ScientificViewportToolbarProps) {
  const actions: ScientificActionDescriptor[] = [
    ...(onZoomIn ? [{ id: "zoom-in", label: "Zoom in", icon: ZoomIn, onClick: onZoomIn, collapseAt: "sm" as const }] : []),
    ...(onZoomOut ? [{ id: "zoom-out", label: "Zoom out", icon: ZoomOut, onClick: onZoomOut, collapseAt: "sm" as const }] : []),
    ...(onFitWidth ? [{ id: "fit-width", label: "Fit width", icon: ArrowsHorizontal, onClick: onFitWidth, collapseAt: "md" as const }] : []),
    ...(onFitSelection ? [{
      id: "fit-selection",
      label: "Fit selection",
      icon: CenterToFit,
      onClick: onFitSelection,
      disabled: !selectionAvailable,
      disabledReason: "Select an item first",
      collapseAt: "md" as const,
    }] : []),
    { id: "fit-all", label: "Fit all", icon: ZoomFit, onClick: onFitAll, emphasis: "secondary" },
    ...(onReset ? [{ id: "reset-view", label: "Reset view", icon: ZoomReset, onClick: onReset, overflowOnly: true }] : []),
    ...additionalActions,
  ];
  return <ScientificCommandBar actions={actions} label={label} size="sm" responsiveTo="container" className={["scientific-viewport-toolbar", className].filter(Boolean).join(" ")} {...props} />;
}
