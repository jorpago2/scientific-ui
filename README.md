# @jorpago2/scientific-ui

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

## Commands

- `pnpm build` emits ESM, declarations and the shared stylesheet.
- `pnpm test` validates scientific number parsing.
- `pnpm test:ui` checks responsive behavior and accessibility.
- `pnpm storybook` opens the component catalogue.

Consumers must provide React 19.2, React DOM 19.2, Carbon React 1.113 and a Carbon `g10` theme context.
