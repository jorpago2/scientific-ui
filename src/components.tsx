import {
  Button,
  Column,
  ContentSwitcher,
  Grid,
  InlineNotification,
  ProgressBar,
  Switch,
  TextInput,
} from "@carbon/react";
import {
  forwardRef,
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type HTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
  type RefObject,
} from "react";
import { parseScientificNumber, validateScientificNumber } from "./number.js";
import type {
  ResultOption,
  ScientificState,
  ScientificStatusDescriptor,
  ValidationMessage,
  WorkflowItem,
} from "./types.js";

function joinClassNames(...classNames: Array<string | undefined | false>) {
  return classNames.filter(Boolean).join(" ");
}

export interface ScientificHeaderProps extends HTMLAttributes<HTMLElement> {
  product: string;
  context?: string;
  status?: ScientificStatusDescriptor;
  primaryAction?: ReactNode;
  secondaryActions?: ReactNode;
}

export function ScientificHeader({ product, context, status, primaryAction, secondaryActions, className, ...props }: ScientificHeaderProps) {
  return (
    <header className={joinClassNames("scientific-header", className)} {...props}>
      <Grid fullWidth condensed>
        <Column sm={4} md={4} lg={8} className="scientific-header__identity">
          <h1>{product}</h1>
          {context && <p>{context}</p>}
        </Column>
        <Column sm={4} md={4} lg={8} className="scientific-header__actions">
          {status && <ScientificStatus status={status} compact />}
          {secondaryActions}
          {primaryAction}
        </Column>
      </Grid>
    </header>
  );
}

export interface WorkflowNavigationProps {
  items: WorkflowItem[];
  activeId: string | null;
  onChange: (id: string) => void;
  label?: string;
  className?: string;
}

export function WorkflowNavigation({ items, activeId, onChange, label = "Scientific workflow", className }: WorkflowNavigationProps) {
  return <ScientificToolRail
    items={items}
    activeId={activeId}
    onChange={(id) => { if (id !== null) onChange(id); }}
    label={label}
    className={className}
    collapsible={false}
  />;
}

export interface ScientificToolRailProps {
  items: WorkflowItem[];
  activeId: string | null;
  onChange: (id: string | null) => void;
  label?: string;
  className?: string;
  collapsible?: boolean;
  registerItemRef?: (id: string, node: HTMLButtonElement | null) => void;
}

export function ScientificToolRail({
  items,
  activeId,
  onChange,
  label = "Scientific tools",
  className,
  collapsible = true,
  registerItemRef,
}: ScientificToolRailProps) {
  const navigationRef = useRef<HTMLElement>(null);

  const moveFocus = (event: ReactKeyboardEvent<HTMLButtonElement>, direction: number | "first" | "last") => {
    const buttons = Array.from(navigationRef.current?.querySelectorAll<HTMLButtonElement>(".scientific-tool-rail__item:not(:disabled)") ?? []);
    if (buttons.length === 0) return;
    const currentIndex = buttons.indexOf(event.currentTarget);
    const nextIndex = direction === "first"
      ? 0
      : direction === "last"
        ? buttons.length - 1
        : (Math.max(0, currentIndex) + direction + buttons.length) % buttons.length;
    event.preventDefault();
    buttons[nextIndex]?.focus();
  };

  return (
    <nav ref={navigationRef} className={joinClassNames("scientific-tool-rail", className)} aria-label={label}>
      <ul>
        {items.map((item) => {
          const active = item.id === activeId;
          return (
            <li key={item.id}>
              <Button
                ref={(node: HTMLButtonElement | null) => registerItemRef?.(item.id, node)}
                id={item.triggerId ?? `workflow-${item.id}`}
                kind="ghost"
                size="lg"
                disabled={item.disabled}
                aria-controls={item.controlsId}
                aria-expanded={active}
                aria-pressed={active}
                aria-busy={item.status === "loading" || undefined}
                title={item.disabled ? item.disabledReason : item.label}
                data-state={item.status}
                className={joinClassNames("scientific-tool-rail__item", active && "is-active")}
                onClick={() => onChange(active && collapsible ? null : item.id)}
                onKeyDown={(event) => {
                  if (event.key === "ArrowDown" || event.key === "ArrowRight") moveFocus(event, 1);
                  else if (event.key === "ArrowUp" || event.key === "ArrowLeft") moveFocus(event, -1);
                  else if (event.key === "Home") moveFocus(event, "first");
                  else if (event.key === "End") moveFocus(event, "last");
                  else if (event.key === "Escape" && active && collapsible) {
                    event.preventDefault();
                    onChange(null);
                  }
                }}
              >
                {item.icon && <span aria-hidden="true" className="scientific-tool-rail__icon">{item.icon}</span>}
                <span className="scientific-tool-rail__label">{item.label}</span>
                {item.status && <span className="scientific-tool-rail__state" aria-hidden="true">
                  {item.status === "loading" ? "…" : item.status === "error" ? "!" : "✓"}
                </span>}
                {item.statusLabel && <span className="scientific-tool-rail__sr-only">{item.statusLabel}</span>}
              </Button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export interface InspectorPanelProps extends HTMLAttributes<HTMLElement> {
  open: boolean;
  title: string;
  onClose: () => void;
  triggerRef?: RefObject<HTMLElement | null>;
  children: ReactNode;
}

export function InspectorPanel({ open, title, onClose, triggerRef, children, className, ...props }: InspectorPanelProps) {
  const headingId = useId();
  const panelRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!open) return;
    panelRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        requestAnimationFrame(() => triggerRef?.current?.focus());
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose, open, triggerRef]);

  if (!open) return null;
  return (
    <aside ref={panelRef} tabIndex={-1} aria-labelledby={headingId} className={joinClassNames("scientific-inspector", className)} {...props}>
      <div className="scientific-inspector__heading">
        <h2 id={headingId}>{title}</h2>
        <Button kind="ghost" size="sm" onClick={() => {
          onClose();
          requestAnimationFrame(() => triggerRef?.current?.focus());
        }}>Close</Button>
      </div>
      <div className="scientific-inspector__body">{children}</div>
    </aside>
  );
}

export interface ScientificStatusProps extends HTMLAttributes<HTMLDivElement> {
  status: ScientificStatusDescriptor;
  compact?: boolean;
}

export function ScientificStatus({ status, compact, className, ...props }: ScientificStatusProps) {
  const live = status.state === "running" ? "polite" : status.state === "failed" ? "assertive" : "off";
  const progress = status.progress === undefined ? undefined : Math.max(0, Math.min(100, status.progress));
  return (
    <div className={joinClassNames("scientific-status", compact && "scientific-status--compact", className)} data-state={status.state} role="status" aria-live={live} aria-atomic="true" {...props}>
      <span className="scientific-status__marker" aria-hidden="true" />
      <span className="scientific-status__content">
        <strong>{status.label}</strong>
        {!compact && status.detail && <span>{status.detail}</span>}
      </span>
      {status.state === "running" && progress !== undefined && !compact && (
        <span className="scientific-status__progress">
          <ProgressBar label={status.label} hideLabel value={progress} max={100} size="small" helperText={`${Math.round(progress)}%`} />
        </span>
      )}
    </div>
  );
}

export interface ScientificStatusBarProps extends HTMLAttributes<HTMLElement> {
  status: ScientificStatusDescriptor;
  metadata?: ReactNode;
  actions?: ReactNode;
}

export function ScientificStatusBar({ status, metadata, actions, className, ...props }: ScientificStatusBarProps) {
  return (
    <footer className={joinClassNames("scientific-status-bar", className)} {...props}>
      <Grid fullWidth condensed>
        <Column sm={4} md={4} lg={8} className="scientific-status-bar__status"><ScientificStatus status={status} compact /></Column>
        <Column sm={4} md={4} lg={8} className="scientific-status-bar__metadata">{metadata}{actions}</Column>
      </Grid>
    </footer>
  );
}

export interface ScientificEmptyStateProps extends HTMLAttributes<HTMLElement> {
  title: string;
  description: string;
  action?: ReactNode;
  icon?: ReactNode;
}

export function ScientificEmptyState({ title, description, action, icon, className, ...props }: ScientificEmptyStateProps) {
  return (
    <section className={joinClassNames("scientific-empty-state", className)} {...props}>
      {icon && <div className="scientific-empty-state__icon" aria-hidden="true">{icon}</div>}
      <div><h2>{title}</h2><p>{description}</p>{action}</div>
    </section>
  );
}

export interface ValidationSummaryProps {
  messages: ValidationMessage[];
  heading?: string;
  className?: string;
}

export function ValidationSummary({ messages, heading = "Validation", className }: ValidationSummaryProps) {
  if (messages.length === 0) return null;
  return (
    <section className={joinClassNames("scientific-validation", className)} aria-label={heading}>
      {messages.map((message) => (
        <InlineNotification key={message.id} kind={message.severity} title={message.title} subtitle={message.detail} hideCloseButton lowContrast />
      ))}
    </section>
  );
}

export interface ScientificNumberFieldProps {
  id: string;
  labelText: ReactNode;
  value: number | string;
  onValueChange: (value: number | null, rawValue: string) => void;
  min?: number;
  max?: number;
  unit?: string;
  helperText?: ReactNode;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

export const ScientificNumberField = forwardRef<unknown, ScientificNumberFieldProps>(function ScientificNumberField({
  id, labelText, value, onValueChange, min, max, unit, helperText, disabled, required, className,
}, ref) {
  const [rawValue, setRawValue] = useState(String(value));
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  useEffect(() => setRawValue(String(value)), [value]);
  const commit = (nextRawValue: string) => {
    const error = validateScientificNumber(nextRawValue, { min, max });
    setValidationMessage(error);
    onValueChange(error ? null : parseScientificNumber(nextRawValue), nextRawValue);
  };

  return (
    <div className={joinClassNames("scientific-number-field", className)}>
      <TextInput
        ref={ref}
        id={id}
        type="text"
        inputMode="decimal"
        labelText={labelText}
        value={rawValue}
        disabled={disabled}
        required={required}
        helperText={helperText}
        invalid={Boolean(validationMessage)}
        invalidText={validationMessage ?? undefined}
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          setRawValue(event.target.value);
          if (validationMessage) setValidationMessage(null);
        }}
        onBlur={() => commit(rawValue)}
        onKeyDown={(event) => { if (event.key === "Enter") commit(rawValue); }}
      />
      {unit && <span className="scientific-number-field__unit" aria-hidden="true">{unit}</span>}
    </div>
  );
});

export interface ExportReceiptProps {
  fileName: string;
  format: string;
  destination?: string;
  kind?: "success" | "error";
  title?: string;
  onDismiss?: () => void;
  className?: string;
  children?: ReactNode;
}

export function ExportReceipt({ fileName, format, destination, kind = "success", title, onDismiss, className, children }: ExportReceiptProps) {
  const details = [format, destination].filter(Boolean).join(" · ");
  return <InlineNotification className={className} kind={kind} title={title ?? (kind === "success" ? `Exported ${fileName}` : `Could not export ${fileName}`)} subtitle={details || undefined} hideCloseButton={!onDismiss} onCloseButtonClick={onDismiss} lowContrast>{children}</InlineNotification>;
}

export interface ResultSwitcherProps {
  options: ResultOption[];
  activeId: string;
  onChange: (id: string) => void;
  label?: string;
  className?: string;
}

export function ResultSwitcher({ options, activeId, onChange, label = "Result view", className }: ResultSwitcherProps) {
  const selectedIndex = Math.max(0, options.findIndex((option) => option.id === activeId));
  return (
    <div className={joinClassNames("scientific-result-switcher", className)} role="group" aria-label={label}>
      <ContentSwitcher selectedIndex={selectedIndex} selectionMode="manual" onChange={({ index }) => {
        const option = options[index ?? -1];
        if (option && !option.disabled) onChange(option.id);
      }}>
        {options.map((option) => <Switch key={option.id} name={option.id} text={option.label} disabled={option.disabled}>{option.label}</Switch>)}
      </ContentSwitcher>
    </div>
  );
}

export interface ScientificAppShellProps {
  header: ReactNode;
  navigation: ReactNode;
  panel?: ReactNode;
  children: ReactNode;
  inspector?: ReactNode;
  statusBar?: ReactNode;
  panelOpen?: boolean;
  miniPreview?: ReactNode;
  className?: string;
}

export function ScientificAppShell({ header, navigation, panel, children, inspector, statusBar, panelOpen = Boolean(panel), miniPreview, className }: ScientificAppShellProps) {
  return (
    <div className={joinClassNames("scientific-app-shell", className)} data-panel-open={panelOpen || undefined}>
      {header}
      <Grid as="main" fullWidth condensed className="scientific-workbench">
        <Column sm={4} md={8} lg={2} className="scientific-workbench__navigation">{navigation}</Column>
        {panelOpen && panel && <Column sm={4} md={8} lg={4} className="scientific-workbench__panel">{panel}</Column>}
        <Column sm={4} md={8} lg={panelOpen ? 10 : 14} className="scientific-workbench__stage">
          {panelOpen && miniPreview && <div className="scientific-workbench__mini-preview">{miniPreview}</div>}
          {children}
        </Column>
      </Grid>
      {inspector}
      {statusBar}
    </div>
  );
}

export function stateIsStale(state: ScientificState) {
  return state === "modified" || state === "needs-input";
}
