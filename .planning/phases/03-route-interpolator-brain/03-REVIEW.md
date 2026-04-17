---
phase: 03-route-interpolator-brain
reviewed: 2026-04-17T00:00:00Z
depth: standard
files_reviewed: 11
files_reviewed_list:
  - lib/types/activity.ts
  - lib/route-interpolator.ts
  - lib/__tests__/route-interpolator.test.ts
  - lib/__tests__/biometric-simulator.test.ts
  - lib/__tests__/elevation-simulator.test.ts
  - vitest.config.ts
  - package.json
  - store/useRouteStore.ts
  - lib/biometric-simulator.ts
  - lib/elevation-simulator.ts
  - components/Sidebar.tsx
findings:
  critical: 0
  warning: 5
  info: 5
  total: 10
status: issues_found
---

# Phase 03: Code Review Report

**Reviewed:** 2026-04-17T00:00:00Z
**Depth:** standard
**Files Reviewed:** 11
**Status:** issues_found

## Summary

All eleven Phase 3 source files were reviewed. The core computation pipeline (`route-interpolator.ts`, `biometric-simulator.ts`, `elevation-simulator.ts`) is logically sound and well-structured. The types contract in `activity.ts` is clean.

The most significant issues are in `store/useRouteStore.ts`: async side-effects (`fetchSnappedPath`) are called inside Zustand's synchronous `set()` updater, which means the fetch always reads the _previous_ state (the waypoint mutation has not yet been committed when the fetch fires). A `totalSeconds === 0` path in the biometric simulator could produce `NaN` heart-rate values. The remaining issues are dead code, input validation gaps, and minor DX problems.

---

## Warnings

### WR-01: `fetchSnappedPath()` called inside `set()` updater reads stale state

**File:** `store/useRouteStore.ts:46` (also lines 53, 63, 70)
**Issue:** Zustand's `set(updater)` callback is synchronous and purely for computing new state. Calling `state.fetchSnappedPath()` _inside_ the updater launches the async fetch before Zustand has committed the new waypoints. `fetchSnappedPath` reads state via `useRouteStore.getState()` at line 142, so it always sees the state _before_ the current mutation (e.g., `addWaypoint` fires the fetch with the old waypoints list).

This means the snapped path is always one waypoint behind, and the freshly-added/moved/removed waypoint is never reflected in the first fetch attempt.

**Fix:** Move the `fetchSnappedPath()` call to _after_ the state update, outside the updater, using the store's `set` callback or a dedicated effect at the call site:
```typescript
addWaypoint: (lat: number, lng: number) => {
  const id = Date.now().toString() + Math.random().toString(36).substring(2, 9);
  set((state) => ({ waypoints: [...state.waypoints, { id, lat, lng }] }));
  // fetchSnappedPath reads getState() — call after set() commits
  useRouteStore.getState().fetchSnappedPath();
},
```
Apply the same pattern to `removeWaypoint`, `reorderWaypoints`, and `moveWaypoint`.

---

### WR-02: Division by zero when `totalSeconds === 0` produces `NaN` heart rate

**File:** `lib/biometric-simulator.ts:44` (caller: `store/useRouteStore.ts:114`)
**Issue:** `computeHR` computes `drift = (elapsedSeconds / totalSeconds) * 5`. If `totalSeconds` is `0` (which happens when `points` has exactly one element, i.e., a route shorter than a single 10-second pace-step), this evaluates to `NaN`. The resulting `activity` array will contain `heartRate: NaN`, which will silently propagate to any GPX/FIT export.

`store/useRouteStore.ts` line 114 already guards `points.length === 0` at line 97, but a single-point result is possible and not guarded.

**Fix:** Add a guard in `computeHR`:
```typescript
const drift = totalSeconds > 0
  ? (elapsedSeconds / totalSeconds) * 5
  : 0;
```
Alternatively, guard `totalSeconds` at the call site in `useRouteStore.ts`:
```typescript
const totalSeconds = points.length > 1
  ? points[points.length - 1].elapsedSeconds
  : 0;
```
...and accept that a single-point activity produces no cardiac drift.

---

### WR-03: `startTime` with seconds component produces invalid ISO timestamp

**File:** `lib/route-interpolator.ts:30`
**Issue:** The code constructs `new Date(`${startDate}T${startTime}:00.000Z`)`. The `startTime` field in `InterpolateOptions` is documented as `"HH:MM"`. However, HTML `<input type="time">` in some browsers can return `"HH:MM:SS"` when the user has seconds enabled. If `startTime` is `"08:00:30"`, the constructed string becomes `"2024-01-15T08:00:30:00.000Z"`, which is not valid ISO 8601. `new Date()` will parse this as `NaN`, making every generated timestamp `"Invalid Date"`.

**Fix:** Strip any seconds component from `startTime` before constructing the date string, or validate the format:
```typescript
const normalizedTime = startTime.substring(0, 5); // "HH:MM"
const startMs = new Date(`${startDate}T${normalizedTime}:00.000Z`).getTime();
```
Additionally, add a guard:
```typescript
if (isNaN(startMs)) throw new Error(`Invalid startDate/startTime: ${startDate} ${startTime}`);
```

---

### WR-04: `setConfig` accepts action functions, can silently overwrite store methods

**File:** `store/useRouteStore.ts:77`
**Issue:** `setConfig: (config: Partial<RouteState>) => void` types its argument as `Partial<RouteState>`. `RouteState` includes action functions (`generateActivity`, `fetchSnappedPath`, etc.). Any caller can accidentally (or intentionally) call `setConfig({ generateActivity: undefined })` and replace a store action with `undefined`, breaking subsequent calls.

**Fix:** Restrict the config type to only data fields using `Omit` or a dedicated interface:
```typescript
type RouteConfig = Pick<RouteState,
  'startDate' | 'startTime' | 'paceMinutes' | 'paceSeconds' | 'useNoise'
>;
setConfig: (config: Partial<RouteConfig>) => void;
```

---

### WR-05: Probabilistic noise test has inherent flakiness risk

**File:** `lib/__tests__/route-interpolator.test.ts:84` (the `useNoise=true` test, also line 84 of same file)

**File:** `lib/__tests__/route-interpolator.test.ts:57-86`
**Issue:** The test at line 57 ("useNoise=true produces at least one interval different from deterministic pace") asserts that at least one distance value differs between the noisy and deterministic runs. With Gaussian noise at 5% stdDev over ~15 points, the probability of all values being identical to within `0.0001` is astronomically small, but the test is technically flaky — it can fail without any code change if the RNG produces identical-enough results. There is no seeded RNG to guarantee determinism.

**Fix:** Either mock `Math.random` to a known sequence for this test, or reframe the test to assert statistical properties (e.g., point _count_ differs, which is also checked). The comment on line 81 documents the intent well, but the assertion itself still relies on RNG state.

---

## Info

### IN-01: Dead code — redundant inner `if` inside `while` loop

**File:** `lib/route-interpolator.ts:38`
**Issue:** The inner `if (cumDistKm >= totalKm) break;` on line 38 is inside `while (cumDistKm < totalKm)`. The inner condition can never be true when the loop body is entered; this is dead code. It suggests a refactoring artifact.

**Fix:** Remove lines 37–38:
```typescript
// Delete these two lines — the while condition already handles termination
if (cumDistKm >= totalKm) break;
```

---

### IN-02: `gaussianRandom` is duplicated across two modules

**File:** `lib/route-interpolator.ts:7-13` and `lib/biometric-simulator.ts:6-12`
**Issue:** The identical Box-Muller implementation is copy-pasted verbatim into both modules. Any bug fix or improvement would need to be applied in two places.

**Fix:** Extract to a shared internal utility, e.g., `lib/utils/gaussian.ts`, and import it in both modules.

---

### IN-03: No `test` script in `package.json`

**File:** `package.json:5-10`
**Issue:** There is no `"test"` script defined. Developers must know to run `npx vitest` or `./node_modules/.bin/vitest` directly. The standard convention (`npm test`) will fail with "Missing script: test".

**Fix:**
```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "test": "vitest run",
  "test:watch": "vitest"
}
```

---

### IN-04: `vitest.config.ts` enables `globals: true` but test files explicitly import test functions

**File:** `vitest.config.ts:7` and all test files (e.g., `lib/__tests__/route-interpolator.test.ts:1`)
**Issue:** `globals: true` makes `describe`, `it`, `expect`, and `vi` available as globals, but every test file imports them explicitly (`import { describe, it, expect } from 'vitest'`). The setting and the imports are contradictory — the globals are never used. This is harmless but misleading.

**Fix:** Either remove `globals: true` from the config (keeping explicit imports, which is better for IDE support), or remove the explicit imports and rely on globals. Explicit imports are the recommended approach for TypeScript projects.

---

### IN-05: `setConfig` does not clear `generatedActivity` when route parameters change

**File:** `store/useRouteStore.ts:77-79`
**Issue:** When the user changes `paceMinutes`, `paceSeconds`, `useNoise`, `startDate`, or `startTime` via `setConfig`, the previously `generatedActivity` remains in the store. The UI will continue showing the stale point count ("N points generated") until the user explicitly regenerates. This creates a misleading state where the displayed activity does not match the current settings.

**Fix:** Clear `generatedActivity` when route-affecting config changes:
```typescript
setConfig: (config: Partial<RouteConfig>) => {
  const routeAffecting = ['paceMinutes', 'paceSeconds', 'useNoise', 'startDate', 'startTime'];
  const invalidates = Object.keys(config).some(k => routeAffecting.includes(k));
  set(invalidates ? { ...config, generatedActivity: null } : config);
},
```

---

_Reviewed: 2026-04-17T00:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
