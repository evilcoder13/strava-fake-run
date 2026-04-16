---
phase: 02
plan: 02-01
subsystem: ui-controls
tags: [map, osrm, snap-to-road]
dependency_graph:
  requires: []
  provides: [map-snapped-path]
  affects: [map-component, route-store]
tech_stack:
  - zustand
  - react-leaflet
  - OSRM (Open Source Routing Machine)
key-files:
  - created: []
  - modified: [store/useRouteStore.ts, components/Map.tsx]
decisions:
  - "OSRM used for snap-to-road API (https://router.project-osrm.org)"
  - "Coordinate conversion from OSRM [lon, lat] to Leaflet [lat, lon] required"
  - "Fallback to point-to-point path when OSRM fails"
  - "Fire-and-forget async fetchSnappedPath called after waypoint updates"
metrics:
  duration_seconds: 45
  completed_tasks: 2
  file_count: 2
  tasks_completed: 2
  tasks_total: 2
---

# Phase 02 Plan 02-01: Integrate snap-to-road API Summary

## Overview

Integrate OSRM (Open Source Routing Machine) API to snap user-drawn waypoints to real road geometry, creating realistic running routes. The snapped path is stored in the route state and rendered on the map.

## Implementation Details

### Task 1: Extend useRouteStore

**Files Modified:** `store/useRouteStore.ts`

**Changes Made:**
1. Added `snappedPath: [number, number][]` property to `RouteState` interface
2. Initialized `snappedPath` to empty array in store
3. Implemented `fetchSnappedPath()` async function that:
   - Checks if at least 2 waypoints exist
   - Constructs OSRM endpoint URL: `https://router.project-osrm.org/route/v1/foot/${waypointsString}?overview=full&geometries=geojson`
   - Fetches route geometry from OSRM
   - Maps OSRM coordinates `[lon, lat]` to Leaflet coordinates `[lat, lon]`
   - Falls back to point-to-point straight line if OSRM fails
4. Called `fetchSnappedPath()` from all waypoint mutation functions:
   - `addWaypoint`
   - `removeWaypoint`
   - `reorderWaypoints`
   - `moveWaypoint`

### Task 2: Update Map Component

**Files Modified:** `components/Map.tsx`

**Changes Made:**
1. Imported `snappedPath` from `useRouteStore`
2. Updated Polyline rendering to use `snappedPath` instead of raw waypoint coordinates
3. Conditionally render Polyline only when `snappedPath.length > 0`

## Verification

When 2 or more waypoints are added:
- `snappedPath` populates from OSRM API
- Polyline on map follows real road geometry
- Coordinate conversion from `[lon, lat]` to `[lat, lon]` is correct
- Failed OSRM requests fall back to straight-line paths

## Acceptance Criteria Met

- [x] `useRouteStore.ts` exports `snappedPath` as an array
- [x] OSRM fetch string contains `https://router.project-osrm.org/route/v1/foot/`
- [x] Array mapped from `[lon, lat]` to `[lat, lon]` before saving to `snappedPath`
- [x] Functions updating waypoints trigger `fetchSnappedPath()`
- [x] `Map.tsx` imports `snappedPath`
- [x] `<Polyline>` is rendered using `positions={snappedPath}`

## Commits

- `64a7e6b`: feat(02-01): add snappedPath and fetchSnappedPath to useRouteStore
- `17993f0`: feat(02-01): update Map to render snapped path

## Technical Notes

**Coordinate System:**
- OSRM returns coordinates in `[lon, lat]` format (web mercator)
- Leaflet requires coordinates in `[lat, lon]` format
- Mapping function: `coords.map(([lon, lat]: [number, number]) => [lat, lon])`

**Error Handling:**
- If OSRM API fails (network error, non-2xx response), falls back to point-to-point path
- Logged to console for debugging
- No user-facing errors (maintains smooth UX)

**Future Improvements:**
- Add loading state while fetching from OSRM
- Cache OSRM responses to reduce API calls
- Consider adding pace/time estimates from OSRM response
