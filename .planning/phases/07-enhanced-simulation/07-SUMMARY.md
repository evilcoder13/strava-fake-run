# Phase 7 Summary: Enhanced Simulation

## Accomplishments
*   **Gradient-Aware Biometrics (SIM-01, SIM-02):**
    *   Updated `computeHR` to calculate instantaneous heart rate bonuses on climbs (1.5 bpm per 1% grade).
    *   Updated `computeCadence` (profile-based) to reduce cadence on uphills and increase on downhills (-2 spm per 1% uphill grade).
    *   Integrated gradient calculation in `useRouteStore.ts` using elevation and distance differentials between sampled points.
*   **GPS Noise Layer (SIM-03):**
    *   Implemented Gaussian coordinate perturbation in `generateActivity`.
    *   When "Enable Pacing Noise" is checked, each trackpoint now receives small random offsets (~1 meter stdDev). This successfully breaks the "perfect line" visual artifact on Strava maps.
*   **Warm-up / Cool-down Ramps (SIM-04):**
    *   Augmented existing exponential warm-up with a linear cool-down ramp in the final 5% of the activity duration.
    *   Heart rate now gradually returns to its resting state as the activity reaches its conclusion.

## Design Decisions
*   **Gradient Scale:** We chose a factor of 150 for HR (15bpm at 10% grade) and 200 for Cadence (20spm at 10% grade). These values were selected to be visually distinct in analysis graphs without appearing purely chaotic.
*   **GPS Jitter Magnitude:** 0.00001 decimal degrees was used as the noise scale. This provides a "hand-drawn" look to the GPS traces without the zig-zags being so large they trigger "GPS error" suspicions.
*   **Pace Modulation:** We deferred modulating the actual ground speed (pace) to avoid mismatching the user's explicit input settings. The realism focus was kept on biometrics which are secondary to the primary workout goal.

## Verification Results
*   **Unit Tests:** New tests in `biometric-simulator.test.ts` verify that HR rises on gradients and drops during the cool-down phase.
*   **Type Safety:** `npx tsc` passes with no emitted errors after signature updates.
