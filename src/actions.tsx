import { Button, OverflowMenu, OverflowMenuItem, ProgressBar } from "@carbon/react";
import { Pause, Play, StopFilled } from "@carbon/icons-react";
import { useEffect, useMemo, useRef, useState, type HTMLAttributes } from "react";
import { useScientificShortcutRegistration } from "./shortcuts.js";
import type {
  ScientificActionDescriptor,
  ScientificExecutionDescriptor,
  ScientificShortcutDescriptor,
} from "./types.js";

function joinClassNames(...values: Array<string | undefined | false>) {
  return values.filter(Boolean).join(" ");
}

function actionKind(action: ScientificActionDescriptor) {
  if (action.destructive) {
    return action.emphasis === "primary" ? "danger" : "danger--tertiary";
  }
  return action.emphasis ?? "ghost";
}

export interface ScientificCommandBarProps extends HTMLAttributes<HTMLDivElement> {
  actions: readonly ScientificActionDescriptor[];
  label?: string;
  size?: "sm" | "md" | "lg";
  overflowLabel?: string;
  responsiveTo?: "viewport" | "container";
}

/**
 * Canonical responsive action hierarchy. Actions collapse into Carbon's
 * OverflowMenu at declared breakpoints without changing their handlers.
 */
export function ScientificCommandBar({
  actions,
  label = "Actions",
  size = "md",
  overflowLabel = "More actions",
  responsiveTo = "viewport",
  className,
  ...props
}: ScientificCommandBarProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [availableWidth, setAvailableWidth] = useState<number | null>(null);
  useEffect(() => {
    const container = containerRef.current?.parentElement;
    if (responsiveTo !== "container" || !container || typeof ResizeObserver === "undefined") return undefined;
    const observer = new ResizeObserver(([entry]) => setAvailableWidth(entry?.contentRect.width ?? null));
    observer.observe(container);
    return () => observer.disconnect();
  }, [responsiveTo]);

  const shortcutDescriptors = useMemo<ScientificShortcutDescriptor[]>(() => actions
    .filter((action) => action.shortcut)
    .map((action) => ({
      id: `action:${action.id}`,
      shortcut: action.shortcut!,
      displayKeys: action.shortcutKeys,
      description: action.label,
      handler: action.onClick,
      enabled: !action.disabled,
    })), [actions]);
  useScientificShortcutRegistration(shortcutDescriptors);

  const actionIsCollapsed = (action: ScientificActionDescriptor) => {
    if (action.overflowOnly) return true;
    if (responsiveTo !== "container" || availableWidth === null || !action.collapseAt || action.collapseAt === "never") return false;
    const threshold = { sm: 480, md: 672, lg: 1056 }[action.collapseAt];
    return availableWidth < threshold;
  };
  const overflowActions = responsiveTo === "container"
    ? actions.filter(actionIsCollapsed)
    : actions.filter((action) => action.overflowOnly || (action.collapseAt && action.collapseAt !== "never"));
  const collapsePoints = new Set(overflowActions.map((action) => action.collapseAt).filter(Boolean));
  const hasPermanentOverflow = overflowActions.some((action) => action.overflowOnly);

  return (
    <div
      ref={containerRef}
      className={joinClassNames("scientific-command-bar", className)}
      role="group"
      aria-label={label}
      data-available-width={availableWidth === null ? undefined : Math.round(availableWidth)}
      data-responsive-to={responsiveTo}
      data-overflow-sm={collapsePoints.has("sm") || undefined}
      data-overflow-md={collapsePoints.has("md") || undefined}
      data-overflow-lg={collapsePoints.has("lg") || undefined}
      {...props}
    >
      {actions.filter((action) => !action.overflowOnly && !(responsiveTo === "container" && actionIsCollapsed(action))).map((action) => {
        const Icon = action.icon;
        return (
          <Button
            key={action.id}
            type="button"
            size={size}
            kind={actionKind(action)}
            renderIcon={Icon}
            disabled={action.disabled}
            title={action.disabled ? action.disabledReason : undefined}
            aria-pressed={action.pressed}
            aria-keyshortcuts={action.shortcut}
            data-collapse-at={action.collapseAt ?? "never"}
            className="scientific-command-bar__action"
            onClick={action.onClick}
          >
            <span className="scientific-command-bar__label">{action.label}</span>
            {action.shortLabel && <span className="scientific-command-bar__short-label">{action.shortLabel}</span>}
          </Button>
        );
      })}
      {overflowActions.length > 0 && (
        <OverflowMenu
          className={joinClassNames(
            "scientific-command-bar__overflow",
            responsiveTo === "container" && "scientific-command-bar__overflow--active",
            responsiveTo === "viewport" && hasPermanentOverflow && "scientific-command-bar__overflow--permanent",
          )}
          aria-label={overflowLabel}
          iconDescription={overflowLabel}
          size={size}
          direction="bottom"
          flipped
        >
          {overflowActions.map((action) => (
            <OverflowMenuItem
              key={action.id}
              itemText={action.label}
              disabled={action.disabled}
              title={action.disabled ? action.disabledReason : action.label}
              isDelete={action.destructive}
              aria-keyshortcuts={action.shortcut}
              data-collapse-at={responsiveTo === "container" || action.overflowOnly ? "always" : action.collapseAt}
              className="scientific-command-bar__overflow-item"
              onClick={action.onClick}
            />
          ))}
        </OverflowMenu>
      )}
    </div>
  );
}

export interface ScientificRunControlProps extends HTMLAttributes<HTMLDivElement> {
  execution: ScientificExecutionDescriptor;
  size?: "sm" | "md" | "lg";
}

export function ScientificRunControl({ execution, size = "md", className, ...props }: ScientificRunControlProps) {
  const running = execution.state === "running";
  const paused = execution.state === "paused";
  const actions = useMemo<ScientificActionDescriptor[]>(() => {
    if (running) {
      return [
        ...(execution.onPause ? [{
          id: "pause",
          label: execution.pauseLabel ?? "Pause",
          icon: Pause,
          emphasis: "secondary" as const,
          collapseAt: "sm" as const,
          onClick: execution.onPause,
        }] : []),
        ...(execution.onStop ? [{
          id: "stop",
          label: execution.stopLabel ?? "Stop",
          icon: StopFilled,
          emphasis: "primary" as const,
          destructive: true,
          onClick: execution.onStop,
        }] : []),
      ];
    }
    return [
      {
        id: paused ? "resume" : "run",
        label: paused ? execution.resumeLabel ?? "Resume" : execution.runLabel ?? "Run",
        icon: Play,
        emphasis: "primary",
        disabled: execution.disabled,
        disabledReason: execution.disabledReason,
        shortcut: "Mod+Enter",
        shortcutKeys: ["Ctrl/⌘", "Enter"],
        onClick: execution.onRun,
      },
      ...(paused && execution.onStop ? [{
        id: "stop",
        label: execution.stopLabel ?? "Stop",
        icon: StopFilled,
        emphasis: "secondary" as const,
        destructive: true,
        collapseAt: "sm" as const,
        onClick: execution.onStop,
      }] : []),
    ];
  }, [execution, paused, running]);

  return (
    <div className={joinClassNames("scientific-run-control", className)} data-state={execution.state} {...props}>
      {running && execution.progress !== undefined && (
        <ProgressBar
          className="scientific-run-control__progress"
          label={execution.label}
          hideLabel
          size="small"
          value={Math.max(0, Math.min(100, execution.progress))}
          helperText={`${Math.round(execution.progress)}%`}
        />
      )}
      {running && <span className="scientific-visually-hidden" role="status" aria-live="polite">
        {execution.label}{execution.detail ? `: ${execution.detail}` : ""}
      </span>}
      <ScientificCommandBar actions={actions} label="Simulation controls" size={size} />
    </div>
  );
}
