# Features Research

**Domain:** Strava Log Simulation / GPS Builder
**Researched:** 2026-04-16
**Confidence:** HIGH

## Feature Categories

### Table Stakes (Must Have)

- **Interactive Route Map:** Click to create points. Drag points. Delete points.
- **Start Time Configuration:** Select a realistic start time and date.
- **Target Pace Settings:** Define an average pace (e.g., 5:30 min/km).
- **Export to GPX/TCX:** Generating clean files compatible with Strava, Garmin Connect, etc.

### Differentiators (Competitive Advantage)

- **Snap-to-Road:** Without this, lines cut through buildings making the fake obvious. Utilizing an OSRM or GraphHopper public API to snap the drawn linear map points to actual paths.
- **Dynamic Pacing:** The pace shouldn't be exactly 5:30 min/km for every single point. Adding a ±5% Gaussian distribution noise to timestamps makes it look organically human.
- **Biometric Simulation:** TCX export containing `<HeartRateBpm>` and `<Cadence>`.
- **Elevation Gain:** Correlating points with Open Topo Data to fetch real elevation. Speed typically drops on inclines, and HR goes up. A simulation linking elevation + HR + pace is incredibly realistic.

### Anti-Features (What NOT to build)

- **Social Networking:** Not building a network.
- **Direct Strava Oauth initially:** It's too high friction to set up Strava API limits. The primary goal is `.tcx` file downloads. We keep it completely un-authenticated.
- **Database Backend:** We don't need to store user routes. Keeping it 100% ephemeral client-side reduces hosting costs to $0 (Static export).

---
*Features research for: GPS log simulation builder*
