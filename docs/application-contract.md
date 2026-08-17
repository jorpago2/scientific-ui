# Scientific application contract

This contract defines the common chrome and interaction rules for the browser-based scientific applications. Domain content can differ; application structure must not drift accidentally.

## Required structure

- `ScientificUiProvider` owns the Carbon `g10`/`g100` theme.
- `ScientificHeader` is 48 px high and presents product identity, current context, one primary scientific action, secondary utilities, theme and Help in that order.
- `ScientificToolRail` is 256 px wide from the `lg` breakpoint and becomes a 56 px bottom navigation below it.
- `ScientificTaskPanel` is 384 px wide on desktop and fills the available workbench width below `lg`.
- `ScientificStatusBar` is 40 px high. Document save state, calculation state and scientific quality remain separate values.
- `ScientificAppShell` is the single owner of rail, panel, stage, recovery and status placement.

Applications may choose `previewStageWhenPanelOpen` only when a read-only preview materially helps configure the model. Otherwise a compact panel replaces the stage. Preview content is inert and must not expose interactive descendants.

## Header actions

Each header has at most one primary scientific action. Import, export, reset, project and view commands are secondary actions or responsive overflow items. Icon-only actions require an accessible name. Product identity remains visible at every supported width.

## Panels and recovery

Rail selection, `aria-expanded`, panel visibility and Close are controlled by the same React state. When a panel is open, `ScientificAppShell` places session recovery in the panel flow before its scrollable content. Recovery must never cover Close, search, tabs, fields or footer actions.

## Controls

- Use `ScientificNumberField` for editable scientific numbers unless a Carbon control supplies a required interaction that it cannot represent.
- Labels include units accessibly; displayed values use tabular numerals.
- Temporary empty and partial numeric input remains editable until blur or Enter.
- Primary touch targets and all tabs are at least 44 px high on coarse pointers and below `lg`.
- Tabs use roving keyboard behavior supplied by Carbon and scroll or wrap without reducing target height.

## Results

The standard order is outcome, explanation and actions, key metrics, result switcher, plot/canvas, then numerical evidence and model limits. `ScientificPlotFrame` owns plot heading, toolbar placement and accessible description. Applications provide an associated table or textual data summary when a graphic contains values needed to interpret the result.

Canvas surfaces normally follow Carbon theme tokens. A scientifically meaningful permanently dark viewport uses `scientific-render-surface--dark`, including its shared border and contrast treatment, rather than an undocumented local theme override.

## State vocabulary

Use `ScientificState` for calculation/result state: `needs-input`, `ready`, `running`, `paused`, `up-to-date`, `modified`, `validated`, `warning` or `failed`. Do not infer these states from message text. A saved document is not necessarily calculated or scientifically validated.

## Verification

Every consumer checks the affected flow at 1440 x 900 and 390 x 844 in `g10` and `g100`. Shared release validation additionally covers 320, 768 and 1024 px, keyboard navigation, axe, recovery, panel toggling, the primary action and horizontal overflow.
