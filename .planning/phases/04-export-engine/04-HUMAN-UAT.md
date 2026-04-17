---
status: complete
phase: 04-export-engine
source: [04-VALIDATION.md]
started: 2026-04-17
updated: 2026-04-17
---

## Current Test

number: 3
name: Verify Strava Upload
expected: Upload both the generated `.gpx` and `.tcx` files locally to `https://www.strava.com/upload/select` (if logged in, or just verify format via a generic GPX/TCX viewer). They should be parsed validly containing route tracking and heart-rate / cadence graphs on the run page.
awaiting: 

## Tests

### 1. Verify GPX Download
expected: Click "Download GPX". A file named "fake-run.gpx" should automatically download. Open it in a text editor to verify that `<trkpt>` tags exist with `lat`, `lon`, `<ele>`, and `<time>`, as well as Garmin `TrackPointExtension` tags for `hr` and `cad` at the bottom of the `<extensions>` nodes.
result: [pass]

### 2. Verify TCX Download
expected: Click "Download TCX". A file named "fake-run.tcx" should automatically download. Open it to verify `<TrainingCenterDatabase>` root, `<Lap>` nodes encasing the points, and each `<Trackpoint>` having time, position, distance, heart rate, and cadence values present and correctly formatted.
result: [pass]

### 3. Verify Strava Upload
expected: Upload both the generated `.gpx` and `.tcx` files locally to `https://www.strava.com/upload/select` (if logged in, or just verify format via a generic GPX/TCX viewer). They should be parsed validly containing route tracking and heart-rate / cadence graphs on the run page.
result: [pass]

## Summary

total: 3
passed: 3
issues: 0
pending: 0
skipped: 0
blocked: 0

## Gaps

