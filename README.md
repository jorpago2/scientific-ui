# @jorpago2/scientific-ui

Shared Carbon `g10` workbench components for the jorpago2 scientific web applications. The package owns interface structure, navigation, responsive behavior and scientific-result status; consuming applications retain all domain state and numerical logic.

`ScientificToolRail` is the normative application navigation: a 64 px compact rail on tablet, a 192 px labelled rail at Carbon `lg`, and a 64 px bottom bar on mobile. It owns target sizing, alignment, active/hover/focus/pressed feedback, directional keyboard navigation, Escape-to-close and accessible expanded state.

```tsx
import { ScientificHeader, ScientificStatusBar } from "@jorpago2/scientific-ui";
import "@jorpago2/scientific-ui/styles.css";
```

## Commands

- `pnpm build` emits ESM, declarations and the shared stylesheet.
- `pnpm test` validates scientific number parsing.
- `pnpm test:ui` checks responsive behavior and accessibility.
- `pnpm storybook` opens the component catalogue.

Consumers must provide React 19.2, React DOM 19.2, Carbon React 1.113 and a Carbon `g10` theme context.
