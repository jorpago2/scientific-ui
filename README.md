# @jorpago2/scientific-ui

Shared Carbon `g10` workbench components for the jorpago2 scientific web applications. The package owns interface structure, navigation, responsive behavior and scientific-result status; consuming applications retain all domain state and numerical logic.

`ScientificToolRail` is the normative application navigation: a bottom bar through Carbon `md` and a 256 px left panel from Carbon `lg`. Its desktop geometry follows Carbon's UI shell left-panel specification: 32 px rows, 16 px padding and icons, 14 px semibold labels, and a 4 px selected indicator. It owns alignment, active/hover/focus/pressed feedback, directional keyboard navigation, Escape-to-close and accessible expanded state.

```tsx
import { ScientificHeader, ScientificStatusBar } from "@jorpago2/scientific-ui";
import "@jorpago2/scientific-ui/styles.css";
```

Load the shared stylesheet after application styles. Consumers may position the rail container, but must not target `scientific-tool-rail__*` descendants; their geometry and states are part of the package contract.

Application headers use `scientific-app-header` and their product mark uses `scientific-app-header__brand-mark`. The shared contract fixes the g10 layer surface, 64 px height, subtle rule and 32 px square mark while leaving each application free to arrange product, context, status and actions.

## Commands

- `pnpm build` emits ESM, declarations and the shared stylesheet.
- `pnpm test` validates scientific number parsing.
- `pnpm test:ui` checks responsive behavior and accessibility.
- `pnpm storybook` opens the component catalogue.

Consumers must provide React 19.2, React DOM 19.2, Carbon React 1.113 and a Carbon `g10` theme context.
