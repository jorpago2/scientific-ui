# @jorpago2/scientific-ui

## Scientific plots

Use `SCIENTIFIC_PLOT_LINE_WIDTHS` for trace hierarchy: `primary` (4 px), `emphasis` (5 px), `secondary` (3 px), and `reference` (2 px). Scientific meaning should also remain identifiable through colour, dash patterns, markers and labels.

`ScientificPlotFrame` owns plot title, description, legend, actions, status and responsive composition. Plot engines remain local. Plotly consumers use `createScientificPlotlyLayout`, `createScientificPlotlyConfig` and `prepareScientificPlotlyToolbar` so IBM Plex Sans, Carbon theme tokens, export, reset, fullscreen and keyboard behavior stay identical across applications.

Scientific series colours and axis semantics remain application-owned because they encode physical quantities. Canvas simulations, GDS previews and React Flow diagrams are not forced into the Plotly contract.

Shared Carbon `g10` workbench components for the jorpago2 scientific web applications. The package owns interface structure, navigation, responsive behavior and scientific-result status; consuming applications retain all domain state and numerical logic.

`ScientificHeader`, `ScientificTaskPanel`, `ScientificToolRail`, `InspectorPanel` and `ScientificStatus` compose Carbon React's `Header`, `Layer`, `SideNav`, `ComposedModal` and `IconIndicator` primitives. Carbon owns their semantics, focus behavior and visual states; the package adds only scientific workflow state and responsive composition.

`ScientificToolRail` is the normative application navigation: the canonical 256 px Carbon `SideNav` from `lg`, with 32 px rows, 16 px padding and icons, 14 px semibold labels, and a 4 px selected indicator. Below `lg`, the same semantic `SideNav` is presented as a 56 px bottom bar. This mobile presentation is the sole documented shell exception.

Pass `help={{ summary, shortcuts, action, footer }}` to `ScientificHeader` to render the canonical Carbon Help action at the far-right edge. The package owns its official icon, toggletip, `?` shortcut, Escape handling, responsive geometry and focus restoration; applications provide only workflow-specific content.

```tsx
import { ScientificHeader, ScientificStatusBar } from "@jorpago2/scientific-ui";
import "@jorpago2/scientific-ui/styles.css";
```

Load the shared stylesheet after application styles. Consumers may position the rail container, but must not target `scientific-tool-rail__*` descendants; their geometry and states are part of the package contract.

Application headers use Carbon `Header`, `HeaderName` and `HeaderGlobalBar`; legacy adapters use `scientific-app-header` only while they are migrated. The shared contract follows Carbon UI Shell Header: the active theme's semantic tokens, a 48 px height and a subtle border. Applications may provide product, context and actions without redefining that shell geometry.

Task panels use `ScientificTaskPanel`: a Carbon `Layer` surface with a 72 px heading, 16 px spacing, a single scrolling body and a 360–384 px desktop width. At smaller breakpoints the panel uses the available width. Consumers own only grid placement and domain content; they must not redefine panel padding, heading geometry, borders or scrolling.

Themes must be supplied by Carbon (`GlobalTheme` or `Theme`). Shared CSS consumes the resulting semantic `--cds-*` values and never selects internal `.cds--*` classes.

All interface text and scientific values use IBM Plex Sans. Numeric controls, metrics, units and status metadata retain tabular numerals for stable alignment; use `scientific-value`, `scientific-coordinate` or `scientific-identifier` for local readouts that remain outside shared components.

## Composition APIs

Use `ScientificUiProvider` at the application root. It applies Carbon `g10`/`g100` to the complete document, including portaled menus and modals, and installs one shortcut registry and one notification surface.

- `ScientificCommandBar` owns visible/overflow action priority and can respond to either the viewport or its containing result region.
- `ScientificRunControl` presents run, pause, resume, stop, progress and live execution state without owning a solver.
- `ScientificPanelSection`, `ScientificParameterGroup`, `ScientificFieldRow` and `ScientificPanelFooter` define panel rhythm and responsive form composition.
- `ScientificResultsLayout`, `ScientificResultsToolbar`, `ScientificMetricGrid` and `ScientificLegend` define result hierarchy while charts remain local.
- `ScientificStatusBar` is a root workbench footer by default; pass `embedded` only when the owning stage already accounts for responsive navigation in a legacy adapter.
- `ScientificViewportToolbar` exposes zoom and fit callbacks with official Carbon icons. It never introduces a minimap or mini-preview.
- `ScientificProjectActions` and `ExportReceipt` provide reproducibility actions and explicit export feedback.
- `ScientificPreflightSummary` reports whether inputs, discretization and stability are ready for execution.
- `ScientificValidationSummary` reports independent convergence, conservation and reference checks; a completed solver is not automatically validated.
- `ScientificModelScope` keeps assumptions and interpretation limits next to the scientific result.
- `ScientificResultProvenance` and `ScientificReproducibilityManifest` bind a result to its solver, inputs, mesh and generation context.

Evidence-heavy views may import from `@jorpago2/scientific-ui/scientific-layout` so secondary review panels can be loaded on demand without increasing the initial application bundle.

Input validity, execution, result freshness, numerical convergence, scientific validation and project save state are separate contracts. `up-to-date` means that a result corresponds to current inputs; use `validated` only after all applicable evidence checks have passed.

Application code should pass descriptors and callbacks. It must not wrap every Carbon primitive or move scientific state into this package.

```tsx
import {
  ScientificRunControl,
  ScientificUiProvider,
  ScientificViewportToolbar,
} from "@jorpago2/scientific-ui";

root.render(
  <ScientificUiProvider theme="system">
    <App />
  </ScientificUiProvider>,
);
```

Actions with a `shortcut` register automatically and appear in the shared header Help. Use `useScientificShortcut` for application-specific commands and `useScientificNotifications` for transient Carbon notifications.

## CSS ownership

Run `pnpm check:conformance` in this package. Consumer CI can call `node node_modules/@jorpago2/scientific-ui/scripts/check-conformance.mjs src` to reject internal Carbon selectors, `!important` and local overrides of shared shell geometry. Domain colors remain allowed only in scientific rendering code.

## Commands

- `pnpm build` emits ESM, declarations and the shared stylesheet.
- `pnpm test` validates number parsing and keyboard contracts.
- `pnpm check:conformance` validates CSS ownership.
- `pnpm test:ui` checks responsive behavior and accessibility.
- `pnpm storybook` opens the component catalogue.

Consumers must provide React 19.2, React DOM 19.2, Carbon React 1.113 and a Carbon `g10` theme context.
