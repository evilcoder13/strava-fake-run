# Roadmap: StravaFakeRun

## Overview

StravaFakeRun will be built in four main phases. First, we'll bootstrap the Next.js shell and the interactive React Leaflet map. Second, we'll wire up the configuration controls (Pace, Dates) alongside snapping the map endpoints to actual road geometry. Third, we'll build the brain—the temporal route interpolator with noise variance and biometric simulators. Finally, we'll cap it off with the file export module supporting standards-compliant GPX and TCX generation.

## Phases

- [ ] **Phase 1: Project Setup & Core Map** - Bootstrap Next.js, Tailwind, and React Leaflet for interactive waypoint plotting.
- [x] **Phase 2: UI Controls & Road Snapping** - Add settings panel for dates/pace and snap map routes to real roads. (completed 2026-04-16)
- [x] **Phase 3: Route Interpolator Brain** - Segment path geometry by pace and simulate cadence and heart rate. (completed 2026-04-17)
- [x] **Phase 4: Export Engine** - Translate the generated data layer objects into downloadable GPX and TCX files. (completed 2026-04-17)

## Phase Details

### Phase 1: Project Setup & Core Map
**Goal**: Get Next.js up and running with a usable map.
**Depends on**: Nothing
**Requirements**: MAP-01, MAP-02, MAP-03
**Success Criteria** (what must be TRUE):
  1. User can load the web app and see a clean map screen.
  2. User can click the map to add pins and see lines connecting them.
  3. User can drag or delete pins.
**Plans**: 3 plans

Plans:
- [x] 01-01: Bootstrap Next.js with Tailwind CSS
- [x] 01-02: Implement Leaflet map wrapper
- [x] 01-03: Create waypoint plotting and polyline rendering logic

### Phase 2: UI Controls & Road Snapping
**Goal**: User can set run parameters and the drawn bird-flight lines snap to roads.
**Depends on**: Phase 1
**Requirements**: MAP-04, CFG-01, CFG-02, CFG-03
**Success Criteria** (what must be TRUE):
  1. Drawn points snap to actual roads instead of straight lines over buildings.
  2. User sees form fields for Target Pace, Date/Time, and dynamic pacing noise toggle.
**Plans**: 2 plans

Plans:
- [x] 02-01: Integrate snap-to-road API (e.g. OSRM point-to-point)
- [x] 02-02: Build Configuration sidebar UI (Date, Time, Pace form elements)

### Phase 3: Route Interpolator Brain
**Goal**: Convert routing lines into a time-and-biometric-stamped sequence.
**Depends on**: Phase 2
**Requirements**: CFG-04, BIO-01, BIO-02, BIO-03
**Success Criteria** (what must be TRUE):
  1. The app accurately spaces internal points based on pacing settings.
  2. The pacing receives human-like standard deviation "noise".
  3. Form fields translate into a complete array of GeoJSON point representations bearing HR, Cadence, and Elevation.
**Plans**: 2 plans

Plans:
- [x] 03-01-PLAN.md — Install @turf/turf + vitest, define ActivityPoint contract, implement lib/route-interpolator.ts, extend Zustand store with generateActivity stub
- [x] 03-02-PLAN.md — Implement lib/biometric-simulator.ts and lib/elevation-simulator.ts, wire full generateActivity pipeline, add Generate Activity button to Sidebar

### Phase 4: Export Engine
**Goal**: Take the output from the Brain and generate valid Strava downloads.
**Depends on**: Phase 3
**Requirements**: OUT-01, OUT-02
**Success Criteria** (what must be TRUE):
  1. User can click "Download GPX" and receive the file.
  2. User can click "Download TCX" and receive the file with HRM/Cadence.
**Plans**: 2 plans

Plans:
- [x] 04-01: Integrate xmlbuilder2 and generate Garmin-schema GPX strings
- [x] 04-02: Generate Garmin-schema TCX strings with trackpoint extensions

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Project Setup & Core Map | 0/3 | Not started | - |
| 2. UI Controls & Road Snapping | 2/2 | Complete    | 2026-04-16 |
| 3. Route Interpolator Brain | 2/2 | Complete   | 2026-04-17 |
| 4. Export Engine | 2/2 | Complete   | 2026-04-17 |
