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
  type ReactNode,
} from "react";
import { ScientificCommandBar } from "./actions.js";
import { ScientificStatus } from "./components.js";
import type {
  ScientificActionDescriptor,
  ScientificLegendItem,
  ScientificMetricDescriptor,
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
        <Accordion align="start" size="sm">
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
        <Column key={index} sm={4} md={columns === 2 ? 4 : 8} lg={columns === 2 ? 2 : 4}>
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

export interface ScientificMetricGridProps extends HTMLAttributes<HTMLDListElement> {
  metrics: readonly ScientificMetricDescriptor[];
  columns?: 2 | 3 | 4;
}

export function ScientificMetricGrid({ metrics, columns = 4, className, ...props }: ScientificMetricGridProps) {
  const lg = columns === 2 ? 8 : columns === 3 ? 5 : 4;
  return (
    <Grid as="dl" fullWidth narrow className={joinClassNames("scientific-metric-grid", className)} {...props}>
      {metrics.map((metric) => (
        <Column sm={4} md={4} lg={lg} key={metric.id} className="scientific-metric" data-status={metric.status ?? "neutral"}>
          <dt>{metric.label}</dt>
          <dd><strong>{metric.value}</strong>{metric.unit && <span>{metric.unit}</span>}</dd>
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
