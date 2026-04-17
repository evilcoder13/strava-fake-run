# Research: Phase 07 — Enhanced Simulation

## Goal
Implement SIM-01 through SIM-04 to make the generated activity feel more "human" and realistic in Strava.

## Technical Analysis

### SIM-01 & SIM-02: Gradient-Aware Cadence & HR
*   **Gradient Calculation**: For each point $i$, gradient $G_i$ is $(\Delta elevation) / (\Delta distance)$.
    *   $\Delta elevation = elevation_i - elevation_{i-1}$
    *   $\Delta distance = distance_i - distance_{i-1}$
*   **Cadence Modifier**:
    *   $cadence = base\_cadence \times (1 - modifier)$ where modifier is positive for uphill (drops cadence) and negative for downhill (rises cadence).
    *   Scale: a 10% gradient could drop cadence by 15-20%.
*   **HR Modifier**:
    *   $HR = base\_HR + (gradient \times factor)$.
    *   Factor: HR should spike on steep climbs.

### SIM-03: GPS Jitter (Position Noise)
*   **Implementation**: Add a small random offset (e.g., Gaussian noise with 1-3 meter standard deviation) to every `lat` and `lon`.
*   **Effect**: Prevents "perfectly straight" lines which look robotic on Strava's map.

### SIM-04: Warm-up / Cool-down Ramps
*   **Logic**:
    *   First 5% of `elapsedSeconds / totalSeconds` -> linearly scale HR from `restingHR` to `targetHR`.
    *   First 5% of distance -> linearly scale pace from slow to target? Or just use time.
    *   Last 5% -> linearly scale back down.
*   **Reference**: `SPORT_PROFILES` already has `restingHR`.

## Proposed Changes

### 1. `lib/biometric-simulator.ts`
*   Modify `computeHR` and `computeCadence` to accept `gradient: number` and `progress: number` (0.0 to 1.0).
*   Implement the ramp and gradient logic inside these functions.

### 2. `store/useRouteStore.ts`
*   Calculate `gradient` in the `activity.map` loop.
*   Calculate `progress` (`elapsedSeconds / totalSeconds`).
*   Apply GPS jitter logic directly in the map loop.

## Design Decisions
*   **GPS Noise Scale**: 2.0e-5 decimal degrees is roughly 2 meters. We should use a controllable scale.
*   **Gradient Smoothing**: Instantaneous gradient between 10s points can be noisy due to elevation API resolution. We might need a moving average or just trust the 10s sampling.

## Verification Plan
*   **Unit Tests**: Update `biometric-simulator.test.ts` to verify HR increases with gradient and decreases at start/end (ramps).
*   **Visual Check**: Export a GPX and look at the HR/Cadence graph in a tool like GPXSee or upload to Strava (private).
