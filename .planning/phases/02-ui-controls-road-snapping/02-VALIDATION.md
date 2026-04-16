# Phase 02: ui-controls-road-snapping - Nyquist Validation Strategy

**Target**: ui-controls-road-snapping
**Status**: DRAFT (Planning)

## Validation Architecture

### Dimension 1: Build & Syntax (Static Validation)
- [ ] TypeScript compilation succeeds (`npx tsc --noEmit`).
- [ ] ESLint passes with no critical errors (`npm run lint`).
- [ ] Tailwind CSS compiles successfully.

### Dimension 2: Application Boot (Lifecycle Validation)
- [ ] Next.js development server starts without warnings/errors.
- [ ] Both Sidebar and Map render in browser without hydration mismatch logic errors.

### Dimension 3: UI & Interaction (User Path Validation)
- [ ] Form for Date, Time, Pace (MM:SS), and Noise boolean rendered.
- [ ] Settings edits correctly update and persist in the Zustand state store.
- [ ] Adding/modifying pins on the map seamlessly generates a snapped route instead of straight segment lines.

### Dimension 4: Data Flow & State (Schema Validation)
- [ ] Waypoints mutation triggers an asynchronous fetch to the routing API (OSRM).
- [ ] Debounce logic guarantees the routing API is not spammed on rapid clicks.
- [ ] Response from OSRM (`geometries=geojson` LineString coordinates) is stored as `snappedPath` in Zustand and correctly typed (`[number, number][]`).

### Dimension 5: Error & Boundary (Constraint Validation)
- [ ] If OSRM routing fails or times out, the application catches the error, does not crash, and optionally reverts to Euclidean lines or shows a toaster warning.
- [ ] Pace inputs handle edge cases (e.g. invalid seconds > 59) properly visually or programmatically.

### Dimension 8: Regression / Integration (Coverage Validation)
- [ ] The drag-and-drop feature from Phase 1 persists and triggers a re-snap of the path when item is released.
- [ ] Reordering the sidebar propagates an updated array to OSRM mapping successfully.
