# StravaFakeRun

## What This Is

StravaFakeRun is a web application clone of `fakemy.run` that allows users to seamlessly generate realistic, synthetic workout log files (such as GPX, TCX, or FIT formats). It allows athletes to manually craft activities with granular control over metrics—such as distance, pace, elevation, and biometric data (heart rate, cadence)—allowing them to log activities they might have lost data for, or for testing fitness applications.

## Core Value

Empower users to easily and realistically generate synthetic workout data that seamlessly uploads to Strava without looking fake.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Interactive map interface to draw, upload, or modify routes (using Leaflet/Mapbox).
- [ ] Snap-to-road functionality for drawing realistic routes.
- [ ] Set exact start date and time of the activity.
- [ ] Define average pace with dynamic variability to enhance realism.
- [ ] Real elevation profile fetching or continuous elevation gain simulation.
- [ ] Simulate heart rate curve that scales with pace and elevation.
- [ ] Simulate running cadence corresponding to the chosen pace.
- [ ] Export generated activity as `.gpx` format.
- [ ] Export generated activity as `.tcx` format.

### Out of Scope

- Direct API integration with Strava to upload the activity — deferred to future milestone, focus first is on file export.

## Context

- **Environment**: Next.js / React with Tailwind CSS.
- **Mapping context**: Requires integrations with mapping providers like OpenStreetMap/Overpass API for routing and Open Topo Data for elevation.
- **Domain**: Fitness tracking data structures (GPX/TCX/FIT schemas) and geospatial analysis.

## Constraints

- **Tech Stack**: Next.js/React — standardizing on modern React architecture.
- **Aesthetic**: Clean, premium, sporty UI aesthetic with Tailwind CSS.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Next.js & React | Best ecosystem for rapid modern web app creation. | — Pending |
| Local file generation | Faster MVP than integrating full Strava OAuth for direct upload. | — Pending |

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
*Last updated: 2026-04-16 after initialization*
