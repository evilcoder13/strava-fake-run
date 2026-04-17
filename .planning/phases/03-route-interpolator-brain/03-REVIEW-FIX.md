---
phase: 03-route-interpolator-brain
fixed_at: 2026-04-17T09:19:00Z
review_path: .planning/phases/03-route-interpolator-brain/03-REVIEW.md
iteration: 1
findings_in_scope: 5
fixed: 5
skipped: 0
status: all_fixed
---

# Phase 03: Code Review Fix Report

**Fixed at:** 2026-04-17T09:19:00Z
**Source review:** .planning/phases/03-route-interpolator-brain/03-REVIEW.md
**Iteration:** 1

**Summary:**
- Findings in scope: 5
- Fixed: 5
- Skipped: 0

## Fixed Issues

### WR-01: `fetchSnappedPath()` called inside `set()` updater reads stale state

**Files modified:** `store/useRouteStore.ts`
**Commit:** 81d1704
**Applied fix:** Removed all four `state.fetchSnappedPath()` calls from inside the Zustand `set()` updater callbacks in `addWaypoint`, `removeWaypoint`, `reorderWaypoints`, and `moveWaypoint`. Each action now calls `useRouteStore.getState().fetchSnappedPath()` after `set()` returns, so the fetch always reads the freshly committed waypoints state.

---

### WR-02: Division by zero when `totalSeconds === 0` produces `NaN` heart rate

**Files modified:** `lib/biometric-simulator.ts`
**Commit:** 3415193
**Applied fix:** Added a ternary guard on line 45 of `computeHR`: `const drift = totalSeconds > 0 ? (elapsedSeconds / totalSeconds) * 5 : 0;`. When the route produces only a single interpolated point (`totalSeconds === 0`), cardiac drift is now 0 instead of `NaN`.

---

### WR-03: `startTime` with seconds component produces invalid ISO timestamp

**Files modified:** `lib/route-interpolator.ts`
**Commit:** b6d9a2c
**Applied fix:** Added `const normalizedTime = startTime.substring(0, 5)` before building the date string, ensuring only `"HH:MM"` is used regardless of whether the browser returns `"HH:MM:SS"`. Also added a `isNaN(startMs)` guard that throws a descriptive error if the date construction still fails.

---

### WR-04: `setConfig` accepts action functions, can silently overwrite store methods

**Files modified:** `store/useRouteStore.ts`
**Commit:** 003e732
**Applied fix:** Introduced a `RouteConfig` type alias using `Pick<RouteState, 'startDate' | 'startTime' | 'paceMinutes' | 'paceSeconds' | 'useNoise'>`. Updated both the `RouteState` interface declaration and the `setConfig` implementation to use `Partial<RouteConfig>` instead of `Partial<RouteState>`, preventing callers from passing action functions.

---

### WR-05: Probabilistic noise test has inherent flakiness risk

**Files modified:** `lib/__tests__/route-interpolator.test.ts`
**Commit:** d52d8cc
**Applied fix:** Added `vi` to the vitest import. Replaced the unseeded noise test with a version that mocks `Math.random` to a fixed repeating sequence `[0.5, 0.5]` using `vi.spyOn`. The Box-Muller transform with these inputs yields a deterministic `z0 ≈ -1.177`, producing a noisy pace of ~310.6 s/km vs the deterministic 330 s/km — guaranteed to differ. `vi.restoreAllMocks()` is called inline before the deterministic run to avoid polluting other tests. Removed the unused `afterEach` import.

---

_Fixed: 2026-04-17T09:19:00Z_
_Fixer: Claude (gsd-code-fixer)_
_Iteration: 1_
