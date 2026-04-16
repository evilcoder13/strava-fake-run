# StravaFakeRun

## Project Overview

StravaFakeRun is a web application clone of `fakemy.run` that allows users to seamlessly generate realistic, synthetic workout log files (such as GPX, TCX, or FIT formats) that are seamlessly compatible with Strava and other fitness tracking platforms.

The core motivation behind this tool is to give users the ability to manually craft activities with granular control over metrics—such as distance, pace, elevation, and biometric data (heart rate, cadence)—allowing them to log activities they might have lost data for, or for testing fitness applications.

## Core Features

1. **Route Generation & Mapping**:
   - Interactive map interface (e.g., using Leaflet or Mapbox) to draw, upload, or modify routes.
   - Snap-to-road functionality to make routes realistic.
   - Import existing GPX paths to modify.

2. **Activity Configuration**:
   - **Date & Time**: Set the exact starting time of the activity.
   - **Pace / Speed**: Define average pace, with the option to add "dynamic variability" so it doesn't look like a machine generated it.
   - **Elevation Profile**: Pull real elevation data for the drawn route, or simulate continuous elevation gain.

3. **Biometric Simulation (Optional realism markers)**:
   - **Heart Rate**: Generate a simulated heart rate curve that scales realistically with pace and elevation changes.
   - **Cadence**: Simulate running cadence corresponding to the chosen pace.

4. **Export & Download**:
   - Export generated routes in industry-standard formats: 
     - `.gpx` (GPS Exchange Format)
     - `.tcx` (Training Center XML - supports fitness data like HR)
   - (Future) Direct API integration with Strava to upload the activity.

## Proposed Tech Stack (Web App)

- **Frontend Framework**: Next.js / React (for rapid UI development and modern features).
- **Styling**: Tailwind CSS (paired with a clean, premium, sporty UI aesthetic).
- **Map Integration**: React Leaflet (Leaflet.js) or Mapbox GL JS.
- **Routing/Geo Data**: 
  - Overpass API / OpenStreetMap (for routing and snapping to roads).
  - Open Topo Data (for elevation fetching).
- **File Generation**: Custom JavaScript utilities / libraries (like `togpx` or custom XML builders) for constructing valid GPX and TCX documents on the client-side.

## Target User Experience

The application must wow users with a modern, sporty, and intuitive interface. It should feel robust, responsive, and provide instant visual feedback as the user draws their route and tweaks their simulated running metrics.

## Next Steps / Implementation Plan

1. **Setup Project**: Initialize Next.js project with Tailwind CSS.
2. **Map Component**: Implement the interactive map to plot waypoints.
3. **Route Calculation**: Implement logic to interpolate points between waypoints based on a selected target pace and calculate timestamps for each point.
4. **Data Export**: Implement GPX/TCX XML generation from the interpolated points.
5. **UI Polish**: Add forms for adjusting metrics (Pace, HR, Cadence) and ensure the layout is clean.
