# Design — Scientific UI

This is the normative design system for the shared scientific workbench package.

## Foundation

- Genre: modern-minimal technical workbench.
- Theme: Carbon `g10`; custom UI colors are semantic aliases of `--cds-*` tokens.
- Typography: IBM Plex Sans for interface text and IBM Plex Mono for scientific values.
- Geometry: square Carbon surfaces and controls; no decorative shadows, pills or gradients.
- Motion: only functional state transitions, with reduced-motion support.

## Workbench structure

Application pages use one product header, workflow navigation, one controlled task panel, a dominant scientific stage, an optional contextual inspector and a concise status bar. On mobile, workflow navigation moves to the bottom and an open task panel exposes a compact live preview rather than hiding the scientific context completely.

The product header is 48 px high. Desktop workflow navigation is 256 px wide. The task panel is 360–384 px wide with a 72 px shared heading and one shared scrolling body. Application styles may position these regions but may not redefine their surface, type, spacing, border, active state or focus behavior.

## Scientific exceptions

Domain colors are allowed only for data series, material identity, device regions, field maps and geometry. Every meaning must also be available through text, shape, pattern or position.

## Conformance

All components and consumers are verified at 320, 375, 414, 768, 1024 and 1440 CSS pixels. Page-level horizontal overflow, inaccessible focus, two-line action labels and controls smaller than 44 px on coarse pointers are release blockers.
