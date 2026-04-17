# Research: Phase 08 — Data Preview Charts

## Goal
Implement interactive Pace-vs-Distance and Heart Rate-vs-Distance charts to provide immediate feedback after generation (VIZ-01, VIZ-02).

## Technical Analysis

### Library Selection: Recharts
*   **Pros**: Declarative components, responsive by default, easy to style with CSS/Tailwind, widely used in React.
*   **Cons**: Can have hydration issues in Next.js (fixed by dynamic imports or checking `window`).
*   **Installation**: `npm install recharts`.

### Data Preparation
*   `generatedActivity` (from store) is an array of `ActivityPoint`.
*   We need to map this to a chart-friendly format:
    ```json
    [
      { "dist": "1.2", "pace": 5.5, "hr": 145 },
      ...
    ]
    ```
*   **Pace Conversion**: Store `paceSecPerKm` or similar? `ActivityPoint` currently has `lat, lon, heartRate, cadence, elevation, distFromStartKm`. It does NOT have `pace`.
*   Wait, I need to calculate instantaneous pace for the chart or just use the target pace?
    *   Since biometrics are now noisy and gradient-aware, the pace *could* be noisy too if we implement it, but currently pace is constant.
    *   Requirement VIZ-01: "pace-over-distance chart".
    *   If pace is constant, the chart will be a flat line (boring).
    *   However, even if constant, it's good to see it vs distance.
    *   Actually, let's look at `ActivityPoint` again.
    *   `lib/types/activity.ts` -> `ActivityPoint` has `heartRate` and `cadence`.
    *   I should probably add `pace` to `ActivityPoint` if I want to chart it, or calculate it from time difference.

### UI Integration
*   The charts should appear only *after* generation.
*   They should probably be placed at the bottom of the Sidebar or in a collapsible "Preview" panel.
*   Sidebar is already getting crowded. A collapsible section is best.

## Proposed Changes

### 1. `lib/types/activity.ts`
*   Add `paceMinutes: number` or `speedKph: number` to `ActivityPoint` to make charting easier.

### 2. `store/useRouteStore.ts`
*   Populate the new pace field during `generateActivity`.

### 3. Components
*   `components/ActivityCharts.tsx`: A new file containing the `Recharts` implementation for both Pace and HR.
*   Dynamic import in `Sidebar.tsx` to avoid SSR issues with Recharts.

## Verification Plan
*   **Visual**: Generate a route and check that the charts render correctly with appropriate colors (Orange for HR, Blue/Green for Pace).
*   **Responsiveness**: Ensure sidebar resizing doesn't break chart layout.
*   **Interaction**: Verify tooltip hover shows exact values at points.
