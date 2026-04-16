# Phase 2: UI Controls & Road Snapping - Research

**Objective**: What do I need to know to PLAN this phase well?

## 1. Snap-to-Road Routing Integration

**Requirement MAP-04**: Map utilizes a "snap-to-road" routing API for realistic paths between waypoints.

Currently (Phase 1), our map just draws straight `Polyline` segments between waypoints. We need to convert an array of `waypoints` into a dense, road-snapped path.

**API Options:**
1.  **OSRM (Open Source Routing Machine)**
    *   **Public API**: `http://router.project-osrm.org/match/v1/foot/...` or `http://router.project-osrm.org/route/v1/foot/...`
        *   `route` is for finding a path between start and end (with intermediates).
        *   We can pass all waypoints as coordinates: `lon,lat;lon,lat;...`
    *   **Parameters**: `overview=full&geometries=geojson` to get a high-density LineString.
    *   **Pros**: Free, no API key required, easy to query.
    *   **Cons**: Subject to rate limits / can be slow.
2.  **Mapbox Directions API**
    *   **Pros**: Extremely reliable, great `walking` profiles.
    *   **Cons**: Requires API key and user setup.

**Decision for MVP**: Use the public **OSRM API (`/route/v1/foot`)**. It requires no setup for the user. We will create a `routeStore` or add to `useRouteStore` to store the generated *polylines/path* representing the mapped road separated from the *waypoints* (the user draggable pins).
*   **State Structure**: Data flows from `waypoints` -> fetch OSRM -> store `snappedPath` (an array of coordinates) -> render `<Polyline positions={snappedPath} />`.
*   **Triggering**: Debounce the route fetching every time waypoints change (add/remove/drag).

## 2. UI Controls / Settings

**Requirements CFG-01, CFG-02, CFG-03**:
*   Start date and time input.
*   Target average pace (min/km).
*   Pacing variability/noise toggle.

**UI Approach**:
*   We already have a Sidebar layout from Phase 1.
*   We will add a "Run Settings" section in the Sidebar below or above the waypoints list.
*   **Components needed**:
    *   Date picker (native `<input type="date" />` is fine for MVP, or a custom styled input).
    *   Time picker (`<input type="time" />`).
    *   Target Pace Input: Instead of confusing decimal paces (5.5 min/km), we should provide two inputs or a combined mask for "mm:ss per km" (e.g. `<input name="pace_min"> : <input name="pace_sec">`).
    *   Noise Toggle: A simple sleek switch using Tailwind (`<button role="switch">`).
*   **State Management**: Create a `useConfigStore` (Zustand) or merge into existing store. Setting store is easy to manage globally.
    *   `startDate`: string
    *   `startTime`: string
    *   `paceSeconds`: number (calculated from user mm:ss)
    *   `useNoise`: boolean
    *   Standard `setX` actions.

## 3. Validation Architecture

To satisfy **Dimension 8 (Validation Architecture)**, we need to guarantee that these features work:
*   **Unit Tests/Type Tests**: Ensure Zustand state correctly parses Pace from "mm:ss" to total seconds.
*   **Mocking API**: We don't want OSRM tests to flap due to rate limits. But for a local project, end-to-end (E2E) or visual UAT is best.
*   **UAT**:
    *   When 3 points are dropped, the drawn line must not be a direct triangle, but must follow roads.
    *   When a pace of "05:30" is entered, it persists in the UI and state store.
    *   When "Enable Noise" is clicked, its state toggles and persists.

## 4. Dependencies
*   Native `fetch` for OSRM API queries. No new heavy dependencies required.
*   We will continue using `lucide-react` for icons if needed (e.g. for a Switch icon or Settings gear).

## Summary of Planned Tasks
1. Update `useRouteStore` (or create new ones) to support `snappedPath` and the new Config fields.
2. Implement an `api/osrm.ts` or local helper `getRoute(waypoints)` that hits the public OSRM /route/foot endpoint and updates `snappedPath`.
3. Update `Map.tsx` to render the `snappedPath` instead of drawing straight lines directly between waypoints.
4. Update `Sidebar.tsx` (or a sub-component `ConfigPanel.tsx`) to surface Date, Time, Pace, and Noise toggle UI.
