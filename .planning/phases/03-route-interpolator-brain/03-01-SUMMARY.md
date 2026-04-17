---
phase: 03
plan: 01
name: "Temporal path distancer with @turf/turf"
subsystem: route-interpolator
tags: [turf, interpolation, typescript, vitest, zustand]
completed: "2026-04-17"
duration_minutes: 15
tasks_completed: 3
files_created: 7
files_modified: 2
commit: a848c06
requirements: [CFG-04]

dependency_graph:
  requires: []
  provides: [lib/route-interpolator.ts, lib/types/activity.ts]
  affects: [store/useRouteStore.ts]

tech_stack:
  added:
    - "@turf/turf ^7.3.4 — spatial geometry: lineString, along, length"
    - "vitest ^4.1.4 — unit test runner with node environment"
    - "@vitest/coverage-v8 ^4.1.4 — v8-based coverage reporter"
  patterns:
    - "Box-Muller transform for Gaussian pacing noise"
    - "Coordinate flip pattern: [lat,lon] Leaflet → [lon,lat] GeoJSON for turf"
    - "Zustand store extension with generateActivity stub"

key_files:
  created:
    - lib/types/activity.ts
    - lib/route-interpolator.ts
    - lib/__tests__/route-interpolator.test.ts
    - lib/__tests__/biometric-simulator.test.ts
    - lib/__tests__/elevation-simulator.test.ts
    - vitest.config.ts
    - package-lock.json (updated)
  modified:
    - package.json
    - store/useRouteStore.ts

decisions:
  - "tsc errors from Plan 02 stub test files are intentional — biometric-simulator.ts and elevation-simulator.ts are not yet implemented; errors exist only in test stub imports, not in plan-created source files"
  - "gaussianRandom uses Box-Muller transform and is not exported — pure internal utility"
  - "generateActivity stores ActivityPoint[] with 0-valued biometrics as explicit stubs — Plan 02 replaces the body"
---

# Phase 03 Plan 01: Temporal path distancer with @turf/turf — Summary

**One-liner:** Turf-based temporal path interpolator with Gaussian pacing noise producing timestamped InterpolatedPoint[] at configurable intervals, with Zustand store extended for generateActivity stub.

## What Was Built

Installed `@turf/turf` and `vitest`, defined the locked Phase 3→4 type contract (`ActivityPoint`, `InterpolatedPoint`, `InterpolateOptions`), implemented `interpolatePath` using turf's `lineString`/`along`/`length` functions, and extended the Zustand store with `generatedActivity`, `isGenerating`, and `generateActivity` fields.

Three test stub files were scaffolded in RED state — `route-interpolator.test.ts` (5 tests, all GREEN after implementation), `biometric-simulator.test.ts` (4 tests, RED pending Plan 02), `elevation-simulator.test.ts` (3 tests, RED pending Plan 02).

## Task Summary

| Task | Description | Status | Commit |
|------|-------------|--------|--------|
| 1 | Install deps, create vitest.config.ts, scaffold 3 test stubs (RED) | Complete | a848c06 |
| 2 | Define lib/types/activity.ts locked interface contract | Complete | a848c06 |
| 3 | Implement lib/route-interpolator.ts + extend useRouteStore | Complete | a848c06 |

## Verification Results

```
npx vitest run lib/__tests__/route-interpolator.test.ts --reporter=verbose

 ✓ interpolatePath > returns empty array when snappedPath has fewer than 2 points
 ✓ interpolatePath > returns expected point count for a short known route at 10s intervals
 ✓ interpolatePath > timestamps advance by intervalSeconds per point
 ✓ interpolatePath > useNoise=true produces at least one interval different from deterministic pace
 ✓ interpolatePath > output coordinates are in valid WGS84 range

Test Files  1 passed (1)
     Tests  5 passed (5)
```

```
npx tsc --noEmit
# Only errors: biometric-simulator and elevation-simulator not yet implemented (Plan 02 — expected)
# No errors in: lib/types/activity.ts, lib/route-interpolator.ts, store/useRouteStore.ts
```

## Deviations from Plan

None — plan executed exactly as written.

The `npx tsc --noEmit` success criteria was interpreted as "no errors in files created by this plan." The two tsc errors present are in the stub test files importing Plan 02 modules (`biometric-simulator.ts`, `elevation-simulator.ts`) which are intentionally unimplemented. The plan's own verification section explicitly states these files should be "FAILING (module not found — correct, Plan 02 implements it)."

## Known Stubs

| File | Location | Description |
|------|----------|-------------|
| store/useRouteStore.ts | generateActivity, lines 96-104 | heartRate: 0, cadence: 0, elevation: 0 — placeholder biometrics; Plan 02 replaces generateActivity body with full biometric pipeline |

These stubs are intentional and documented in the plan. The generateActivity function architecture (signature, state fields) is complete; only the biometric computation body is deferred to Plan 02.

## Threat Flags

None. This plan adds no new network endpoints, auth paths, or trust boundary crossings. `interpolatePath` is a pure CPU-bound function with no I/O. The `generateActivity` store action reads from local Zustand state only.

## Self-Check

- [x] lib/types/activity.ts exists
- [x] lib/route-interpolator.ts exists
- [x] lib/__tests__/route-interpolator.test.ts exists (5 tests)
- [x] lib/__tests__/biometric-simulator.test.ts exists (4 tests)
- [x] lib/__tests__/elevation-simulator.test.ts exists (3 tests)
- [x] vitest.config.ts exists
- [x] store/useRouteStore.ts has generatedActivity, isGenerating, generateActivity
- [x] Commit a848c06 exists
- [x] 5/5 route-interpolator tests GREEN

## Self-Check: PASSED
