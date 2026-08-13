import {
  Button,
  Column,
  ComposedModal,
  ContentSwitcher,
  Grid,
  Header,
  HeaderGlobalBar,
  HeaderName,
  IconButton,
  InlineNotification,
  Layer,
  ModalBody,
  ModalHeader,
  ProgressBar,
  SideNav,
  SideNavItems,
  SideNavLink,
  Switch,
  TextInput,
  Toggletip,
  ToggletipActions,
  ToggletipButton,
  ToggletipContent,
  preview__IconIndicator as IconIndicator,
} from "@carbon/react";
import { Close, Help } from "@carbon/icons-react";
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
import type { IconButtonProps } from "@carbon/react";
import { parseScientificNumber, validateScientificNumber } from "./number.js";
import { useScientificShortcuts } from "./shortcuts.js";
import { ScientificProductMark, type ScientificProductIcon } from "./product-mark.js";
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
  productIcon?: ScientificProductIcon;
  productMark?: ReactNode;
  descriptor?: ReactNode;
  href?: string;
  contextLabel?: ReactNode;
  context?: ReactNode;
  contextDetail?: ReactNode;
  status?: ScientificStatusDescriptor;
  primaryAction?: ReactNode;
  secondaryActions?: ReactNode;
  help?: ScientificHeaderHelpDescriptor;
  actionsLabel?: string;
  skipLink?: ReactNode;
}

export function ScientificHeader({ product, productIcon, productMark, descriptor, href = "./", contextLabel, context, contextDetail, status, primaryAction, secondaryActions, help, actionsLabel = "Application actions", skipLink, className, ...props }: ScientificHeaderProps) {
  return (
    <Header className={joinClassNames("scientific-header", "scientific-app-header", className)} {...props}>
      {skipLink}
      <HeaderName className="scientific-header__brand scientific-app-header__brand" href={href} prefix="" aria-label={product}>
        <span className="scientific-header__brand-mark scientific-app-header__brand-mark" aria-hidden="true">{productIcon ? <ScientificProductMark product={productIcon} /> : productMark ?? product.slice(0, 1)}</span>
        <span className="scientific-header__brand-copy"><strong>{product}</strong>{descriptor && <small>{descriptor}</small>}</span>
      </HeaderName>
      {(contextLabel || context || contextDetail || status) && <div className="scientific-header__context scientific-app-header__context">
        {contextLabel && <span className="scientific-header__context-label">{contextLabel}</span>}
        {context && <div className="scientific-header__context-value">{context}</div>}
        {contextDetail && <div className="scientific-header__context-detail">{contextDetail}</div>}
        {status && <ScientificStatus className="scientific-header__status" status={status} compact />}
      </div>}
      <HeaderGlobalBar className="scientific-header__actions scientific-app-header__actions" role="group" aria-label={actionsLabel}>
        {secondaryActions && <div className="scientific-header__secondary-actions">{secondaryActions}</div>}
        {primaryAction && <div className="scientific-header__primary-action">{primaryAction}</div>}
        {help && <div className="scientific-header__help" data-scientific-header-terminal-action><ScientificHeaderHelp {...help} /></div>}
      </HeaderGlobalBar>
    </Header>
  );
}

export interface ScientificHeaderHelpShortcut {
  keys: readonly string[];
  description: ReactNode;
}

export interface ScientificHeaderHelpAction {
  label: string;
  onClick: () => void;
}

export interface ScientificHeaderHelpDescriptor {
  id?: string;
  label?: string;
  title?: ReactNode;
  summary: ReactNode;
  shortcuts?: readonly ScientificHeaderHelpShortcut[];
  action?: ScientificHeaderHelpAction;
  footer?: ReactNode;
}

function isEditableHelpTarget(target: EventTarget | null) {
  return target instanceof HTMLElement && (target.matches("input, select, textarea") || target.isContentEditable);
}

export function ScientificHeaderHelp({
  id,
  label = "Help",
  title = "Quick workflow",
  summary,
  shortcuts = [],
  action,
  footer,
}: ScientificHeaderHelpDescriptor) {
  const registeredShortcuts = useScientificShortcuts();
  const generatedId = useId();
  const buttonId = id ?? `scientific-header-help-${generatedId}`;
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const toggleHelp = (event: globalThis.KeyboardEvent) => {
      if (event.repeat) return;
      if (event.key === "Escape" && buttonRef.current?.getAttribute("aria-expanded") === "true") {
        event.preventDefault();
        buttonRef.current.click();
        buttonRef.current.focus();
        return;
      }
      if (event.defaultPrevented || event.key !== "?" || isEditableHelpTarget(event.target)) return;
      event.preventDefault();
      buttonRef.current?.click();
    };
    document.addEventListener("keydown", toggleHelp, true);
    return () => document.removeEventListener("keydown", toggleHelp, true);
  }, []);

  return (
    <Toggletip className="scientific-header-help" align="bottom-end" autoAlign>
      <ToggletipButton
        ref={buttonRef}
        id={buttonId}
        className="scientific-header-help__button"
        label={label}
        aria-keyshortcuts="?"
      >
        <Help size={20} aria-hidden={true} />
      </ToggletipButton>
      <ToggletipContent className="scientific-header-help__popover">
        <div className="scientific-header-help__content">
          <strong className="scientific-header-help__title">{title}</strong>
          <p className="scientific-header-help__summary">{summary}</p>
          <dl className="scientific-header-help__shortcuts">
            {shortcuts.map((shortcut, index) => (
              <div key={`${shortcut.keys.join("+")}-${index}`}>
                <dt>{shortcut.keys.map((key) => <kbd key={key}>{key}</kbd>)}</dt>
                <dd>{shortcut.description}</dd>
              </div>
            ))}
            {registeredShortcuts.map((shortcut) => (
              <div key={shortcut.id}>
                <dt>{(shortcut.displayKeys ?? [shortcut.shortcut]).map((key) => <kbd key={key}>{key}</kbd>)}</dt>
                <dd>{shortcut.description}</dd>
              </div>
            ))}
            <div><dt><kbd>?</kbd></dt><dd>Toggle this help</dd></div>
          </dl>
          {action && <ToggletipActions><Button size="sm" kind="tertiary" onClick={() => {
            buttonRef.current?.focus();
            buttonRef.current?.click();
            window.requestAnimationFrame(action.onClick);
          }}>{action.label}</Button></ToggletipActions>}
          {footer && <small className="scientific-header-help__footer">{footer}</small>}
        </div>
      </ToggletipContent>
    </Toggletip>
  );
}

export interface ScientificHeaderActionProps extends Omit<IconButtonProps, "label"> {
  label: ReactNode;
}

/**
 * Canonical icon-only action for the 48 px application header. Carbon owns the
 * button, tooltip, focus and selected states; the shared wrapper only fixes the
 * tooltip direction so it cannot be clipped above the viewport.
 */
export function ScientificHeaderAction({
  label,
  align = "bottom-end",
  kind = "ghost",
  size = "lg",
  className,
  children,
  ...props
}: ScientificHeaderActionProps) {
  return (
    <IconButton
      label={label}
      align={align}
      kind={kind}
      size={size}
      className={joinClassNames("scientific-header-action", className)}
      {...props}
    >
      {children}
    </IconButton>
  );
}

export interface ScientificTaskPanelProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  title: ReactNode;
  titleId?: string;
  eyebrow?: ReactNode;
  actions?: ReactNode;
  footer?: ReactNode;
  onClose?: () => void;
  closeLabel?: string;
  bodyClassName?: string;
}

export const ScientificTaskPanel = forwardRef<HTMLElement, ScientificTaskPanelProps>(function ScientificTaskPanel({ title, titleId, eyebrow = "Configuration", actions, footer, onClose, closeLabel = "Close panel", bodyClassName, children, className, onKeyDown, ...props }, ref) {
  return (
    <Layer
      ref={ref}
      as="aside"
      withBackground
      className={joinClassNames("scientific-task-panel", "scientific-task-panel--managed", className)}
      aria-labelledby={titleId}
      {...props}
      onKeyDown={(event: ReactKeyboardEvent<HTMLElement>) => {
        onKeyDown?.(event);
        if (!event.defaultPrevented && event.key === "Escape" && onClose) {
          event.stopPropagation();
          onClose();
        }
      }}
    >
      <div className="scientific-task-panel__header">
        <div className="scientific-task-panel__heading">
          {eyebrow && <p>{eyebrow}</p>}
          <h2 id={titleId} tabIndex={-1}>{title}</h2>
        </div>
        {(actions || onClose) && <div className="scientific-task-panel__actions">
          {actions}
          {onClose && <IconButton type="button" kind="ghost" size="lg" align="bottom-end" label={closeLabel} onClick={onClose}><Close size={20} aria-hidden={true} /></IconButton>}
        </div>}
      </div>
      <div className={joinClassNames("scientific-task-panel__body", bodyClassName)}>{children}</div>
      {footer && <div className="scientific-task-panel__footer">{footer}</div>}
    </Layer>
  );
});

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
  expandedId?: string | null;
  onChange: (id: string | null) => void;
  label?: string;
  className?: string;
  collapsible?: boolean;
  registerItemRef?: (id: string, node: HTMLButtonElement | null) => void;
}

export function ScientificToolRail({
  items,
  activeId,
  expandedId = activeId,
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
    <SideNav
      ref={navigationRef}
      className={joinClassNames("scientific-tool-rail", className)}
      aria-label={label}
      expanded
      isFixedNav
      isPersistent
      addFocusListeners={false}
      addMouseListeners={false}
    >
      <SideNavItems className="scientific-tool-rail__items">
        {items.map((item) => {
          const active = item.id === activeId;
          const expanded = item.id === expandedId;
          return (
            <SideNavLink
              key={item.id}
              ref={(node: HTMLButtonElement | null) => registerItemRef?.(item.id, node)}
              as="button"
              type="button"
              id={item.triggerId ?? `workflow-${item.id}`}
              disabled={item.disabled}
              isActive={active}
              aria-controls={item.controlsId}
              aria-current={active ? "page" : undefined}
              aria-expanded={expanded}
              aria-busy={item.status === "loading" || undefined}
              title={item.disabled ? item.disabledReason : item.label}
              data-state={item.status}
              className={joinClassNames("scientific-tool-rail__item", item.className)}
              {...item.dataAttributes}
              onClick={() => onChange(expanded && collapsible ? null : item.id)}
              onKeyDown={(event: ReactKeyboardEvent<HTMLButtonElement>) => {
                if (event.key === "ArrowDown" || event.key === "ArrowRight") moveFocus(event, 1);
                else if (event.key === "ArrowUp" || event.key === "ArrowLeft") moveFocus(event, -1);
                else if (event.key === "Home") moveFocus(event, "first");
                else if (event.key === "End") moveFocus(event, "last");
                else if (event.key === "Escape" && expanded && collapsible) {
                  event.preventDefault();
                  onChange(null);
                }
              }}
            >
              <span className="scientific-tool-rail__content">
                {item.icon && <span aria-hidden="true" className="scientific-tool-rail__icon">{item.icon}</span>}
                <span className="scientific-tool-rail__label">{item.label}</span>
                {item.status && (
                  <IconIndicator
                    className="scientific-tool-rail__state"
                    kind={item.status === "loading" ? "in-progress" : item.status === "error" ? "failed" : "succeeded"}
                    label=""
                    size={16}
                  />
                )}
                {item.statusLabel && <span className="scientific-tool-rail__sr-only">{item.statusLabel}</span>}
              </span>
            </SideNavLink>
          );
        })}
      </SideNavItems>
    </SideNav>
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
  return (
    <ComposedModal
      open={open}
      size="sm"
      className="scientific-inspector-shell"
      containerClassName={joinClassNames("scientific-inspector", className)}
      aria-label={title}
      launcherButtonRef={triggerRef as RefObject<HTMLButtonElement | null> | undefined}
      onClose={() => onClose()}
      {...props}
    >
      <ModalHeader className="scientific-inspector__heading" title={title} iconDescription={`Close ${title}`} />
      <ModalBody className="scientific-inspector__body" hasScrollingContent>{children}</ModalBody>
    </ComposedModal>
  );
}

export interface ScientificStatusProps extends HTMLAttributes<HTMLDivElement> {
  status: ScientificStatusDescriptor;
  compact?: boolean;
}

export function ScientificStatus({ status, compact, className, ...props }: ScientificStatusProps) {
  const live = status.state === "running" ? "polite" : status.state === "failed" ? "assertive" : "off";
  const progress = status.progress === undefined ? undefined : Math.max(0, Math.min(100, status.progress));
  const indicatorKind = {
    "needs-input": "not-started",
    ready: "normal",
    running: "in-progress",
    paused: "pending",
    "up-to-date": "succeeded",
    modified: "pending",
    validated: "succeeded",
    warning: "caution-minor",
    failed: "failed",
  }[status.state] as "not-started" | "normal" | "in-progress" | "succeeded" | "pending" | "caution-minor" | "failed";
  return (
    <div className={joinClassNames("scientific-status", compact && "scientific-status--compact", className)} data-state={status.state} role="status" aria-live={live} aria-atomic="true" {...props}>
      <IconIndicator className="scientific-status__indicator" kind={indicatorKind} label={status.label} size={16} />
      <span className="scientific-status__content">
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
  embedded?: boolean;
}

export function ScientificStatusBar({ status, metadata, actions, embedded = false, className, ...props }: ScientificStatusBarProps) {
  return (
    <footer className={joinClassNames("scientific-status-bar", embedded && "scientific-status-bar--embedded", className)} {...props}>
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

function formatScientificInputValue(value: number | string): string {
  if (typeof value !== "number" || !Number.isFinite(value) || value === 0) return String(value);
  const magnitude = Math.abs(value);
  return magnitude >= 1e6 || magnitude < 1e-4
    ? value.toExponential().replace(/\.0+(?=e)/, "").replace(/(\.\d*?)0+(?=e)/, "$1")
    : String(value);
}

export const ScientificNumberField = forwardRef<unknown, ScientificNumberFieldProps>(function ScientificNumberField({
  id, labelText, value, onValueChange, min, max, unit, helperText, disabled, required, className,
}, ref) {
  const [rawValue, setRawValue] = useState(formatScientificInputValue(value));
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  useEffect(() => setRawValue(formatScientificInputValue(value)), [value]);
  const commit = (nextRawValue: string) => {
    const error = validateScientificNumber(nextRawValue, { min, max });
    setValidationMessage(error);
    const parsedValue = error ? null : parseScientificNumber(nextRawValue);
    if (parsedValue !== null) setRawValue(formatScientificInputValue(parsedValue));
    onValueChange(parsedValue, nextRawValue);
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
  className?: string;
}

export function ScientificAppShell({ header, navigation, panel, children, inspector, statusBar, panelOpen = Boolean(panel), className }: ScientificAppShellProps) {
  return (
    <div
      className={joinClassNames("scientific-app-shell", className)}
      data-panel-open={panelOpen || undefined}
    >
      {header}
      {navigation}
      <Grid as="main" fullWidth condensed className="scientific-workbench">
        {panel && (
          <Column
            sm={4}
            md={8}
            lg={4}
            className="scientific-workbench__panel"
            hidden={!panelOpen}
          >
            {panel}
          </Column>
        )}
        <Column sm={4} md={8} lg={panelOpen ? 12 : 16} className="scientific-workbench__stage">
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
