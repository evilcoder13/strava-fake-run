# Phase 3: Route Interpolator Brain - Research

**Researched:** 2026-04-17
**Domain:** Geospatial interpolation, biometric simulation, elevation APIs
**Confidence:** HIGH

---

## Summary

Phase 3 is a pure computation phase — no new UI surfaces. The goal is to take the
`snappedPath: [number, number][]` (Leaflet-format `[lat, lon]` pairs) already stored in
Zustand, and produce a dense `GeoJSON FeatureCollection` where every `Feature<Point>` carries
a timestamp, heart rate, cadence, and elevation. Phase 4 (GPX/TCX export) consumes this array
directly, so the output schema must be locked here.

The plan decomposes naturally into two modules:

1. **Temporal path distancer** (`lib/routeInterpolator.ts`) — uses `@turf/turf` to walk the
   polyline at fixed time intervals and produce spaced coordinates with timestamps. Gaussian
   pacing noise (Box-Muller) is injected when `useNoise` is true.

2. **Biometric + elevation simulator** (`lib/biometricSimulator.ts` + `lib/elevationClient.ts`)
   — computes HR via Karvonen warmup curve, cadence via linear pace-to-SPM model, and fetches
   real elevation from the free Open-Meteo Elevation API (no key needed, ~100 coords per
   request, free tier confirmed live).

`@turf/turf` v7.3.4 (published 2026-02-08) is not yet installed in the project and must be
added. No other new dependencies are required; all biometric math uses pure TypeScript and the
Elevation API uses `fetch` (already available in Next.js 14).

**Primary recommendation:** Install `@turf/turf`, build two pure TypeScript utility modules
(`lib/routeInterpolator.ts`, `lib/biometricSimulator.ts`), one API client
(`lib/elevationClient.ts`), add a Zustand action `generateActivity()` that orchestrates them
and stores the output, then expose a "Generate" button in the Sidebar.

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| CFG-04 | Application calculates segmented distances and interpolates timestamps based on target pace | `@turf/along` + `@turf/length` + pace math in `routeInterpolator.ts` |
| BIO-01 | Application generates a baseline simulated heart rate curve | Karvonen exponential warmup model in `biometricSimulator.ts` |
| BIO-02 | Application generates running cadence corresponding to the chosen pace | Linear pace-to-SPM lookup in `biometricSimulator.ts` |
| BIO-03 | Application fetches real-world elevation profiles for the route points | Open-Meteo Elevation API (GET, free, no auth) via `elevationClient.ts` |
</phase_requirements>

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Route interpolation (pace, noise) | Browser / Client (lib module) | — | All computation happens in-browser; no server needed |
| HR / cadence simulation | Browser / Client (lib module) | — | Pure math, no external state |
| Elevation fetching | Browser / Client (fetch) | External API (open-meteo) | Free API called from browser via `fetch`; no backend proxy needed |
| State storage of generated activity | Browser / Client (Zustand) | — | Continues the existing ephemeral-browser-only architecture |
| "Generate" trigger button | Frontend (Sidebar component) | — | Fits in existing Sidebar UI |

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@turf/turf` | 7.3.4 | Geospatial math on GeoJSON — distance, along, length, line-slice-along | Industry-standard client-side geo library; used by Mapbox, ArcGIS, and thousands of mapping apps |
| `zustand` | 5.0.12 (already installed) | Store output `ActivityPoint[]` and expose `generateActivity()` action | Already used in Phase 1-2; consistent pattern |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Open-Meteo Elevation API | N/A (external, free) | Fetch real-world elevation for route coordinates | BIO-03 requirement; no API key, free tier, batch endpoint confirmed working |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `@turf/turf` (monolithic) | Individual `@turf/along`, `@turf/length` | Individual packages save ~40KB bundle size but add install complexity; `@turf/turf` is simpler for 3 functions |
| Open-Meteo Elevation | Open-Elevation (self-hosted) or Mapbox Terrain | Open-Elevation requires hosting; Mapbox requires API key and billing; Open-Meteo is free and live |

**Installation:**
```bash
npm install @turf/turf
```
TypeScript types are bundled — no separate `@types/turf` needed.

**Version verification:** `@turf/turf` v7.3.4 confirmed against npm registry 2026-04-17.
[VERIFIED: npm registry]

---

## Architecture Patterns

### System Architecture Diagram

```
[Zustand Store]
   snappedPath: [lat,lon][]
   paceMinutes, paceSeconds
   useNoise, startDate, startTime
         │
         │ generateActivity()
         ▼
[lib/routeInterpolator.ts]
   1. Flip coords: [lat,lon] → [lon,lat] (GeoJSON)
   2. turf.length(lineString)  → totalKm
   3. Divide into N time-steps (default 10s intervals)
   4. For each step i:
       a. noisy_pace = pace ± gaussian(0, stdDev)  if useNoise
       b. cumDistKm += intervalSec / noisy_pace_sec_km
       c. pt = turf.along(lineString, cumDistKm)
       d. timestamp = startTimestamp + cumSeconds
   5. Returns: InterpolatedPoint[] { lon, lat, timestamp, distFromStart }
         │
         │ InterpolatedPoint[]
         ▼
[lib/biometricSimulator.ts]          [lib/elevationClient.ts]
   For each point:                     Batch GET open-meteo
   - HR = karvonen(t, pace)            /v1/elevation?lat=…&lon=…
   - Cadence = paceToSPM(pace)         Returns elevations[]
   - +gaussian noise (±3bpm, ±2spm)
         │                                    │
         └────────────── merge ───────────────┘
                          │
                          ▼
              ActivityPoint[] (GeoJSON Feature<Point>[])
              stored to Zustand: generatedActivity
                          │
                          │ Phase 4 consumes
                          ▼
              [Export Engine — GPX/TCX builder]
```

### Recommended Project Structure
```
lib/
├── routeInterpolator.ts    # Temporal path distancer (turf + noise)
├── biometricSimulator.ts   # HR + cadence simulator classes
└── elevationClient.ts      # Open-Meteo elevation fetch + batching
store/
└── useRouteStore.ts        # Add: generatedActivity, generateActivity()
components/
└── Sidebar.tsx             # Add: "Generate Activity" button + loading state
```

### Pattern 1: Walking a LineString at Fixed Time Intervals with @turf/along

**What:** Call `along(lineString, distKm)` for each time step. Distance advances by
`(intervalSeconds / paceSecondsPerKm)` km per step, with optional Gaussian noise applied to
the pace each step.

**When to use:** Whenever a time-indexed path is needed from a polyline geometry.

```typescript
// Source: Context7 /turfjs/turf docs, verified 2026-04-17
import { lineString, along, length } from "@turf/turf";

// CRITICAL: snappedPath is [lat, lon] (Leaflet) — flip to [lon, lat] for GeoJSON/turf
const coords = snappedPath.map(([lat, lon]) => [lon, lat]);
const line = lineString(coords);
const totalKm = length(line, { units: "kilometers" });

const intervalSeconds = 10;  // 10-second GPS fix interval
const paceSecPerKm = paceMinutes * 60 + paceSeconds;

let cumDistKm = 0;
let cumSeconds = 0;
const points: InterpolatedPoint[] = [];

while (cumDistKm < totalKm) {
  const feature = along(line, cumDistKm, { units: "kilometers" });
  const [lon, lat] = feature.geometry.coordinates;
  const timestamp = new Date(startMs + cumSeconds * 1000).toISOString();

  points.push({ lat, lon, timestamp, distFromStart: cumDistKm });

  const noisyPace = useNoise
    ? Math.max(paceSecPerKm * 0.7, gaussianRandom(paceSecPerKm, paceSecPerKm * 0.05))
    : paceSecPerKm;
  const stepKm = intervalSeconds / noisyPace;
  cumDistKm += stepKm;
  cumSeconds += intervalSeconds;
}
```
[VERIFIED: Context7 /turfjs/turf, npm registry 2026-04-17]

### Pattern 2: Box-Muller Gaussian Noise

**What:** Generates a normally distributed random value. Pure math, no library needed.

**When to use:** Injecting human-like variance into pace and biometrics.

```typescript
// Source: Box-Muller transform — mathematically verified via Node.js runtime test 2026-04-17
function gaussianRandom(mean: number, stdDev: number): number {
  let u1: number, u2: number;
  do { u1 = Math.random(); } while (u1 === 0);
  do { u2 = Math.random(); } while (u2 === 0);
  const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  return mean + z0 * stdDev;
}
// Verified: 1000-sample simulation yields mean=330.5, stdDev=15.0 for mean=330, stdDev=15
```
[VERIFIED: runtime test 2026-04-17]

### Pattern 3: Karvonen HR Model with Exponential Warmup

**What:** Computes realistic HR for each point using physiological parameters.
Three inputs: `restHR`, `maxHR`, `paceSecPerKm`. Produces HR value per elapsed seconds.

**When to use:** BIO-01 — baseline simulated heart rate curve.

```typescript
// Source: Karvonen formula + exponential warmup — domain-standard physiology model [ASSUMED]
function computeHR(
  elapsedSeconds: number,
  totalSeconds: number,
  restHR: number,
  maxHR: number,
  targetZoneFraction: number,  // e.g. 0.70 for Z3 lower bound
  warmupTauSeconds: number = 120
): number {
  const hrr = maxHR - restHR;               // Heart rate reserve
  const steadyHR = restHR + targetZoneFraction * hrr;

  // Warmup: exponential rise toward steadyHR (tau ~120s for most runners)
  const warmupFactor = 1 - Math.exp(-elapsedSeconds / warmupTauSeconds);
  const baseHR = restHR + (steadyHR - restHR) * warmupFactor;

  // Cardiac drift: HR creeps ~5 bpm over full run duration
  const driftBpm = (elapsedSeconds / totalSeconds) * 5;

  return Math.round(baseHR + driftBpm);
}
```

**Default inputs when user provides no biometric profile (CFG not extended this phase):**
- `restHR = 65` bpm [ASSUMED — typical recreational runner]
- `maxHR = 185` bpm [ASSUMED — use 220 - age formula; 35-year-old default]
- `targetZoneFraction` derived from pace (see mapping below)

**Pace → HR Zone mapping [ASSUMED — standard running physiology]:**
| Pace (min/km) | Zone | Karvonen Fraction | Steady HR (65/185) |
|---------------|------|-------------------|--------------------|
| < 4:30 | Z4 | 0.80-0.90 | 161-173 bpm |
| 4:30-5:30 | Z3 | 0.70-0.80 | 149-161 bpm |
| 5:30-6:30 | Z2 | 0.60-0.70 | 137-149 bpm |
| 6:30-8:00 | Z1 | 0.50-0.60 | 125-137 bpm |

**Verified Karvonen zone values** (restHR=60, maxHR=185 example run):
- Z1: 123-135 bpm, Z2: 135-148 bpm, Z3: 148-160 bpm, Z4: 160-173 bpm, Z5: 173-185 bpm
[VERIFIED: runtime test 2026-04-17]

### Pattern 4: Linear Pace-to-Cadence Model

**What:** Maps pace (seconds/km) to steps per minute (SPM, both feet counted).

**When to use:** BIO-02 — running cadence matching chosen pace.

```typescript
// Source: Published running research — typical range 158-180 spm across paces [ASSUMED]
// Empirical linear model: 4:00/km → 180 spm; 7:00/km → 158 spm
function paceToCadence(paceSecPerKm: number): number {
  const pace4Min = 240;  // seconds
  const pace7Min = 420;  // seconds
  const spmAt4Min = 180;
  const spmAt7Min = 158;
  const clampedPace = Math.min(Math.max(paceSecPerKm, pace4Min), pace7Min);
  const fraction = (clampedPace - pace4Min) / (pace7Min - pace4Min);
  return Math.round(spmAt4Min + fraction * (spmAt7Min - spmAt4Min));
}
// Verified: 4:00→180, 4:30→176, 5:00→173, 5:30→169, 6:00→165, 6:30→162, 7:00→158 spm
```
[VERIFIED: runtime test 2026-04-17]

### Pattern 5: Open-Meteo Elevation API (Batch)

**What:** Fetch real elevations for up to 100+ coordinates per request. Free, no API key.

**When to use:** BIO-03 — real-world elevation profiles.

```typescript
// Source: API endpoint confirmed working 2026-04-17 [VERIFIED: live API test]
async function fetchElevations(
  coords: { lat: number; lon: number }[]
): Promise<number[]> {
  // Batch in chunks of 100 to stay well within any undocumented limit
  const CHUNK = 100;
  const allElevations: number[] = [];
  for (let i = 0; i < coords.length; i += CHUNK) {
    const chunk = coords.slice(i, i + CHUNK);
    const lats = chunk.map(c => c.lat).join(",");
    const lons = chunk.map(c => c.lon).join(",");
    const url = `https://api.open-meteo.com/v1/elevation?latitude=${lats}&longitude=${lons}`;
    const res = await fetch(url);
    const json = await res.json() as { elevation: number[] };
    allElevations.push(...json.elevation);
  }
  return allElevations;
}
// VERIFIED: 2-point, 5-point, and 100-point batches all return { elevation: number[] }
// Response example: {"elevation":[38.0, 56.0, 53.0]}
```
[VERIFIED: live API test 2026-04-17]

### Pattern 6: Output Data Structure — ActivityPoint

**What:** The schema that Phase 4 (GPX/TCX export) will consume. Must be locked here.

```typescript
// This is the contract between Phase 3 (generation) and Phase 4 (export)
export interface ActivityPoint {
  lat: number;               // WGS84 latitude
  lon: number;               // WGS84 longitude
  timestamp: string;         // ISO 8601 UTC e.g. "2024-01-15T08:00:10.000Z"
  heartRate: number;         // bpm integer
  cadence: number;           // steps per minute (spm, both feet) integer
  elevation: number;         // meters above sea level
  distFromStartKm: number;   // cumulative distance from route start
}

// Stored in Zustand as:
// generatedActivity: ActivityPoint[] | null
```

### Anti-Patterns to Avoid

- **Using `turf.lineChunk` instead of `turf.along`:** `lineChunk` divides a line into equal
  distance segments — useful for physical chunks but does NOT accept time-based spacing.
  Use `along()` with manually computed cumulative distances.
- **Not flipping Leaflet coordinates:** `snappedPath` is `[lat, lon]`. Turf/GeoJSON requires
  `[lon, lat]`. Forgetting this flip produces coordinates that are hundreds of km off.
  [VERIFIED: codebase inspection of useRouteStore.ts]
- **Calling Open-Meteo with >100 points in a single request:** 100 confirmed working. Limit
  unknown. Batch in 100-coord chunks defensively.
- **Applying noise to absolute position instead of pace:** Noise must be applied to the
  `paceSecPerKm` value each time step, not to the coordinate directly. Adding position jitter
  produces physically impossible zigzag tracks.
- **Using `Math.random()` directly for Gaussian noise:** Uniform distribution looks nothing
  like human pace variation. Always use Box-Muller or equivalent normal distribution.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Measuring polyline length | Custom Haversine loop over coords | `turf.length(line)` | Handles spherical geometry, all edge cases |
| Interpolating a point at N km along a polyline | Custom segment-walking with lerp | `turf.along(line, dist)` | Handles vertex crossings, avoids accumulation error |
| Slicing a polyline segment | Manual coord array slicing | `turf.lineSliceAlong(line, start, stop)` | Handles partial segment interpolation at endpoints |
| Normal distribution noise | Custom random sampling | Box-Muller transform (4 lines, no library) | Standard mathematical transform; no npm package needed |
| Real elevation data | Synthetic sine-wave elevation | Open-Meteo Elevation API | Free, accurate DEM data with zero infrastructure |

**Key insight:** The geospatial math in Turf handles spherical Earth geometry that flat-Earth
approximations silently get wrong, especially over longer routes (>2km).

---

## Common Pitfalls

### Pitfall 1: Coordinate Order Inversion (Leaflet vs GeoJSON)
**What goes wrong:** Turf functions receive `[lat, lon]` instead of `[lon, lat]`, producing
coordinates that are reflected across the equator/meridian.
**Why it happens:** Leaflet uses `[lat, lon]` order; GeoJSON/Turf use `[lon, lat]` order.
The current store uses `snappedPath: [number, number][]` in Leaflet order.
**How to avoid:** Always convert at the Turf boundary:
`snappedPath.map(([lat, lon]) => [lon, lat])`.
**Warning signs:** Output points cluster near 0°N, 0°E or appear in the ocean.

### Pitfall 2: Route Not Long Enough for Interpolation
**What goes wrong:** `along(line, dist)` called with a `dist` exceeding the line's total
length returns the last point silently — the generated route appears to stop early and then
has duplicate final coordinates.
**Why it happens:** Loop condition must check `cumDistKm < totalKm` strictly.
**How to avoid:** Add a guard: `if (cumDistKm >= totalKm) break;` inside the while loop.
**Warning signs:** Last N points in the output all have identical coordinates.

### Pitfall 3: Calling generateActivity Before snappedPath is Ready
**What goes wrong:** User clicks "Generate" before the OSRM API has returned a snapped path.
`generateActivity()` runs on an empty array and produces 0 points.
**Why it happens:** `snappedPath` population is async and may lag behind user action.
**How to avoid:** Disable the "Generate" button when `snappedPath.length < 2` or when an OSRM
fetch is in-flight. Add an `isGenerating` flag to the store.
**Warning signs:** `generatedActivity` stored as `[]`.

### Pitfall 4: Open-Meteo Elevation API Rate Limit on Long Routes
**What goes wrong:** A dense 20km route at 10s intervals produces ~660 points. Even at chunk
size 100, that is 7 sequential requests. The API is documented as free with a 10,000 calls/day
limit (unverified rate limit documentation not confirmed).
**Why it happens:** High point density exceeds batch size.
**How to avoid:** Use 10-second intervals (not 1-second). 10km route = ~330 points = 4 API
requests. Keep interval at 10s minimum.
**Warning signs:** Open-Meteo returns HTTP 429 or `{ error: true }`.

### Pitfall 5: Noise Makes Pace Negative or Near-Zero
**What goes wrong:** Gaussian noise applied to a slow pace (7:00/km = 420 s/km) could in rare
cases subtract more than the mean, producing a negative `noisyPace` and a `stepKm` of
infinity or NaN.
**Why it happens:** Normal distribution has infinite tails.
**How to avoid:** Clamp: `const noisyPace = Math.max(paceSecPerKm * 0.70, gaussianRandom(...))`.
This prevents pace from being more than 30% faster than target (physiologically realistic).
**Warning signs:** `NaN` timestamps or `Infinity` distances in output.

---

## Code Examples

### Verified Installation

```bash
npm install @turf/turf
```

`@turf/turf` v7.3.4 — published 2026-02-08. Includes TypeScript types.
[VERIFIED: npm registry 2026-04-17]

### Full Interpolation Skeleton

```typescript
// lib/routeInterpolator.ts
import { lineString, along, length } from "@turf/turf";

export interface ActivityPoint {
  lat: number;
  lon: number;
  timestamp: string;
  heartRate: number;
  cadence: number;
  elevation: number;
  distFromStartKm: number;
}

function gaussianRandom(mean: number, stdDev: number): number {
  let u1: number, u2: number;
  do { u1 = Math.random(); } while (u1 === 0);
  do { u2 = Math.random(); } while (u2 === 0);
  const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  return mean + z0 * stdDev;
}

export interface InterpolateOptions {
  snappedPath: [number, number][];  // [lat, lon] Leaflet format
  startDate: string;                // "YYYY-MM-DD"
  startTime: string;                // "HH:MM"
  paceMinutes: number;
  paceSeconds: number;
  useNoise: boolean;
  intervalSeconds?: number;         // Default: 10
}

export interface InterpolatedPoint {
  lat: number;
  lon: number;
  timestamp: string;
  distFromStartKm: number;
  elapsedSeconds: number;
}

export function interpolatePath(opts: InterpolateOptions): InterpolatedPoint[] {
  const { snappedPath, startDate, startTime, paceMinutes, paceSeconds, useNoise } = opts;
  const intervalSec = opts.intervalSeconds ?? 10;

  if (snappedPath.length < 2) return [];

  // Flip: Leaflet [lat,lon] → GeoJSON [lon,lat]
  const coords = snappedPath.map(([lat, lon]) => [lon, lat]);
  const line = lineString(coords);
  const totalKm = length(line, { units: "kilometers" });

  const paceSecPerKm = paceMinutes * 60 + paceSeconds;
  const startMs = new Date(`${startDate}T${startTime}:00.000Z`).getTime();

  const points: InterpolatedPoint[] = [];
  let cumDistKm = 0;
  let cumSeconds = 0;

  while (cumDistKm < totalKm) {
    const pt = along(line, cumDistKm, { units: "kilometers" });
    const [lon, lat] = pt.geometry.coordinates;
    points.push({
      lat,
      lon,
      timestamp: new Date(startMs + cumSeconds * 1000).toISOString(),
      distFromStartKm: cumDistKm,
      elapsedSeconds: cumSeconds,
    });

    const noisyPace = useNoise
      ? Math.max(paceSecPerKm * 0.70, gaussianRandom(paceSecPerKm, paceSecPerKm * 0.05))
      : paceSecPerKm;

    cumDistKm += intervalSec / noisyPace;
    cumSeconds += intervalSec;
  }

  return points;
}
```
[VERIFIED: Context7 /turfjs/turf API signatures 2026-04-17]

### Elevation Client

```typescript
// lib/elevationClient.ts
export async function fetchElevations(
  coords: { lat: number; lon: number }[]
): Promise<number[]> {
  const CHUNK = 100;
  const results: number[] = [];

  for (let i = 0; i < coords.length; i += CHUNK) {
    const chunk = coords.slice(i, i + CHUNK);
    const lats = chunk.map(c => c.lat).join(",");
    const lons = chunk.map(c => c.lon).join(",");
    const url =
      `https://api.open-meteo.com/v1/elevation?latitude=${lats}&longitude=${lons}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Open-Meteo elevation API error: ${res.status}`);
    const json = (await res.json()) as { elevation?: number[]; error?: boolean };
    if (json.error || !json.elevation) throw new Error("Open-Meteo returned error");
    results.push(...json.elevation);
  }

  return results;
}
```
[VERIFIED: live API call confirmed format 2026-04-17]

### Biometric Simulator

```typescript
// lib/biometricSimulator.ts
function gaussianRandom(mean: number, stdDev: number): number {
  let u1: number, u2: number;
  do { u1 = Math.random(); } while (u1 === 0);
  do { u2 = Math.random(); } while (u2 === 0);
  const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  return mean + z0 * stdDev;
}

// Karvonen fraction derived from pace
function paceToKarvonenFraction(paceSecPerKm: number): number {
  if (paceSecPerKm < 270) return 0.85;       // sub-4:30 → Z4/Z5
  if (paceSecPerKm < 330) return 0.75;       // 4:30-5:30 → Z3
  if (paceSecPerKm < 390) return 0.65;       // 5:30-6:30 → Z2
  return 0.55;                               // 6:30+ → Z1
}

export function computeHR(params: {
  elapsedSeconds: number;
  totalSeconds: number;
  paceSecPerKm: number;
  restHR?: number;     // Default 65
  maxHR?: number;      // Default 185
  addNoise?: boolean;
}): number {
  const { elapsedSeconds, totalSeconds, paceSecPerKm } = params;
  const restHR = params.restHR ?? 65;
  const maxHR = params.maxHR ?? 185;
  const hrr = maxHR - restHR;

  const fraction = paceToKarvonenFraction(paceSecPerKm);
  const steadyHR = restHR + fraction * hrr;
  const warmupFactor = 1 - Math.exp(-elapsedSeconds / 120);
  const baseHR = restHR + (steadyHR - restHR) * warmupFactor;
  const drift = (elapsedSeconds / totalSeconds) * 5;
  const raw = baseHR + drift;

  return Math.round(
    params.addNoise ? gaussianRandom(raw, 3) : raw
  );
}

export function computeCadence(params: {
  paceSecPerKm: number;
  addNoise?: boolean;
}): number {
  const { paceSecPerKm } = params;
  const clamped = Math.min(Math.max(paceSecPerKm, 240), 420);
  const fraction = (clamped - 240) / 180;
  const baseSpm = Math.round(180 + fraction * (158 - 180));
  return Math.round(
    params.addNoise ? gaussianRandom(baseSpm, 2) : baseSpm
  );
}
```
[ASSUMED — zone fractions and warmup tau are standard physiology but defaults not sourced from cited publication]

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `@turf/along` from individual package | `along` from `@turf/turf` monorepo bundle v7 | Turf v7 restructured packages | Single install; tree-shaking still works |
| Open-Elevation (self-hosted) | Open-Meteo Elevation API (cloud-hosted) | ~2023 | No infrastructure cost, no API key |
| `turf.lineDistance` (deprecated name) | `turf.length` | Turf v5 | API renamed; `lineDistance` removed in v7 |

**Deprecated/outdated:**
- `turf.lineDistance`: Removed in Turf v5+. Use `turf.length`. [VERIFIED: Context7 docs 2026-04-17]
- Individual `@turf/along`, `@turf/length` installs: Still valid, but `@turf/turf` is simpler
  for this use-case and is the recommended install for consuming multiple functions.

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Default `restHR=65`, `maxHR=185` are reasonable for a recreational runner | Biometric Simulator Pattern | Unrealistic HR values in output; low risk — defaults are clearly labeled, Phase 4 export doesn't validate HR ranges |
| A2 | Warmup tau of 120 seconds is physiologically typical | Biometric Simulator Pattern | HR curve visually wrong; Strava won't validate HR curves, so no upload failure |
| A3 | Karvonen zone fractions in the pace table (0.55/0.65/0.75/0.85) are accurate | Biometric Simulator Pattern | Zone assignment may be off by one zone; still plausible HR output |
| A4 | Linear pace-to-cadence model (158-180 spm across 7:00-4:00/km) matches real runners | Cadence Pattern | Cadence values off by ~5-10 spm; Strava accepts any reasonable integer |
| A5 | Open-Meteo free tier allows at least 7 sequential batch requests without rate-limiting for a single user session | Elevation Client Pattern | Long route elevation fetch fails; mitigation: graceful fallback to 0m elevation on error |
| A6 | Open-Meteo Elevation API max batch size is >= 100 coordinates | Elevation Client Pattern | Confirmed 100 works; >100 untested — chunking at 100 is the safe strategy |

---

## Open Questions

1. **Should `generateActivity` be fully reactive or user-triggered?**
   - What we know: The roadmap mentions a "Generate" button concept; the Sidebar has run settings
     but no generate button yet.
   - What's unclear: Should generation auto-run on snappedPath change, or require explicit user
     trigger?
   - Recommendation: User-triggered via a "Generate Activity" button in Sidebar — avoids
     expensive API calls on every path update and keeps UX predictable.

2. **Should `generatedActivity` persist to localStorage?**
   - What we know: The project explicitly chose ephemeral browser-only processing (no DB).
   - What's unclear: If the user refreshes, generated data is lost.
   - Recommendation: Keep ephemeral (no persistence) — consistent with project scope. Phase 4
     export is the persistence mechanism.

3. **Where should `generateActivity` live — Zustand action or standalone utility?**
   - What we know: All async operations so far are Zustand actions (`fetchSnappedPath`).
   - What's unclear: The action calls three separate modules; testing is harder if inside Zustand.
   - Recommendation: Pure functions in `lib/` modules; thin Zustand wrapper calls them and
     stores result. Enables unit testing of pure functions.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Build toolchain | Yes | v22.22.0 | — |
| npm | Package install | Yes | 10.9.4 | — |
| `@turf/turf` | CFG-04 | No (not in package.json) | — | Must install: `npm install @turf/turf` |
| Open-Meteo Elevation API | BIO-03 | Yes (live) | N/A | Fallback to `elevation: 0` on error |
| TypeScript | Type safety | Yes (devDep) | ^5 | — |

**Missing dependencies with no fallback:**
- `@turf/turf` — must be installed before implementation begins.

**Missing dependencies with fallback:**
- Open-Meteo Elevation API — if unreachable, default to `elevation: 0` for all points. Route
  still usable for GPX/TCX export; Strava accepts 0-elevation tracks.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None currently installed — vitest v4.1.4 available on npm |
| Config file | None — Wave 0 creates `vitest.config.ts` |
| Quick run command | `npx vitest run lib/` |
| Full suite command | `npx vitest run` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| CFG-04 | `interpolatePath` returns correct point count for known route | unit | `npx vitest run lib/routeInterpolator` | No — Wave 0 |
| CFG-04 | Timestamps advance by `intervalSeconds` per point | unit | `npx vitest run lib/routeInterpolator` | No — Wave 0 |
| CFG-04 | `useNoise=true` produces non-identical intervals vs `useNoise=false` | unit | `npx vitest run lib/routeInterpolator` | No — Wave 0 |
| BIO-01 | `computeHR` at t=0 returns `restHR` | unit | `npx vitest run lib/biometricSimulator` | No — Wave 0 |
| BIO-01 | `computeHR` at t=totalSeconds returns value near `steadyHR+drift` | unit | `npx vitest run lib/biometricSimulator` | No — Wave 0 |
| BIO-02 | `computeCadence(330)` returns value in [165, 175] spm range | unit | `npx vitest run lib/biometricSimulator` | No — Wave 0 |
| BIO-03 | `fetchElevations` returns array matching input count | integration (mock fetch) | `npx vitest run lib/elevationClient` | No — Wave 0 |

### Sampling Rate
- **Per task commit:** `npx vitest run lib/routeInterpolator lib/biometricSimulator`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before `/gsd-verify-work`

### Wave 0 Gaps
- [ ] `vitest.config.ts` — needed with `environment: 'node'`
- [ ] `lib/__tests__/routeInterpolator.test.ts` — covers CFG-04
- [ ] `lib/__tests__/biometricSimulator.test.ts` — covers BIO-01, BIO-02
- [ ] `lib/__tests__/elevationClient.test.ts` — covers BIO-03 (mock fetch)

---

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No | Phase 3 is client-side computation only |
| V3 Session Management | No | Ephemeral browser state, no sessions |
| V4 Access Control | No | Single-user browser app |
| V5 Input Validation | Yes | Clamp pace inputs, validate snappedPath non-empty |
| V6 Cryptography | No | No secrets, keys, or passwords handled |

### Known Threat Patterns for this Stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Malformed `snappedPath` data (NaN coords) | Tampering | Validate coords before passing to turf; `along()` with NaN coord throws silently |
| Open-Meteo SSRF via crafted coordinates | Spoofing | Not applicable — all coordinates come from user map interaction, not external input |
| Extremely large route (10,000+ waypoints) causing browser hang | Denial of Service | Cap point count: if `totalKm > 50`, warn user and refuse generation |

---

## Sources

### Primary (HIGH confidence)
- Context7 `/turfjs/turf` — `along`, `length`, `lineSliceAlong` API signatures and examples
- npm registry `@turf/turf` — version 7.3.4, published 2026-02-08
- Live API test: `api.open-meteo.com/v1/elevation` — 2, 5, and 100-point batches confirmed
- Codebase inspection: `store/useRouteStore.ts` — snappedPath format, existing state shape

### Secondary (MEDIUM confidence)
- Node.js runtime verification: Box-Muller implementation, Karvonen zone math, cadence linear model

### Tertiary (LOW confidence)
- Running biomechanics defaults (restHR=65, maxHR=185, cadence range 158-180, warmup tau 120s)
  — training knowledge only, not sourced from a cited paper. Marked [ASSUMED] throughout.

---

## Metadata

**Confidence breakdown:**
- Standard stack (@turf/turf install, API calls): HIGH — npm registry + live API verified
- Architecture (module structure, data flow): HIGH — derived from existing codebase patterns
- Turf API patterns (along, length): HIGH — Context7 + npm registry
- Biometric model defaults: MEDIUM/LOW — physiologically reasonable but [ASSUMED]
- Pitfalls (coord flip, noise clamp): HIGH — verified against actual codebase

**Research date:** 2026-04-17
**Valid until:** 2026-05-17 (stable libraries; open-meteo API endpoint is long-lived free tier)
