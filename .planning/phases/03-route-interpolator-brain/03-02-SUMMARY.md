---
phase: 03-route-interpolator-brain
plan: 02
subsystem: biometrics
tags: [karvonen, heart-rate, cadence, elevation, open-meteo, zustand, vitest, typescript]

requires:
  - phase: 03-01
    provides: [lib/route-interpolator.ts, lib/types/activity.ts, store/useRouteStore.ts stub generateActivity]

provides:
  - lib/biometric-simulator.ts (computeHR, computeCadence)
  - lib/elevation-simulator.ts (fetchElevations)
  - store/useRouteStore.ts full generateActivity pipeline
  - components/Sidebar.tsx Activity section with Generate Activity button

affects: [phase 04 GPX/TCX export — consumes ActivityPoint[] from generatedActivity]

tech-stack:
  added: []
  patterns:
    - "Karvonen heart-rate-reserve model with exponential warmup (tau=120s) and 5bpm cardiac drift"
    - "Linear cadence model: 4:00/km→180spm to 7:00/km→158spm with clamp and optional Gaussian noise"
    - "Open-Meteo batch elevation fetch at CHUNK_SIZE=100 with response.ok check before .json()"
    - "Inner try/catch for elevation fallback — elevation errors do not propagate to outer generateActivity catch"
    - "generateActivity reads all config from useRouteStore.getState() snapshot"

key-files:
  created:
    - lib/biometric-simulator.ts
    - lib/elevation-simulator.ts
  modified:
    - store/useRouteStore.ts
    - components/Sidebar.tsx

key-decisions:
  - "paceToKarvonenFraction boundary fixed: paceSecPerKm<=330 for Z3 (not <330) so exactly 5:30/km maps to 0.75 HRR fraction as the test expects"
  - "Elevation API errors fall back to 0m array (inner catch) — Strava accepts 0-elevation tracks; pipeline never fails due to elevation API outage"
  - "Box-Muller gaussianRandom duplicated intentionally from route-interpolator.ts — avoids circular lib imports"
  - "generateActivity pipeline order: interpolatePath → fetchElevations (with fallback) → computeHR + computeCadence per point → set generatedActivity"

patterns-established:
  - "Biometric noise is opt-in via addNoise boolean, disabled by default for deterministic testing"
  - "Activity section in Sidebar always rendered; button disabled state guards against pre-snap state"

requirements-completed: [BIO-01, BIO-02, BIO-03]

duration: 3min
completed: 2026-04-17
---

# Phase 03 Plan 02: Biometric and Elevation Simulator Summary

**Karvonen HR warmup curve + linear cadence model + Open-Meteo batch elevation fetch wired into full generateActivity pipeline, with Sidebar Generate Activity button — 15/15 tests GREEN**

## Performance

- **Duration:** 3 min
- **Started:** 2026-04-17T08:47:28Z
- **Completed:** 2026-04-17T08:50:48Z
- **Tasks:** 3
- **Files modified:** 4

## Accomplishments

- `lib/biometric-simulator.ts`: Karvonen HRR model with exponential warmup (tau=120s), 5bpm cardiac drift, and linear 4:00-7:00/km cadence mapping with optional Gaussian noise
- `lib/elevation-simulator.ts`: Open-Meteo batch elevation client with CHUNK_SIZE=100, response.ok guard, and typed JSON cast
- `store/useRouteStore.ts`: Full generateActivity pipeline replacing stub — interpolatePath → fetchElevations (0m fallback) → computeHR/computeCadence → ActivityPoint[]
- `components/Sidebar.tsx`: Activity section with Strava Orange (#FC4C02) Generate Activity button, disabled guard, loading state, and point count status

## Task Commits

Each task was committed atomically:

1. **Task 1: lib/biometric-simulator.ts** - `201dbd3` (feat)
2. **Task 2: lib/elevation-simulator.ts + generateActivity pipeline** - `7ff0122` (feat)
3. **Task 3: Sidebar Activity section** - `44d1de2` (feat)

## Files Created/Modified

- `/home/thangdm1/Documents/Projects/stravafakerun/lib/biometric-simulator.ts` - computeHR (Karvonen + warmup + drift) and computeCadence (linear pace-to-SPM)
- `/home/thangdm1/Documents/Projects/stravafakerun/lib/elevation-simulator.ts` - fetchElevations with CHUNK_SIZE=100 batch loop and error handling
- `/home/thangdm1/Documents/Projects/stravafakerun/store/useRouteStore.ts` - Added biometric/elevation imports; replaced stub generateActivity body with full pipeline
- `/home/thangdm1/Documents/Projects/stravafakerun/components/Sidebar.tsx` - Extended store destructuring; added Activity section with Generate Activity button and point count

## Decisions Made

- **Karvonen zone boundary fix:** `paceSecPerKm <= 330` (not `< 330`) so exactly 5:30/km (330 s/km) falls into Z3 (0.75 HRR fraction). The original `< 330` mapped 330 to Z2 (0.65), producing steadyHR=143 at t=totalSeconds which failed the test's `>= 150` assertion.
- **Elevation fallback isolation:** The elevation fetch is wrapped in its own inner try/catch. API failures silently fall back to a zero-array, preserving the full activity generation pipeline. This matches the plan requirement: "Strava accepts 0-elevation tracks."
- **gaussianRandom duplication:** Box-Muller implementation duplicated from route-interpolator.ts (not imported) to avoid circular lib dependencies. This is explicit per the plan's scope rules.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed paceToKarvonenFraction boundary condition at 5:30/km**
- **Found during:** Task 1 (biometric-simulator.ts implementation)
- **Issue:** Plan spec used `paceSecPerKm < 330` for Z3 but test passes `paceSecPerKm=330` (5:30/km) and expects Z3 fraction (0.75), yielding ~160bpm. With `< 330`, exactly 330 falls to Z2 (0.65), producing 148bpm — below the test's `>= 150` lower bound.
- **Fix:** Changed condition to `paceSecPerKm <= 330` so the 5:30/km boundary is inclusive of Z3.
- **Files modified:** lib/biometric-simulator.ts
- **Verification:** `npx vitest run lib/__tests__/biometric-simulator.test.ts` — 7/7 tests GREEN after fix
- **Committed in:** `201dbd3` (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 — logic boundary bug)
**Impact on plan:** Single boundary fix necessary for test correctness. No scope creep.

## Issues Encountered

None beyond the boundary fix documented above.

## User Setup Required

None — no external service configuration required. Open-Meteo elevation API is free and requires no authentication.

## Next Phase Readiness

- `generatedActivity: ActivityPoint[]` in Zustand store is fully populated with all 7 fields (lat, lon, timestamp, heartRate, cadence, elevation, distFromStartKm)
- Phase 4 GPX/TCX export can read `generatedActivity` directly from the store
- All 15 unit tests across 3 test files GREEN; `npx tsc --noEmit` zero errors

## Known Stubs

None — all biometric placeholders from Plan 01 have been replaced with real computation.

## Threat Flags

| Flag | File | Description |
|------|------|-------------|
| threat_flag: external-network | lib/elevation-simulator.ts | New outbound HTTP GET to api.open-meteo.com — free public API, no auth, read-only, no user data transmitted (only coordinate arrays). Risk: availability dependency. Mitigated by 0m fallback in generateActivity. |

## Self-Check

- [x] lib/biometric-simulator.ts exists (verified: `ls lib/biometric-simulator.ts`)
- [x] lib/elevation-simulator.ts exists (verified: `ls lib/elevation-simulator.ts`)
- [x] store/useRouteStore.ts modified with full pipeline
- [x] components/Sidebar.tsx has Activity section
- [x] .planning/phases/03-route-interpolator-brain/03-02-SUMMARY.md exists
- [x] Commit 201dbd3 exists (Task 1: biometric-simulator)
- [x] Commit 7ff0122 exists (Task 2: elevation-simulator + pipeline)
- [x] Commit 44d1de2 exists (Task 3: Sidebar)
- [x] 15/15 tests GREEN (7 biometric + 3 elevation + 5 route-interpolator)
- [x] npx tsc --noEmit: zero errors

## Self-Check: PASSED
