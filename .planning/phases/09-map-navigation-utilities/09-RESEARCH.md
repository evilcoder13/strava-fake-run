# Research: Phase 09 — Map Navigation Utilities

## Goal
Implement address search and geolocation functionality to help users quickly navigate the map (NAV-01, NAV-02, NAV-03).

## Technical Analysis

### 1. Address Search (NAV-01, NAV-03)
*   **Provider**: OpenStreetMap Nominatim. It's free, requires no API key, and provides good global coverage.
*   **Implementation**:
    *   A simple text input in the Sidebar or an overlay on the Map.
    *   On enter, fetch `https://nominatim.openstreetmap.org/search?format=json&q={query}`.
    *   Display a list of results (if multiple) or fly to the first one.
    *   Requirement: Must include a proper `User-Agent` as per Nominatim's usage policy.

### 2. Geolocation (NAV-02)
*   **Provider**: Browser `navigator.geolocation` API.
*   **Implementation**:
    *   A "Locate Me" button (suggest icon: `Navigation` or `MapPin`).
    *   On click, run `navigator.geolocation.getCurrentPosition`.
    *   Update `MapComponent` view using Leaflet's `map.setView` or `map.flyTo`.

## Proposed Changes

### `components/MapComponent.tsx`
*   Need a way to communicate "Fly To" commands from the Sidebar to the Map.
*   We can use a new store property `mapViewCommand` or just expose the `map` instance via a ref in the store.
*   Better yet: `useRouteStore` can have a `setCenter(lat, lon)` action that the `MapComponent` listens to via a `useEffect`.

### `components/Sidebar.tsx`
*   Add a `Search` input at the top.
*   Add a `Locate Me` button near the search or waypoint management.

## Risk Assessment
*   **Geolocation Permission**: Users might deny permission. We need a graceful error message (toast).
*   **Nominatim Limiting**: We should debounce the search to avoid hitting the rate limit (1 request per second).

## Verification Plan
*   **Search**: Type "Paris" and verify map flies to France.
*   **Geolocation**: Click button and verify map zooms to current city.
*   **Privacy**: Verify geolocation only triggers on user click.
