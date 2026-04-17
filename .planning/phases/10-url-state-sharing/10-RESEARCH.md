# Research: Phase 10 — URL State Sharing

## Goal
Enable users to share their plotted routes and settings via a single shareable link (SHR-01, SHR-02).

## Technical Analysis

### 1. State Selection
What needs to be in the URL?
*   **Waypoints**: Just `lat, lng`. IDs can be re-generated on load.
*   **Config**: `startDate`, `startTime`, `timezoneOffset`, `paceMinutes`, `paceSeconds`, `useNoise`, `useSpeedUnit`, `activityType`.
*   **Sport Profile**: Inferred from `activityType`.

### 2. Serialization Format
*   **Option A: JSON + Base64**
    *   Pros: Simple, native-ish.
    *   Cons: Strings get long quickly.
*   **Option B: Compressed Binary (LZString / Pako)**
    *   Pros: Very short URLs.
    *   Cons: Extra dependency.
*   **Recommendation**: Start with **JSON + URL-safe Base64**. If URL length becomes an issue for long routes (>50 waypoints), we can add compression later.

### 3. Implementation in Next.js
*   **Sync Direction**: Store → URL (Push) and URL → Store (Initial Load).
*   **Store → URL**: `useRouteStore.subscribe` or a `useEffect` in the layout.
*   **URL → Store**: On mount, check `window.location.search`, decode, and call `setWaypoints` and `setConfig`.

### 4. UI: Copy Share Link
*   A button in the Sidebar (near "Download" buttons) that copies the current URL to clipboard.
*   Use `navigator.clipboard.writeText`.

## Proposed Changes

### `lib/url-state.ts` (New)
*   `serialize(state): string`
*   `deserialize(string): PartialState`

### `components/UrlSync.tsx` (New)
*   A hidden component or hook used in `layout.tsx` to handle the sync logic.
*   Prevents infinite loops by checking if the URL data is already the same as current store.

### `components/Sidebar.tsx`
*   Add "Share Route" button.

## Risk Assessment
*   **URL Length**: Max length is ~2000 chars. 100 waypoints at ~15 chars each = 1500 chars. Close, but manageable for recreational routes.
*   **Security**: Ensure decoded JSON is validated before applying to state.

## Verification Plan
*   Plot a route, click "Share". Paste in a new incognito window. Verify everything matches.
*   Modify a setting (e.g., pace), verify the URL updates.
