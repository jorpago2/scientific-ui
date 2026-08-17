import {
  Accordion,
  AccordionItem,
  ButtonSet,
  Column,
  Grid,
  Layer,
} from "@carbon/react";
import {
  Children,
  createElement,
  useId,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type Ref,
  type ReactNode,
} from "react";
import { ScientificCommandBar } from "./actions.js";
import { ScientificStatus } from "./components.js";
import { formatScientificValue } from "./number.js";
import type {
  ScientificActionDescriptor,
  ScientificCheckDescriptor,
  ScientificLegendItem,
  ScientificMetricDescriptor,
  ScientificProvenanceItem,
  ScientificStatusDescriptor,
} from "./types.js";

function joinClassNames(...values: Array<string | undefined | false>) {
  return values.filter(Boolean).join(" ");
}

export interface ScientificPanelSectionProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  title: ReactNode;
  description?: ReactNode;
  meta?: ReactNode;
  actions?: ReactNode;
  collapsible?: boolean;
  defaultOpen?: boolean;
  headingLevel?: 2 | 3 | 4;
}

/** Canonical vertical rhythm and disclosure behavior inside task panels. */
export function ScientificPanelSection({
  title,
  description,
  meta,
  actions,
  collapsible = false,
  defaultOpen = true,
  headingLevel = 3,
  children,
  className,
  ...props
}: ScientificPanelSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const headingId = useId();
  const heading = (
    <span className="scientific-panel-section__title-row">
      <span>{title}</span>
      {meta && <small>{meta}</small>}
    </span>
  );

  if (collapsible) {
    return (
      <section className={joinClassNames("scientific-panel-section", "scientific-panel-section--collapsible", className)} {...props}>
        <Accordion align="end" size="sm">
          <AccordionItem
            title={heading}
            open={open}
            onHeadingClick={({ isOpen }) => setOpen(!isOpen)}
          >
            {(description || actions) && (
              <div className="scientific-panel-section__intro">
                {description && <p>{description}</p>}
                {actions && <div className="scientific-panel-section__actions">{actions}</div>}
              </div>
            )}
            <div className="scientific-panel-section__content">{children}</div>
          </AccordionItem>
        </Accordion>
      </section>
    );
  }

  return (
    <section className={joinClassNames("scientific-panel-section", className)} aria-labelledby={headingId} {...props}>
      <div className="scientific-panel-section__header">
        <div>
          {createElement(`h${headingLevel}`, { id: headingId }, heading)}
          {description && <p>{description}</p>}
        </div>
        {actions && <div className="scientific-panel-section__actions">{actions}</div>}
      </div>
      <div className="scientific-panel-section__content">{children}</div>
    </section>
  );
}

export interface ScientificParameterGroupProps extends HTMLAttributes<HTMLDivElement> {
  legend?: ReactNode;
  description?: ReactNode;
  columns?: 1 | 2;
}

export function ScientificParameterGroup({
  legend,
  description,
  columns = 1,
  children,
  className,
  ...props
}: ScientificParameterGroupProps) {
  const content = (
    <Grid fullWidth narrow className="scientific-parameter-group__grid">
      {Children.toArray(children).map((child, index) => (
        <Column key={index} sm={4} md={columns === 2 ? 4 : 8} lg={columns === 2 ? 8 : 16}>
          {child}
        </Column>
      ))}
    </Grid>
  );
  return (
    <div className={joinClassNames("scientific-parameter-group", className)} {...props}>
      {legend && <h4 className="scientific-parameter-group__legend">{legend}</h4>}
      {description && <p className="scientific-parameter-group__description">{description}</p>}
      {content}
    </div>
  );
}

export type ScientificParameterSectionProps = ScientificPanelSectionProps & Pick<ScientificParameterGroupProps, "columns" | "legend">;

/** One canonical composition for headings, descriptions and scientific fields. */
export function ScientificParameterSection({ columns = 1, legend, children, ...props }: ScientificParameterSectionProps) {
  return (
    <ScientificPanelSection {...props}>
      <ScientificParameterGroup columns={columns} legend={legend}>{children}</ScientificParameterGroup>
    </ScientificPanelSection>
  );
}

export interface ScientificFieldRowProps extends HTMLAttributes<HTMLDivElement> {
  label: ReactNode;
  unit?: ReactNode;
  helperText?: ReactNode;
  invalidText?: ReactNode;
}

/** Label shell for custom scientific widgets such as canvas-backed sliders. */
export function ScientificFieldRow({
  label,
  unit,
  helperText,
  invalidText,
  children,
  className,
  ...props
}: ScientificFieldRowProps) {
  return (
    <div className={joinClassNames("scientific-field-row", Boolean(invalidText) && "scientific-field-row--invalid", className)} {...props}>
      <div className="scientific-field-row__label"><span>{label}</span>{unit && <span>{unit}</span>}</div>
      <div className="scientific-field-row__control">{children}</div>
      {invalidText
        ? <p className="scientific-field-row__invalid">{invalidText}</p>
        : helperText && <p className="scientific-field-row__helper">{helperText}</p>}
    </div>
  );
}

export interface ScientificPanelFooterProps extends HTMLAttributes<HTMLDivElement> {
  summary?: ReactNode;
}

export function ScientificPanelFooter({ summary, children, className, ...props }: ScientificPanelFooterProps) {
  return (
    <div className={joinClassNames("scientific-panel-footer", className)} {...props}>
      {summary && <div className="scientific-panel-footer__summary">{summary}</div>}
      <ButtonSet fluid className="scientific-panel-footer__actions">{children}</ButtonSet>
    </div>
  );
}

export interface ScientificResultsLayoutProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  title: ReactNode;
  description?: ReactNode;
  status?: ScientificStatusDescriptor;
  switcher?: ReactNode;
  actions?: ReactNode;
  details?: ReactNode;
}

export interface ScientificStageHeaderProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  title: ReactNode;
  description?: ReactNode;
  status?: ScientificStatusDescriptor;
  actions?: ReactNode;
  titleId?: string;
}

/** Carbon-grid heading shared by overview, validation and other stage views. */
export function ScientificStageHeader({
  title,
  description,
  status,
  actions,
  titleId,
  className,
  ...props
}: ScientificStageHeaderProps) {
  const generatedId = useId();
  const headingId = titleId ?? `scientific-stage-${generatedId.replace(/:/g, "")}`;
  return (
    <header className={joinClassNames("scientific-stage-header", className)} {...props}>
      <Grid fullWidth>
        <Column sm={4} md={8} lg={16} className="scientific-stage-header__column">
          <div className="scientific-stage-header__heading">
            <h2 id={headingId}>{title}</h2>
            {description && <p>{description}</p>}
            {status && <ScientificStatus status={status} compact />}
          </div>
          {actions && <div className="scientific-stage-header__actions">{actions}</div>}
        </Column>
      </Grid>
    </header>
  );
}

export function ScientificResultsLayout({
  title,
  description,
  status,
  switcher,
  actions,
  details,
  children,
  className,
  ...props
}: ScientificResultsLayoutProps) {
  const titleId = useId();
  return (
    <Layer as="section" withBackground className={joinClassNames("scientific-results-layout", className)} aria-labelledby={titleId} {...props}>
      <Grid fullWidth className="scientific-results-layout__header">
        <Column sm={4} md={8} lg={16} className="scientific-results-layout__header-column">
          <div className="scientific-results-layout__heading">
            <h2 id={titleId}>{title}</h2>
            {description && <p>{description}</p>}
            {status && <ScientificStatus status={status} compact />}
          </div>
          <div className="scientific-results-layout__header-actions">
            {switcher}{actions}
          </div>
        </Column>
      </Grid>
      <Grid fullWidth className="scientific-results-layout__content">
        <Column sm={4} md={8} lg={16} className="scientific-results-layout__content-column">
          <div className={joinClassNames("scientific-results-layout__content-row", Boolean(details) && "scientific-results-layout__content-row--with-details") }>
            <div className="scientific-results-layout__main">{children}</div>
            {details && <aside className="scientific-results-layout__details">{details}</aside>}
          </div>
        </Column>
      </Grid>
    </Layer>
  );
}

export interface ScientificResultsToolbarProps extends HTMLAttributes<HTMLDivElement> {
  actions: readonly ScientificActionDescriptor[];
  label?: string;
}

export function ScientificResultsToolbar({ actions, label = "Result actions", className, ...props }: ScientificResultsToolbarProps) {
  return <ScientificCommandBar actions={actions} label={label} size="sm" responsiveTo="container" className={joinClassNames("scientific-results-toolbar", className)} {...props} />;
}

export interface ScientificOutcomeSummaryProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  title: ReactNode;
  status: ScientificStatusDescriptor;
  summary?: ReactNode;
  metrics?: readonly ScientificMetricDescriptor[];
  actions?: readonly ScientificActionDescriptor[];
  headingLevel?: 2 | 3;
  headingRef?: Ref<HTMLHeadingElement>;
}

/**
 * Canonical post-operation handoff. It answers what happened, whether the
 * result is current, which quantities matter first and what the user can do
 * next without conflating successful execution with scientific validation.
 */
export function ScientificOutcomeSummary({
  title,
  status,
  summary,
  metrics = [],
  actions = [],
  headingLevel = 2,
  headingRef,
  className,
  ...props
}: ScientificOutcomeSummaryProps) {
  const titleId = useId();
  const hasActions = actions.length > 0;
  return (
    <Layer
      as="section"
      withBackground
      className={joinClassNames("scientific-outcome-summary", className)}
      data-state={status.state}
      aria-labelledby={titleId}
      {...props}
    >
      <Grid fullWidth className="scientific-outcome-summary__grid">
        <Column
          sm={4}
          md={hasActions ? 5 : 8}
          lg={hasActions ? 11 : 16}
          className="scientific-outcome-summary__copy-column"
        >
          <div className="scientific-outcome-summary__heading">
            {createElement(`h${headingLevel}`, { id: titleId, ref: headingRef, tabIndex: headingRef ? -1 : undefined }, title)}
            <ScientificStatus status={status} />
          </div>
          {summary && <p className="scientific-outcome-summary__summary">{summary}</p>}
        </Column>
        {hasActions && (
          <Column sm={4} md={3} lg={5} className="scientific-outcome-summary__action-column">
            <ScientificCommandBar
              actions={actions}
              label="Outcome actions"
              responsiveTo="container"
              className="scientific-outcome-summary__actions"
            />
          </Column>
        )}
      </Grid>
      {metrics.length > 0 && (
        <div className="scientific-outcome-summary__metrics">
          <ScientificMetricGrid metrics={metrics} columns={metrics.length <= 2 ? 2 : metrics.length === 3 ? 3 : 4} />
        </div>
      )}
    </Layer>
  );
}

export interface ScientificMetricGridProps extends HTMLAttributes<HTMLDListElement> {
  metrics: readonly ScientificMetricDescriptor[];
  columns?: 2 | 3 | 4;
}

export function ScientificMetricGrid({ metrics, columns = 4, className, ...props }: ScientificMetricGridProps) {
  const lg = columns === 2 ? 8 : columns === 3 ? 5 : 4;
  return (
    <Grid as="dl" fullWidth narrow className={joinClassNames("scientific-metric-grid", className)} {...props} data-count={metrics.length}>
      {metrics.map((metric) => (
        <Column sm={2} md={4} lg={lg} key={metric.id} className="scientific-metric" data-status={metric.status ?? "neutral"}>
          <dt>{metric.label}</dt>
          <dd>
            <strong className="scientific-metric__value">{typeof metric.value === "number" ? formatScientificValue(metric.value, metric.format) : metric.value}</strong>
            {metric.unit && <span className="scientific-metric__unit">{metric.unit}</span>}
          </dd>
          {metric.detail && <p>{metric.detail}</p>}
        </Column>
      ))}
    </Grid>
  );
}

export interface ScientificLegendProps extends HTMLAttributes<HTMLUListElement> {
  items: readonly ScientificLegendItem[];
  label?: string;
}

export function ScientificLegend({ items, label = "Legend", className, ...props }: ScientificLegendProps) {
  return (
    <ul className={joinClassNames("scientific-legend", className)} aria-label={label} {...props}>
      {items.map((item) => (
        <li key={item.id}>
          <span className="scientific-legend__symbol" style={item.color ? { "--scientific-legend-color": item.color } as CSSProperties : undefined} aria-hidden="true">
            {item.symbol}
          </span>
          <span>{item.label}{item.detail && <small>{item.detail}</small>}</span>
        </li>
      ))}
    </ul>
  );
}

function scientificCheckStatus(check: ScientificCheckDescriptor): ScientificStatusDescriptor {
  const state = {
    "not-run": "needs-input",
    ready: "ready",
    running: "running",
    passed: "validated",
    warning: "warning",
    failed: "failed",
    "not-applicable": "up-to-date",
  }[check.state] as ScientificStatusDescriptor["state"];
  const suffix = {
    "not-run": "Not run",
    ready: "Ready",
    running: "Running",
    passed: "Passed",
    warning: "Warning",
    failed: "Failed",
    "not-applicable": "Not applicable",
  }[check.state];
  return { state, label: `${typeof check.label === "string" ? check.label : "Check"}: ${suffix}` };
}

export interface ScientificEvidenceSummaryProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  title: ReactNode;
  description?: ReactNode;
  status: ScientificStatusDescriptor;
  checks: readonly ScientificCheckDescriptor[];
  action?: ReactNode;
  compact?: boolean;
}

/** A compact, evidence-first summary for preflight and validation surfaces. */
export function ScientificEvidenceSummary({
  title,
  description,
  status,
  checks,
  action,
  compact = false,
  className,
  ...props
}: ScientificEvidenceSummaryProps) {
  const titleId = useId();
  return (
    <Layer as="section" withBackground className={joinClassNames("scientific-evidence-summary", className)} data-density={compact ? "compact" : "regular"} aria-labelledby={titleId} {...props}>
      <div className="scientific-evidence-summary__header">
        <div>
          <h3 id={titleId}>{title}</h3>
          {description && <p>{description}</p>}
        </div>
        <ScientificStatus status={status} compact />
      </div>
      <ul className="scientific-evidence-summary__checks" data-count={checks.length}>
        {checks.map((check) => (
          <li key={check.id} data-state={check.state}>
            <div className="scientific-evidence-summary__check-heading">
              <strong>{check.label}</strong>
              <ScientificStatus status={scientificCheckStatus(check)} compact iconOnly={compact} />
            </div>
            {check.value && <div className="scientific-evidence-summary__value">{check.value}</div>}
            {!compact && check.detail && <p>{check.detail}</p>}
          </li>
        ))}
      </ul>
      {action && <div className="scientific-evidence-summary__action">{action}</div>}
    </Layer>
  );
}

export type ScientificPreflightSummaryProps = Omit<ScientificEvidenceSummaryProps, "title"> & { title?: ReactNode };

export function ScientificPreflightSummary({ title = "Numerical preflight", ...props }: ScientificPreflightSummaryProps) {
  return <ScientificEvidenceSummary title={title} {...props} />;
}

export type ScientificValidationSummaryProps = Omit<ScientificEvidenceSummaryProps, "title"> & { title?: ReactNode };

export function ScientificValidationSummary({ title = "Scientific validation", ...props }: ScientificValidationSummaryProps) {
  return <ScientificEvidenceSummary title={title} {...props} />;
}

export interface ScientificModelScopeProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  title?: ReactNode;
  model: ReactNode;
  assumptions?: readonly ReactNode[];
  limits?: readonly ReactNode[];
  reference?: ReactNode;
}

export function ScientificModelScope({
  title = "Model scope",
  model,
  assumptions = [],
  limits = [],
  reference,
  className,
  ...props
}: ScientificModelScopeProps) {
  const titleId = useId();
  return (
    <Layer as="section" withBackground className={joinClassNames("scientific-model-scope", className)} aria-labelledby={titleId} {...props}>
      <h3 id={titleId}>{title}</h3>
      <p className="scientific-model-scope__model">{model}</p>
      <Grid fullWidth narrow className="scientific-model-scope__grid">
        {assumptions.length > 0 && <Column sm={4} md={4} lg={8}>
          <h4>Assumptions</h4>
          <ul>{assumptions.map((item, index) => <li key={index}>{item}</li>)}</ul>
        </Column>}
        {limits.length > 0 && <Column sm={4} md={4} lg={8}>
          <h4>Interpretation limits</h4>
          <ul>{limits.map((item, index) => <li key={index}>{item}</li>)}</ul>
        </Column>}
      </Grid>
      {reference && <div className="scientific-model-scope__reference">{reference}</div>}
    </Layer>
  );
}

export interface ScientificResultProvenanceProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  title?: ReactNode;
  items: readonly ScientificProvenanceItem[];
  status?: ScientificStatusDescriptor;
}

export function ScientificResultProvenance({ title = "Result provenance", items, status, className, ...props }: ScientificResultProvenanceProps) {
  const titleId = useId();
  return (
    <section className={joinClassNames("scientific-result-provenance", className)} aria-labelledby={titleId} {...props}>
      <div className="scientific-result-provenance__header"><h3 id={titleId}>{title}</h3>{status && <ScientificStatus status={status} compact />}</div>
      <dl>
        {items.map((item) => <div key={item.id}><dt>{item.label}</dt><dd>{item.value}{item.detail && <small>{item.detail}</small>}</dd></div>)}
      </dl>
    </section>
  );
}

export type ScientificReproducibilityManifestProps = ScientificResultProvenanceProps;

export function ScientificReproducibilityManifest({ title = "Reproducibility", ...props }: ScientificReproducibilityManifestProps) {
  return <ScientificResultProvenance title={title} {...props} />;
}
