# @jorpago2/scientific-ui

Shared Carbon workbench and scientific-result components for the interactive simulation applications. Applications own domain state and numerical logic; this package owns the common shell and interaction contract.

## Main API

The default entry point contains the common workbench and domain-oriented building blocks:

- `ScientificUiProvider`, `ScientificAppShell`, `ScientificHeader`, `ScientificToolRail`, `ScientificTaskPanel` and `ScientificStatusBar`;
- shared recovery, numeric fields, actions, responsive navigation and empty states;
- scientific outcome, evidence, validation, provenance and model-scope layouts;
- Plotly theme, layout, configuration and toolbar helpers;
- scientific number parsing and formatting;
- autosave serialization and recovery logic;
- result freshness and reveal transitions;
- shared scientific state and descriptor types.

```tsx
import {
  ScientificOutcomeSummary,
  ScientificValidationSummary,
  createScientificPlotlyLayout,
  useScientificAutosave,
} from "@jorpago2/scientific-ui";
import "@jorpago2/scientific-ui/styles.css";
```

Use Carbon React directly for domain-specific controls that do not have a shared scientific contract. Do not recreate the shell, rail, panel, recovery placement or status bar locally. The normative geometry and responsive behavior are documented in [`docs/application-contract.md`](docs/application-contract.md).

## Plot contract

`SCIENTIFIC_PLOT_LINE_WIDTHS` defines trace hierarchy. `ScientificPlotFrame`, `createScientificPlotlyLayout`, `createScientificPlotlyConfig` and `prepareScientificPlotlyToolbar` keep typography, tokens, export, reset, fullscreen and keyboard behavior consistent. Series colours and physical semantics remain application-owned.

## CSS ownership

Carbon owns primitive appearance and interaction. Shared CSS supplies workbench geometry, responsive behavior, scientific result layouts and tokens. Consumers must not target Carbon internal classes or redefine shared shell dimensions.

## Commands

- `pnpm test`
- `pnpm typecheck`
- `pnpm build`
- `pnpm test:ui`
- `pnpm check:conformance`
- `pnpm check:contract`
- `pnpm check:consumer-conformance`
- `pnpm check:consumers`

Consumers provide React 19.2, React DOM 19.2 and Carbon React 1.113.
