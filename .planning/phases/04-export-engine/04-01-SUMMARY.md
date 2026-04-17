# Plan 04-01 Summary
**Objective**: Use `xmlbuilder2` to build a valid Garmin-compatible GPX 1.1 file out of the `ActivityPoint` objects in the Zustand store, then add a download action to the Sidebar.

## Key Changes
- Installed `xmlbuilder2` package.
- Created `lib/export/gpx.ts` housing the `exportGPX()` function, which parses `ActivityPoint[]` arrays and uses `xmlbuilder2` to generate Garmin-compatible GPX (with `.gpx` extension) that includes Heart Rate and Cadence via `TrackPointExtension`.
- Updated `Sidebar.tsx` to include `exportGPX` and added a "Download GPX" button.

## Self-Check
- [x] All tasks executed
- [x] Each task committed individually
- [x] SUMMARY.md created in plan directory
- [x] No modifications to shared orchestrator artifacts
