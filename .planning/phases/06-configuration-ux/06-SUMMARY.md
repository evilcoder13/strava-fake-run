# Phase 6 Summary: Configuration UX

## Accomplishments
*   **Timezone Management (Plan 06-01):**
    *   Designed and implemented a timezone selector feature for ensuring correct export mapping in Strava.
    *   Added standard timezone offset parsing into `route-interpolator.ts`, respecting user's target local time during the ISO string creation and Date resolution.
    *   Updated `useRouteStore.ts` with `getLocalTimezoneOffsetString()` to default the settings correctly.
    *   Implemented a dropdown in the Sidebar pre-filled from -12:00 to +14:00 alongside common non-hourly timezones (+05:30, +09:30).
*   **Pace/Speed Toggle (Plan 06-02):**
    *   Added `useSpeedUnit: boolean` to `RouteState` with a robust fallback to Pace.
    *   Implemented a dynamic conditional render in the Sidebar: users can toggle between min/km (Pace) and km/h (Speed) inputs.
    *   The source of truth strictly remains `paceMinutes` and `paceSeconds`, keeping the interpolation core perfectly oblivious. The UI smoothly converts floating point speed inputs real-time.

## Design Decisions
*   **Timezone Options structure:** Rather than importing a complex library like `date-fns-tz` to support region strings (e.g., `Europe/Paris`), we strictly use numerical timezone offsets (e.g., `+02:00`, `-12:00`). This matches perfectly with ISO strings and is directly digestible by `new Date()`. A programmatic generator outputs the typical hourly offsets, while appending common non-hourly ones like India Standard Time (+05:30).
*   **UI Input Switch:** We used a single integrated UI block for "Target Effort" containing an embedded toggle pill. This achieves high design fidelity while taking minimal vertical space.

## Next Phase Prep
Phase 7 will focus on URL State sharing. Since all critical routing rules (`waypoints`) and config rules (`pace`, `time`, `activityType`, `timezoneOffset`) are now in the `useRouteStore`, they are all ready to be globally compressed into a base64 string during Phase 7 execution.
