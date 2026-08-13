# Design — Scientific UI

This is the normative design system for the shared scientific workbench package.

## Foundation

- Genre: modern-minimal technical workbench.
- Theme: Carbon `g10`; custom UI colors are semantic aliases of `--cds-*` tokens.
- Typography: IBM Plex Sans for all interface text and scientific values; numeric roles use tabular numerals.
- Geometry: square Carbon surfaces and controls; no decorative shadows, pills or gradients.
- Motion: only functional state transitions, with reduced-motion support.

## Workbench structure

Application pages use one product header, workflow navigation, one controlled task panel, a dominant scientific stage, an optional contextual inspector and a concise status bar. Help is always the final action at the far right of the product header and uses the shared Carbon toggletip. On mobile, workflow navigation moves to the bottom, every icon shares the exact horizontal center axis of its visible label, and an open task panel becomes the active workspace layer; no mini-preview or minimap is introduced.

The product header is 48 px high. Its theme action precedes Help, which remains the terminal action. Theme preference is persisted, follows the operating system until explicitly changed and applies Carbon `g10` or `g100` to chrome, panels, overlays, plots and scientific content. Desktop workflow navigation is 256 px wide. The task panel is 360–384 px wide with a 72 px shared heading and one shared scrolling body. Application styles may position these regions but may not redefine their surface, type, spacing, border, active state or focus behavior.

## Scientific exceptions

Domain colors are allowed only for data series, material identity, device regions, field maps and geometry. Every meaning must also be available through text, shape, pattern or position.

## Command and content contracts

Actions are ordered primary, visible secondary, then overflow. Collapse decisions belong to `ScientificCommandBar`; applications do not hide buttons with local media queries. Result and canvas toolbars respond to their available container width because a stage can be narrow even at a desktop viewport.

Task-panel content uses shared sections, parameter groups and footers. One-column groups are the default; two-column groups are reserved for short, directly comparable quantities. Labels remain visible, units align with values and helper/error text stays attached to its field.

Scientific values use one copy-friendly formatter: standard notation in the normal engineering range, compact `e` notation at very small or large magnitudes, no grouped thousands and no negative zero. Field errors remain adjacent to their input; summaries link back to and focus the affected control.

Execution is communicated with text and icon through the shared state machine. `running`, `paused`, `modified`, `up-to-date`, warning and failure states never depend on color alone. Project export/import controls use the shared action hierarchy and successful exports produce an explicit receipt or notification.

Results use a title, optional status/switcher, contextual toolbar, scientific content and optional details region. Rendering engines and scientific palettes remain local. Viewport commands are Zoom in/out, Fit width, Fit selection, Fit all and Reset; mini-previews and minimaps are not part of the system.

After an operation, `ScientificOutcomeSummary` is the first visible result surface. It states what happened, whether the result matches current inputs, the few quantities needed for first interpretation and the available next actions. Successful execution, scientific validation and export remain independent states; applications must not replace this handoff with an undifferentiated success toast or force users to hunt through tabs for the primary result.

Reproducible examples follow one explicit sequence: load the example, allow the user to inspect the inputs, then run it. Completion reveals and focuses the primary outcome; initial page load never moves focus automatically.

The application root uses `ScientificUiProvider`. Theme selection must affect portaled Carbon overlays as well as the visible workbench. Registered keyboard commands are discoverable in Header Help and are dispatched by a single provider.

## Conformance

All components and consumers are verified at 320, 375, 414, 768, 1024 and 1440 CSS pixels. Page-level horizontal overflow, inaccessible focus, two-line action labels and controls smaller than 44 px on coarse pointers are release blockers.
