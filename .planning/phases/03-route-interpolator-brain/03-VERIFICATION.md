---
phase: 03-route-interpolator-brain
verified: 2026-04-17T09:04:45Z
status: human_needed
score: 4/4
requirements: [CFG-04, BIO-01, BIO-02, BIO-03]
overrides_applied: 0
human_verification:
  - test: "Generate Activity end-to-end smoke test"
    expected: "Add 2+ waypoints, wait for road snap, click Generate Activity. Button shows 'Generating...' then reverts. A point count like 'N points generated' appears. Browser devtools confirm generatedActivity[0] has lat/lon in valid WGS84 ranges, heartRate in [65, 190], cadence in [155, 185], elevation as float, timestamp in ISO format."
    why_human: "Full pipeline requires a live browser environment with OSRM road-snap network call and Open-Meteo elevation API call. Cannot simulate end-to-end network I/O in automated checks."
---

# Phase 3: Route Interpolator Brain — Verification Report

**Phase Goal:** Convert routing lines into a time-and-biometric-stamped sequence.
**Verified:** 2026-04-17T09:04:45Z
**Status:** human_needed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | The app accurately spaces internal points based on pacing settings | VERIFIED | `interpolatePath` in `lib/route-interpolator.ts` walks the turf lineString at fixed `intervalSeconds` (default 10s). Test "returns expected point count for a short known route" and "timestamps advance by intervalSeconds per point" both pass. 15/15 tests GREEN. |
| 2 | The pacing receives human-like standard deviation "noise" | VERIFIED | `useNoise=true` path applies Box-Muller Gaussian noise clamped at 70% of target pace. Test "useNoise=true produces at least one interval different from deterministic pace" passes. |
| 3 | Form fields translate into a complete array of GeoJSON point representations bearing HR, Cadence, and Elevation | VERIFIED | `generateActivity` in `store/useRouteStore.ts` calls `interpolatePath` → `fetchElevations` → `computeHR`/`computeCadence` per point, producing `ActivityPoint[]` with all 7 fields (lat, lon, timestamp, heartRate, cadence, elevation, distFromStartKm). No zero-placeholder biometrics remain in the store. |

**Score:** 3/3 roadmap truths verified (automated)

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| CFG-04 | 03-01 | Application calculates segmented distances and interpolates timestamps based on target pace | SATISFIED | `lib/route-interpolator.ts` exports `interpolatePath`. Flips [lat,lon] → [lon,lat] for turf, walks line at 10s intervals, produces `InterpolatedPoint[]` with timestamps, distFromStartKm, elapsedSeconds. 5/5 tests pass. |
| BIO-01 | 03-02 | Application can generate a baseline simulated heart rate curve | SATISFIED | `lib/biometric-simulator.ts` exports `computeHR`. Karvonen HRR model with exponential warmup (tau=120s) and 5bpm cardiac drift. At t=0 returns restHR (65); at t=totalSeconds returns ~160bpm for 5:30/km pace. 3/3 computeHR tests pass. |
| BIO-02 | 03-02 | Application can generate running cadence corresponding to the chosen pace | SATISFIED | `lib/biometric-simulator.ts` exports `computeCadence`. Linear model: 4:00/km → 180spm, 7:00/km → 158spm with clamp and optional Gaussian noise. 4/4 computeCadence tests pass. |
| BIO-03 | 03-02 | Application fetches real-world elevation profiles for the route points | SATISFIED | `lib/elevation-simulator.ts` exports `fetchElevations`. Batches at CHUNK_SIZE=100, checks `response.ok` before `.json()`, throws descriptive error on failure. `generateActivity` wraps elevation in inner try/catch with 0m fallback. 3/3 elevation tests pass. |

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `lib/types/activity.ts` | Phase 3→4 boundary contract (ActivityPoint, InterpolatedPoint, InterpolateOptions) | VERIFIED | Exists. All 7 ActivityPoint fields, all 5 InterpolatedPoint fields, all 6 InterpolateOptions fields present. Named exports only. |
| `lib/route-interpolator.ts` | interpolatePath implementation with coordinate flip + Gaussian noise | VERIFIED | Exists, 63 lines, substantive. Exports `interpolatePath`. Box-Muller noise, turf lineString/along/length, coordinate flip [lat,lon]→[lon,lat]. 5 tests pass. |
| `lib/biometric-simulator.ts` | computeHR (Karvonen) and computeCadence | VERIFIED | Exists, 64 lines, substantive. Exports `computeHR` and `computeCadence`. Private `gaussianRandom` (Box-Muller). Karvonen zone fix: `paceSecPerKm <= 330` (inclusive). 7 tests pass. |
| `lib/elevation-simulator.ts` | fetchElevations with 100-coord batching | VERIFIED | Exists, 36 lines, substantive. `CHUNK_SIZE=100`, template literal URL, `response.ok` guard, typed JSON cast. 3 tests pass. |
| `lib/__tests__/route-interpolator.test.ts` | 5 CFG-04 test cases | VERIFIED | Exists, 5 tests, all GREEN. |
| `lib/__tests__/biometric-simulator.test.ts` | 7 BIO-01/BIO-02 test cases | VERIFIED | Exists, 7 tests (3 computeHR + 4 computeCadence), all GREEN. |
| `lib/__tests__/elevation-simulator.test.ts` | 3 BIO-03 test cases | VERIFIED | Exists, 3 tests, all GREEN. |
| `vitest.config.ts` | Test runner config with node environment and @/ alias | VERIFIED | Exists at project root. Used by test run. |
| `store/useRouteStore.ts` | Extended with full generateActivity pipeline | VERIFIED | Imports `interpolatePath`, `computeHR`, `computeCadence`, `fetchElevations`. RouteState has `generatedActivity`, `isGenerating`, `generateActivity`. No zero-placeholder biometrics — full pipeline in place. |
| `components/Sidebar.tsx` | Activity section with Generate Activity button | VERIFIED | Activity section at lines 158-172. Destructures `snappedPath, generatedActivity, isGenerating, generateActivity` from store. Button disabled when `snappedPath.length < 2 || isGenerating`. Loading text "Generating...". Point count displayed when `generatedActivity !== null`. |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `Sidebar.tsx` | `generateActivity` (store) | `onClick={generateActivity}` | WIRED | Line 161: `onClick={generateActivity}`. Line 77 destructures it from `useRouteStore()`. |
| `store/useRouteStore.ts` | `interpolatePath` | import + call in generateActivity | WIRED | Import line 3; called at line 87 inside `generateActivity`. |
| `store/useRouteStore.ts` | `fetchElevations` | import + call in generateActivity | WIRED | Import line 5; called at line 106 with elevation fallback inner catch. |
| `store/useRouteStore.ts` | `computeHR` | import + call per point | WIRED | Import line 4; called at line 121 inside `points.map()`. |
| `store/useRouteStore.ts` | `computeCadence` | import + call per point | WIRED | Import line 4; called at line 127 inside `points.map()`. |
| `lib/route-interpolator.ts` | `lib/types/activity.ts` | `import type { InterpolateOptions, InterpolatedPoint }` | WIRED | Line 2: `import type { InterpolateOptions, InterpolatedPoint } from '@/lib/types/activity'`. |
| `store/useRouteStore.ts` | `lib/types/activity.ts` | `import type { ActivityPoint }` | WIRED | Line 2: `import type { ActivityPoint } from '@/lib/types/activity'`. |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|--------------------|--------|
| `Sidebar.tsx` | `generatedActivity` | `useRouteStore().generatedActivity` | Yes — set by `generateActivity` action which merges interpolated points with real biometrics | FLOWING |
| `Sidebar.tsx` | `isGenerating` | `useRouteStore().isGenerating` | Yes — toggled true/false by `generateActivity` action | FLOWING |
| `store/useRouteStore.ts generateActivity` | `points` | `interpolatePath(state.snappedPath, ...)` | Yes — turf-derived from real snapped path coordinates | FLOWING |
| `store/useRouteStore.ts generateActivity` | `elevations` | `fetchElevations(points)` with 0m fallback | Yes — real Open-Meteo API call with fallback | FLOWING |
| `store/useRouteStore.ts generateActivity` | `heartRate` per point | `computeHR(p.elapsedSeconds, totalSeconds, paceSecPerKm)` | Yes — Karvonen formula | FLOWING |
| `store/useRouteStore.ts generateActivity` | `cadence` per point | `computeCadence(paceSecPerKm)` | Yes — linear pace model | FLOWING |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| All 15 unit tests pass | `npx vitest run --reporter=verbose` | 15/15 passed (3 files) | PASS |
| TypeScript compiles cleanly | `npx tsc --noEmit` | No output (zero errors) | PASS |
| No zero-placeholder biometrics in store | `grep "heartRate: 0\|cadence: 0\|elevation: 0" store/useRouteStore.ts` | No matches | PASS |
| Generate Activity button present in Sidebar | `grep "Generate Activity" components/Sidebar.tsx` | Found at line 165 | PASS |
| Sidebar wires all 4 store fields | `grep "generateActivity\|isGenerating\|generatedActivity\|snappedPath" components/Sidebar.tsx` | All 4 present on line 77 | PASS |

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| None | - | - | - | No anti-patterns detected in implementation files |

Zero TODOs, FIXMEs, placeholders, or empty implementations found in: `lib/route-interpolator.ts`, `lib/biometric-simulator.ts`, `lib/elevation-simulator.ts`, `store/useRouteStore.ts`, `components/Sidebar.tsx`.

### Human Verification Required

#### 1. Generate Activity End-to-End Smoke Test

**Test:** Run `npm run dev`. Open `http://localhost:3000`. Click the map twice to add 2 waypoints. Wait for the blue snapped polyline to appear (OSRM road-snap). Click "Generate Activity" in the sidebar.

**Expected:**
- Button label changes to "Generating..." while processing
- Button reverts to "Generate Activity" after completion
- Text like "N points generated" appears below the button (expect 50-500 points for a typical urban route)
- In browser devtools console, access the Zustand store (React DevTools or `window`) and inspect `generatedActivity[0]`:
  - `lat` in range (-90, 90)
  - `lon` in range (-180, 180)
  - `heartRate` near 65 (warmup start) — an integer
  - `cadence` in range [158, 180] — an integer
  - `elevation` as a positive float (real elevation data from Open-Meteo)
  - `timestamp` as a valid ISO 8601 string
  - `distFromStartKm` as 0.0 for the first point

**Why human:** The full pipeline requires live browser execution with two external network calls (OSRM road-snap, Open-Meteo elevation API) and React state rendering. Cannot simulate this in automated grep/compile checks.

### Gaps Summary

No gaps found. All 4 requirements (CFG-04, BIO-01, BIO-02, BIO-03) are satisfied by substantive, wired implementations. All 15 unit tests pass. TypeScript compiles with zero errors. The one outstanding item is a manual browser smoke test to verify end-to-end pipeline execution with live network calls.

---

_Verified: 2026-04-17T09:04:45Z_
_Verifier: Claude (gsd-verifier)_
