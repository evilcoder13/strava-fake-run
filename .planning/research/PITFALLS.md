# Pitfalls Research

**Domain:** Strava Log Simulation / GPS Builder
**Researched:** 2026-04-16
**Confidence:** HIGH

## Common Mistakes

### 1. Straight Line "Bird Flight" Paths
- **Warning Sign:** Drawn paths cross right over buildings, water bodies, or track perfectly straight.
- **Prevention Strategy:** Implement a routing engine API (like OSRM or Mapbox Directions API) that takes two clicked waypoints and returns the snapped polyline of the path/road. 
- **Phase:** Map Integration & Routing.

### 2. Invalid TCX/GPX XML schemas
- **Warning Sign:** Strava rejects the uploaded file with "Malformed data" or "Corrupt file" errors.
- **Prevention Strategy:** Use a strict XML builder and validate against the official Training Center Database XML Schema (`https://www8.garmin.com/xmlschemas/TrainingCenterDatabasev2.xsd`). Never just use string concatenation to build XML.
- **Phase:** File Export.

### 3. Too Perfect Data (Robotic Simulation)
- **Warning Sign:** Every single coordinate point has exactly a 5min/km pace. The cadence is exactly 170. Heart rate is completely flat at 150. Strava's analysis might flag it, or friends will immediately recognize it as a fake run.
- **Prevention Strategy:** Apply Perlin noise or simple Gaussian randomization variations for pace (±20s/km), HR (±5 BPM), and cadence (±3 SPM).
- **Phase:** Interpolation & Biometric Simulation.

### 4. Overwhelming Third-Party API Limits
- **Warning Sign:** Fast-hitting Open Topo Data or OSRM instances limits, returning 429 Too Many Requests, breaking the route mapping for users.
- **Prevention Strategy:** Debounce map clicks. Use batch array calls for elevation APIs.
- **Phase:** Routing & Elevation.

---
*Pitfalls research for: GPS log simulation builder*
