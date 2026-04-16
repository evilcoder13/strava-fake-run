# Architecture Research

**Domain:** Strava Log Simulation / GPS Builder
**Researched:** 2026-04-16
**Confidence:** HIGH

## Overview

The application is a purely client-side SPA (Single Page Application) that leverages browser processing to handle geospatial mapping, route drawing, and XML synthesis for downloads. Next.js App Router will be used for rapid page structure, but the heavy lifting remains in client components.

## Core Components

1. **Map Engine (UI Layer)**
   - Responsible for rendering the base map (OSM/Mapbox tiles).
   - Captures user click events to create waypoints.
   - Draws polylines connecting waypoints.

2. **Route Interpolator (Logic Layer)**
   - Takes coordinates and calculates the polyline distances (using `@turf/turf`).
   - Slices the distance according to the simulated pace.
   - Adjusts timestamps for each point based on the specified Start Date and target pace.
   - Applies pacing variability (slight variations to make pace look human).

3. **Biometric Simulator (Logic Layer)**
   - Correlates with the Route Interpolator.
   - Generates Heart Rate data scaling with elevation (optional) and speed.
   - Generates Cadence data linked to the pace.

4. **File Exporter (Data Layer)**
   - Translates the interpolated points, timestamps, and biometric data into standard XML DOM formats.
   - Creates a valid `.gpx` and `.tcx` document.
   - Triggers a Blob download in the browser.

## Data Flow

`User Clicks (Map) -> Waypoints Array -> (Pace/Settings Form changes) -> Interpolated Route Points (GeoJSON/Array Objects with time+HR+cadence) -> Export as GPX/TCX String -> Blob URL Download`

## Build Order

1. Setup UI layout (Sidebar + Map).
2. Implement map pointer clicking + coordinate collection.
3. Implement polyline drawing connecting points.
4. Implement routing snap-to-road API (Overpass/OSRM) to make routes realistic.
5. Build the temporal distance interpolation (Route Interpolator).
6. Build XML TCX/GPX generator for basic timestamps.
7. Add Heart Rate and Cadence logic layer.

---
*Architecture research for: GPS log simulation builder*
