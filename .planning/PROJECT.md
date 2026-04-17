# StravaFakeRun

## What This Is

StravaFakeRun is a web application that allows users to generate realistic, synthetic workout log files (GPX, TCX). Athletes have granular control over metrics—distance, pace, elevation and biometric data (heart rate, cadence)—allowing them to log activities they might have lost data for, or for testing fitness applications.

## Core Value

Empower users to easily and realistically generate synthetic workout data that seamlessly uploads to Strava without looking fake.

- ✓ **v1.1 Realism & Activity Types** — Phases 5-8 (shipped 2026-04-17)

## Current Milestone: v1.2 Map Utilities & Sharing

**Goal:** Enhance map navigation and usability with search, geolocation, and route sharing.

**Target features:**
- Address search on the map via Nominatim geocoder
- "Locate Me" button to fly to current GPS position
- URL State Sharing — share routes via base64 encoded URL parameters
- Strava OAuth — direct upload support (TBD)

## Requirements

### Validated

- ✓ Interactive map interface to draw routes (Leaflet) — v1.0
- ✓ Snap-to-road functionality (OSRM) — v1.0
- ✓ Set exact start date and time of the activity — v1.0
- ✓ Define average pace with dynamic variability — v1.0
- ✓ Real elevation profile fetching (Open-Meteo) — v1.0
- ✓ Simulate heart rate curve (Karvonen) — v1.0
- ✓ Simulate running cadence corresponding to pace — v1.0
- ✓ Export generated activity as `.gpx` — v1.0
- ✓ Export generated activity as `.tcx` — v1.0
- ✓ Activity type selection (Run/Walk/Cycle/Hike) — v1.1
- ✓ Timezone/UTC offset support — v1.1
- ✓ Pace/Speed unit toggle — v1.1
- ✓ Gradient-responsive cadence & HR — v1.1
- ✓ GPS noise & biometric ramps — v1.1
- ✓ Live Pace & HR charts — v1.1

### Active

- [ ] Address search bar (Nominatim integration)
- [ ] Geolocation "Fly to Me" button
- [ ] URL-based route persistence (Shareable links)
- [ ] Direct Strava Upload (v1.2 goal)

### Out of Scope

- Direct Strava OAuth upload — deferred to v1.2
- Swimming — very different data model (pool lengths, strokes), future milestone
- Activity history / saved runs — future milestone

## Context

- **Environment**: Next.js / React with Tailwind CSS, Zustand state, xmlbuilder2 exports.
- **Codebase state (v1.0)**: ~1,200 LOC TypeScript/TSX. Core libs: `lib/route-interpolator.ts`, `lib/biometric-simulator.ts`, `lib/elevation-simulator.ts`, `lib/export/gpx.ts`, `lib/export/tcx.ts`.
- **Data contract**: `ActivityPoint` in `lib/types/activity.ts` — lat, lon, elevation, timestamp, heartRate, cadence, distFromStartKm.
- **Domain**: Fitness tracking data structures (GPX/TCX schemas) and geospatial analysis.

## Constraints

- **Tech Stack**: Next.js/React — standardizing on modern React architecture.
- **Aesthetic**: Clean, premium, sporty UI aesthetic with Tailwind CSS.
- **Client-side only**: No backend/DB — privacy and free hosting.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Next.js & React | Best ecosystem for rapid modern web app creation. | ✓ Good |
| Local file generation | Faster MVP than integrating full Strava OAuth for direct upload. | ✓ Good |
| xmlbuilder2 for XML | Structural safety over manual string concatenation. | ✓ Good |
| OSRM snap-to-road | Free, fast, no API key needed. | ✓ Good |
| Open-Meteo elevation | Free, accurate, batch-capable. | ✓ Good |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-17 after v1.0 milestone — starting v1.1*
