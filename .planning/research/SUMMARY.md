# Research Summary

**Domain:** Strava Log Simulation / GPS Builder
**Researched:** 2026-04-16

## Executive Summary

The project revolves around developing a high-fidelity synthetic fitness activity builder for running logs. It targets generating `.gpx` and `.tcx` files capable of flawlessly parsing through rigorous Strava metrics without appearing robotic or synthetic. This goal will best be executed by utilizing a modern React/Next.js frontend to maintain a snappy SPA, leaning on Mapbox/Leaflet alongside OSRM (Open Source Routing Machine) to accurately plot and snap paths along realistic terrain.

## Crucial Findings

1. **Avoid Straight Lines**: Generating linear coordinates looks overtly synthetic. Implementing a "snap to road" direction API turns 5 manual waypoints into hundreds of organic road-following points.
2. **Apply Human "Noise" Randomization**: True performance isn't static. Pacing, cadence, and heart rate require standard deviation variation.
3. **Local/Client Processing**: The nature of routing logic and DOM-based file generation requires substantial client-level data mapping. Doing this locally keeps infrastructure costs near zero while respecting privacy.
4. **TCX vs GPX**: Implementing `.tcx` gives substantial weight to realism since it cleanly supports biometric extensions like Heart Rate and Cadence via XML, whereas generic `.gpx` struggles to uniformly carry these extensions without specialized Garmin headers.

## Recommendations for Scope

- Standardize on `Next.js` and `React Leaflet` for the UI shell.
- Utilize `@turf/turf` and `date-fns` for mathematical interpolations.
- Implement a rigid TCX XML builder using `xmlbuilder2` over simple string templating to prevent XML malformations blocking Strava imports.
- Keep Strava direct API auth out of scope—instead, focus heavily on the flawless local generation of compatible log files. 
