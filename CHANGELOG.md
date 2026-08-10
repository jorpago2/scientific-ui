# @jorpago2/scientific-ui

## 0.5.7

### Patch Changes

- Remove mini-preview support so open mobile and tablet panels always use the full workbench above bottom navigation.

## 0.5.6

### Patch Changes

- Remove the empty tablet mini-preview row when an application does not provide a preview, and use the Carbon focus token for task-panel headings.

## 0.5.5

### Patch Changes

- Keep bottom-navigation icons and labels above the device safe area and reserve
  the same total height in the mobile workbench and status layout. On small
  screens, open task panels use the full space between the header and bottom
  navigation instead of reserving room for status and mini-preview surfaces.

## 0.5.4

### Patch Changes

- Keep the status bar visible beside desktop navigation and above mobile
  navigation, constrain workbench content and mini-previews to the available
  viewport, preserve each desktop stage's native display mode, and enforce
  shared 44 px workbench targets. Expose header actions as a labelled group.

## 0.5.3

- Standardize task-panel close actions on Carbon's icon-only close button.

## 0.5.2

- Fix Carbon token inheritance for standalone task panels, inspectors, stages and workbenches.
- Keep panel close actions compact while preserving their descriptive accessible labels.

## 0.5.0

### Minor Changes

- Add the canonical Carbon task panel and scientific stage/status surfaces, make panel refs focus-safe, and enforce the shared 360–384 px desktop workbench geometry.

## 0.4.0

### Minor Changes

- Make the shared Carbon header and workflow navigation the canonical responsive chrome, including structured product, context, status, action, and legacy-adapter slots.

## 0.3.5

### Patch Changes

- Guarantee the documented minimum touch target in the responsive workflow navigation, even when consumer styles set a physical height.

## 0.3.4

### Patch Changes

- Compose the shared header, desktop navigation, inspector and scientific status from canonical Carbon React components. Resolve chrome colors from the active Carbon theme and retain the mobile bottom navigation as the sole documented shell exception.

## 0.3.3

### Patch Changes

- Align application headers with Carbon UI Shell Header geometry and theme tokens.

## 0.3.2

### Patch Changes

- Align the scientific tool rail with Carbon's UI shell left-panel geometry, separate selected and expanded state, and make shared navigation and header chrome authoritative for consumers.

## 0.3.1

### Patch Changes

- Align the shared workbench chrome around a 64 px header and keep tool navigation horizontal through the Carbon medium breakpoint.

## 0.3.0

### Minor Changes

- Keep scientific tool labels visible and center icon-label groups consistently across mobile, tablet and desktop layouts.
- ef891bb: Add the shared responsive ScientificToolRail and standardize navigation geometry, interaction states and keyboard behavior.
- 31e63bb: Introduce the Carbon g10 scientific workbench components, semantic states, responsive shell, accessibility behavior and conformance fixture.

# @jorpago2/scientific-ui 0.5.1

- Normalize Carbon header actions to the full 48 px header track.
- Support interactive header context content without invalid inline nesting.
- Enforce 44 px panel actions and mobile form targets.
