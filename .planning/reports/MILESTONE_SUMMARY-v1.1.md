# Milestone Summary: v1.1 Realism & Activity Types

**Shipped**: 2026-04-17
**Status**: COMPLETE ✅

## 1. Overview
Milestone v1.1 significantly expanded the "realism" capabilities of StravaFakeRun. While v1.0 established the ability to plot a route and export basic biometric data, v1.1 transformed the data from "straight-line static" to "biological and noisy," mimicking the behavior of actual human exercise and GPS hardware.

## 2. Architecture
The underlying data structures were evolved to support more complex simulation:
*   **Sport Profiles**: Centralized in `lib/sport-profiles.ts`, these profiles define physiological constraints (HR zones, cadence) for Running, Walking, Cycling, and Hiking.
*   **Gradient Integration**: The generation pipeline now includes a calculation pass that derives the slope (gradient) between points using elevation differentials. This gradient is injected into both biometric and pace models.
*   **ActivityPoint Extensions**: Added `paceMinKm` to the core data contract to support instantaneous visualization.
*   **Client-Side Charting**: Integrated `recharts` with dynamic Next.js imports to provide zero-latency visual feedback without server-side overhead.

## 3. Phases
*   **Phase 5 (Activity Types)**: Implemented sport selector and biometric tuning.
*   **Phase 6 (Configuration UX)**: Added timezone management and Pace/Speed unit toggling.
*   **Phase 7 (Enhanced Simulation)**: Introduced gradient-responsive biometrics and Gaussian GPS jitter.
*   **Phase 8 (Data Preview)**: Built interactive HR and Pace charts in the sidebar.

## 4. Key Decisions
| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Numerical Timezones | ISO 8601 compatibility without needing heavy `TZ` lookup databases. | Simple, robust UTC offset support. |
| Area Charts for HR | Visual consistency with the Strava "gradient" style for heart rate. | High-fidelity UI that feels like an official tool. |
| 0.00001 Jitter | Adds ~1.1m standard deviation to coordinates. | Breaks the "robotic line" without triggering GPS error detection. |
| Downsampling (100 pts) | Charts move slowly with 10k points. | Fluid interaction for routes of any length. |

## 5. Requirements (Traceability)
*   **ACT-01, 02, 03** (Activity Types): **Complete** — Correct sport encoding in GPX/TCX.
*   **CFG-05, 06, 07** (Config UX): **Complete** — UTC offsets and Pace/Speed live conversion.
*   **SIM-01, 02, 03, 04** (Realism): **Complete** — Gradient response, GPS noise, and cool-down ramps.
*   **VIZ-01, 02** (Previews): **Complete** — Responsive charts with detailed tooltips.

## 6. Known Gaps & Tech Debt
*   **Pace Ramp**: SIM-04 was implemented for HR but pace remains constant across the route (only gradient-adjusted). Full pace ramping (slow start/finish) is deferred to future UX polish.
*   **Non-hourly Timezones**: Manually appended to the list (+05:30); a more robust timezone generator would be cleaner long-term.

## 7. Getting Started for Developers
To extend the simulation logic:
1.  **New Sports**: Add a entry to `SPORT_PROFILES` in `lib/sport-profiles.ts`.
2.  **Simulation Tuning**: Adjust factors in `computeHR` and `computeCadence` inside `lib/biometric-simulator.ts`.
3.  **Visualization**: Update `ActivityCharts.tsx` if adding new metrics like Wattage or Temperature.
