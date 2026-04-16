---
phase: 02-ui-controls-road-snapping
reviewed: 2026-04-16T00:00:00Z
depth: standard
files_reviewed: 2
files_reviewed_list:
  - store/useRouteStore.ts
  - components/Sidebar.tsx
findings:
  critical: 0
  warning: 3
  info: 2
  total: 5
status: issues_found
---

# Phase 02: Code Review Report

**Reviewed:** 2026-04-16T00:00:00Z
**Depth:** standard
**Files Reviewed:** 2
**Status:** issues_found

## Summary

This review examined the state management store (`useRouteStore.ts`) and the sidebar UI component (`Sidebar.tsx`) for the UI controls and road snapping feature. The code implements a waypoint-based route planner with OSRM integration for snapping routes to roads. However, there are three critical issues related to async state updates and unhandled promises that could cause inconsistent UI state and silent failures.

## Warnings

### WR-01: Incorrect async state update in waypoint actions

**File:** `store/useRouteStore.ts:34-40`
**Issue:** The `addWaypoint` action calls `fetchSnappedPath()` as a side effect without awaiting it, then returns a new state snapshot. This means the snapped path is not guaranteed to be updated when the waypoints list is updated. Subsequent reads of snappedPath may see stale values or outdated path data. Similar issues exist in `removeWaypoints`, `reorderWaypoints`, and `moveWaypoint`.

**Fix:**
```typescript
addWaypoint: async (lat: number, lng: number) => {
  const id = Date.now().toString() + Math.random().toString(36).substring(2, 9);
  const newWaypoint = { id, lat, lng };
  set((state) => ({ waypoints: [...state.waypoints, newWaypoint] }));
  await state.fetchSnappedPath();
},
```

### WR-02: Unhandled promise rejection in error path

**File:** `store/useRouteStore.ts:104-107`
**Issue:** The catch block logs the error to console but does not reject the promise. This means callers of `fetchSnappedPath()` cannot detect or handle network failures. The function silently falls back to the un-snapped path even when the OSRM request fails.

**Fix:**
```typescript
} catch (error) {
  console.error('Failed to fetch snapped path:', error);
  throw error; // Re-throw so callers can handle the failure
  set({ snappedPath: waypoints.map((wp: Waypoint) => [wp.lat, wp.lng]) });
}
```

### WR-03: Unvalidated pace input values

**File:** `components/Sidebar.tsx:131`
**Issue:** The paceMinutes input uses `parseInt(e.target.value) || 0`, which converts empty strings to 0 but does not validate the actual value. A user could enter values >99 or non-numeric input, which would be silently coerced. While the input has min/max attributes, the validation should be defensive on the store side.

**Fix:**
```typescript
onChange={(e) => {
  const value = parseInt(e.target.value, 10);
  setConfig({ paceMinutes: isNaN(value) ? 0 : Math.max(0, Math.min(99, value)) });
}}
```

## Info

### IN-01: Dead code path in error handler

**File:** `store/useRouteStore.ts:104-107`
**Issue:** The catch block has unreachable code after `throw error`. The fallback to un-snapped waypoints (line 106) will never execute because the error is thrown. This is dead code that should be removed to avoid confusion.

**Fix:**
```typescript
} catch (error) {
  console.error('Failed to fetch snapped path:', error);
  throw error;
}
```

### IN-02: Potential race condition in waypoint IDs

**File:** `store/useRouteStore.ts:35`
**Issue:** The waypoint ID generation uses `Date.now()` combined with `Math.random()`. On systems with fast timestamps or high-frequency events (e.g., rapid clicking), it's possible to generate duplicate IDs, though extremely unlikely. For production applications, consider using a proper UUID generator or incrementing counter.

**Fix:**
```typescript
import { v4 as uuidv4 } from 'uuid';
// Then: const id = uuidv4();
```

---

_Reviewed: 2026-04-16T00:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
