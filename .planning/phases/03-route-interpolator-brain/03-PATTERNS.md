# Phase 3: Route Interpolator Brain - Pattern Map

**Mapped:** 2026-04-17
**Files analyzed:** 8 (5 new lib files + 1 store modification + 1 sidebar modification + 1 vitest config)
**Analogs found:** 4 / 8 (4 files have direct codebase analogs; 4 are greenfield with no prior art)

---

## Codebase Inventory

Before pattern extraction: the project has **no `lib/` directory, no test files, and no `vitest.config.ts`**.
The `@turf/turf` package is **not installed** (not in `package.json`).

Existing source files:
- `store/useRouteStore.ts` — only Zustand store (109 lines)
- `components/Sidebar.tsx` — sidebar UI component (184 lines)
- `components/Map.tsx` — Leaflet map component (81 lines)
- `components/MapWrapper.tsx` — dynamic import wrapper (16 lines)
- `app/page.tsx` — root page (13 lines)
- `app/layout.tsx` — root layout (35 lines)

Path alias: `@/*` maps to project root (from `tsconfig.json`).
Store import pattern: `import { useRouteStore } from "@/store/useRouteStore"`.

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `lib/route-interpolator.ts` | utility | transform | `store/useRouteStore.ts` (`fetchSnappedPath`) | partial (same async+fetch shape; different purpose) |
| `lib/biometric-simulator.ts` | utility | transform | `store/useRouteStore.ts` (pure computation in actions) | partial (TS function structure) |
| `lib/elevation-simulator.ts` | utility | request-response | `store/useRouteStore.ts` (`fetchSnappedPath`) | role-match (same fetch+error pattern) |
| `lib/types/activity.ts` | model | — | `store/useRouteStore.ts` (interface definitions) | role-match (same TS interface pattern) |
| `store/useRouteStore.ts` (modified) | store | CRUD + request-response | `store/useRouteStore.ts` itself | exact (extend existing file) |
| `components/Sidebar.tsx` (modified) | component | request-response | `components/Sidebar.tsx` itself | exact (extend existing file) |
| `vitest.config.ts` | config | — | none | no analog |
| `lib/__tests__/*.test.ts` | test | — | none | no analog |

---

## Pattern Assignments

### `lib/route-interpolator.ts` (utility, transform)

**Analog:** `store/useRouteStore.ts` — specifically the `fetchSnappedPath` action and the `Waypoint` interface.

**Imports pattern** (`store/useRouteStore.ts`, lines 1–7):
```typescript
import { create } from 'zustand';

export interface Waypoint {
  id: string;
  lat: number;
  lng: number;
}
```
Key observations:
- Named exports for interfaces (not `export default` for types)
- No barrel index file — each module is imported directly by path
- No `import type` syntax — project uses direct `import` for interfaces

**Coordinate flip pattern** (`store/useRouteStore.ts`, lines 96–98):
```typescript
// OSRM returns [lon, lat] GeoJSON coords; store wants Leaflet [lat, lon]
const coords = json.routes[0].geometry.coordinates;
const snappedPath = coords.map(([lon, lat]: [number, number]) => [lat, lon]);
```
This is the exact inverse of what `route-interpolator.ts` must do. The stored `snappedPath` is
`[lat, lon]` (Leaflet order). Turf needs `[lon, lat]` (GeoJSON order). Copy this pattern and reverse:
```typescript
// Mirror of useRouteStore.ts line 98 — flip back to GeoJSON for turf
const coords = snappedPath.map(([lat, lon]: [number, number]) => [lon, lat]);
```

**Guard pattern** (`store/useRouteStore.ts`, lines 75–78):
```typescript
if (waypoints.length < 2) {
  set({ snappedPath: [] });
  return;
}
```
Copy this guard shape for `interpolatePath`:
```typescript
if (snappedPath.length < 2) return [];
```

**Error handling pattern** (`store/useRouteStore.ts`, lines 104–107):
```typescript
} catch (error) {
  console.error('Failed to fetch snapped path:', error);
  set({ snappedPath: waypoints.map((wp: Waypoint) => [wp.lat, wp.lng]) });
}
```
Pure utility functions in this project do NOT swallow errors silently — they log and fall back.
For `route-interpolator.ts` (a pure function, not a Zustand action), throw errors upward; the
Zustand wrapper (`generateActivity`) owns the try/catch.

**TypeScript style** (`store/useRouteStore.ts`, lines 9–23):
```typescript
interface RouteState {
  waypoints: Waypoint[];
  snappedPath: [number, number][];
  startDate: string;
  startTime: string;
  paceMinutes: number;
  paceSeconds: number;
  useNoise: boolean;
  // ...action signatures
}
```
Use named `interface` (not `type`) for object shapes. Use tuple `[number, number][]` for
coordinate arrays. Export interfaces that cross module boundaries.

---

### `lib/biometric-simulator.ts` (utility, transform)

**Analog:** `store/useRouteStore.ts` — the synchronous helper function structure inside the store,
and the TypeScript strict mode patterns.

**Function signature style** (`store/useRouteStore.ts`, lines 34–39):
```typescript
addWaypoint: (lat: number, lng: number) => {
  const id = Date.now().toString() + Math.random().toString(36).substring(2, 9);
  set((state) => {
    state.fetchSnappedPath();
    return { waypoints: [...state.waypoints, { id, lat, lng }] };
  });
},
```
Observation: the project uses named parameter style (not destructured objects) for simple
two-arg functions, but uses object params for complex multi-field inputs (see `setConfig`).
For `computeHR` and `computeCadence` with 5+ parameters, use an object parameter shape:
```typescript
export function computeHR(params: {
  elapsedSeconds: number;
  totalSeconds: number;
  paceSecPerKm: number;
  restHR?: number;
  maxHR?: number;
  addNoise?: boolean;
}): number { ... }
```

**Default value pattern** (`store/useRouteStore.ts`, lines 28–31):
```typescript
startDate: new Date().toISOString().split('T')[0],
startTime: "08:00",
paceMinutes: 5,
paceSeconds: 30,
```
Observation: defaults are inline at declaration. For optional params use `??` nullish coalescing:
```typescript
const restHR = params.restHR ?? 65;
const maxHR = params.maxHR ?? 185;
```

**No class pattern:** The project has zero class definitions. All logic is plain functions and
Zustand store objects. Do NOT use classes for `biometric-simulator.ts`. Use exported functions.

---

### `lib/elevation-simulator.ts` (utility, request-response)

**Analog:** `store/useRouteStore.ts` — the `fetchSnappedPath` async action is the only existing
external API fetch in the codebase. Copy its pattern exactly.

**Full fetch pattern** (`store/useRouteStore.ts`, lines 72–108):
```typescript
fetchSnappedPath: async () => {
  const waypoints = JSON.parse(JSON.stringify(useRouteStore.getState().waypoints));

  if (waypoints.length < 2) {
    set({ snappedPath: [] });
    return;
  }

  try {
    const waypointsString = waypoints
      .map((wp: Waypoint) => `${wp.lng},${wp.lat}`)
      .join(';');

    const url = `https://router.project-osrm.org/route/v1/foot/${waypointsString}?overview=full&geometries=geojson`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`OSRM request failed: ${response.status}`);
    }

    const json = await response.json();

    if (json.routes && json.routes[0] && json.routes[0].geometry) {
      const coords = json.routes[0].geometry.coordinates;
      const snappedPath = coords.map(([lon, lat]: [number, number]) => [lat, lon]);
      set({ snappedPath });
    } else {
      set({ snappedPath: waypoints.map((wp: Waypoint) => [wp.lat, wp.lng]) });
    }
  } catch (error) {
    console.error('Failed to fetch snapped path:', error);
    set({ snappedPath: waypoints.map((wp: Waypoint) => [wp.lat, wp.lng]) });
  }
},
```

Apply this pattern to `fetchElevations` with these adaptations:
- Replace Zustand `set()` calls with `return results` / `throw new Error()`
- Replace template-literal URL building with the Open-Meteo pattern
- Keep `response.ok` check → `throw new Error(\`...: \${response.status}\`)`
- Keep typed cast: `const json = (await response.json()) as { elevation?: number[] }`
- Keep `console.error` on catch, then throw upward (caller owns fallback)

**URL building style** (`store/useRouteStore.ts`, line 85):
```typescript
const url = `https://router.project-osrm.org/route/v1/foot/${waypointsString}?overview=full&geometries=geojson`;
```
Project uses template literals for URL construction. No `URL` class or `URLSearchParams` — keep
it consistent: use template literals for the Open-Meteo URL.

---

### `lib/types/activity.ts` (model, shared contract)

**Analog:** `store/useRouteStore.ts` — the `Waypoint` interface and `RouteState` interface
definitions at lines 3–23.

**Interface export pattern** (`store/useRouteStore.ts`, lines 3–7):
```typescript
export interface Waypoint {
  id: string;
  lat: number;
  lng: number;
}
```
Key rules observed:
- `export interface` (not `export type`) for object shapes
- All fields explicit, no index signatures
- No JSDoc comments — fields are self-describing
- File exports the interface directly (no re-export barrel needed)

**Tuple type annotation** (`store/useRouteStore.ts`, line 11):
```typescript
snappedPath: [number, number][];
```
For `ActivityPoint`, use explicit primitive types (`number`, `string`) not aliases.

**Target interface for `lib/types/activity.ts`** (from RESEARCH.md, locked contract):
```typescript
export interface ActivityPoint {
  lat: number;            // WGS84 latitude
  lon: number;            // WGS84 longitude
  timestamp: string;      // ISO 8601 UTC e.g. "2024-01-15T08:00:10.000Z"
  heartRate: number;      // bpm integer
  cadence: number;        // steps per minute integer
  elevation: number;      // meters above sea level
  distFromStartKm: number; // cumulative distance from route start
}
```
Note: this file should also export `InterpolatedPoint` (the intermediate shape from
`route-interpolator.ts` before biometrics are merged in).

---

### `store/useRouteStore.ts` (modified — add generateActivity action)

**Analog:** `store/useRouteStore.ts` itself — extend the existing `RouteState` interface and store.

**Interface extension pattern** (`store/useRouteStore.ts`, lines 9–23):
```typescript
interface RouteState {
  waypoints: Waypoint[];
  snappedPath: [number, number][];
  // ...existing fields...
  fetchSnappedPath: () => Promise<void>;
  setConfig: (config: Partial<RouteState>) => void;
}
```
Add new fields to the `RouteState` interface:
```typescript
generatedActivity: ActivityPoint[] | null;
isGenerating: boolean;
generateActivity: () => Promise<void>;
```

**Async action pattern** (`store/useRouteStore.ts`, lines 72–108):
```typescript
fetchSnappedPath: async () => {
  // 1. Read state snapshot
  const waypoints = JSON.parse(JSON.stringify(useRouteStore.getState().waypoints));
  // 2. Guard condition
  if (waypoints.length < 2) { set(...); return; }
  // 3. try { fetch → parse → set success state }
  // 4. catch { console.error → set fallback state }
},
```
Copy this exact shape for `generateActivity`:
```typescript
generateActivity: async () => {
  const state = useRouteStore.getState();
  if (state.snappedPath.length < 2) return;
  set({ isGenerating: true });
  try {
    // call pure lib functions, then:
    set({ generatedActivity: activityPoints, isGenerating: false });
  } catch (error) {
    console.error('Failed to generate activity:', error);
    set({ isGenerating: false });
  }
},
```

**Initial state defaults** (`store/useRouteStore.ts`, lines 26–32):
```typescript
export const useRouteStore = create<RouteState>((set) => ({
  waypoints: [],
  snappedPath: [],
  startDate: new Date().toISOString().split('T')[0],
  // ...
}));
```
Add initial values for new fields inline with the existing defaults block:
```typescript
generatedActivity: null,
isGenerating: false,
```

---

### `components/Sidebar.tsx` (modified — add Generate Activity button)

**Analog:** `components/Sidebar.tsx` itself — add a button section below the Run Settings block.

**Store subscription pattern** (`components/Sidebar.tsx`, line 76):
```typescript
const { waypoints, reorderWaypoints, setConfig, startDate, startTime, paceMinutes, paceSeconds, useNoise } = useRouteStore();
```
Extend this destructuring to pull `snappedPath`, `generatedActivity`, `isGenerating`, and
`generateActivity` from the store.

**Button style pattern** (`components/Sidebar.tsx`, lines 60–70):
```typescript
<button
  onClick={() => {
    if (confirm("Delete Waypoint: Are you sure you want to remove this point?")) {
      removeWaypoint(id);
    }
  }}
  className="p-2 text-gray-400 hover:text-red-500 rounded-md transition-colors"
  title="Remove"
>
  <Trash2 size={18} />
</button>
```
The Generate button must follow the same Tailwind class pattern but use Strava Orange accent:
```tsx
<button
  onClick={generateActivity}
  disabled={snappedPath.length < 2 || isGenerating}
  className="w-full py-2 px-4 bg-[#FC4C02] text-white text-sm font-medium rounded-md
             hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed
             transition-colors"
>
  {isGenerating ? 'Generating...' : 'Generate Activity'}
</button>
```

**Section structure pattern** (`components/Sidebar.tsx`, lines 102–155):
```tsx
<div className="p-4 bg-gray-50 border-b border-gray-200">
  <h2 className="text-sm font-semibold text-gray-900 mb-3">Run Settings</h2>
  <div className="space-y-3">
    {/* inputs */}
  </div>
</div>
```
Place the Generate button in a new `<div>` with the same `p-4 bg-gray-50 border-b border-gray-200`
wrapper, below the Run Settings section:
```tsx
<div className="p-4 bg-gray-50 border-b border-gray-200">
  <h2 className="text-sm font-semibold text-gray-900 mb-3">Activity</h2>
  {/* Generate button */}
  {/* Status display when generatedActivity !== null */}
</div>
```

**Conditional render pattern** (`components/Sidebar.tsx`, lines 158–164):
```tsx
{waypoints.length === 0 ? (
  <div className="text-center mt-12 p-6">
    <h2 className="text-lg font-semibold text-gray-900">No waypoints yet.</h2>
    <p className="text-sm text-gray-500 mt-2">...</p>
  </div>
) : ( ... )}
```
Copy this ternary pattern for conditional status display after generation:
```tsx
{generatedActivity !== null && (
  <p className="text-xs text-gray-500 mt-2">
    {generatedActivity.length} points generated
  </p>
)}
```

---

### `vitest.config.ts` (config — new file, no analog)

**No analog exists.** The project has no test infrastructure. See "No Analog Found" section.

---

### `lib/__tests__/*.test.ts` (tests — new files, no analog)

**No analog exists.** The project has zero test files. See "No Analog Found" section.

---

## Shared Patterns

### TypeScript Strict Mode
**Source:** `tsconfig.json` (line 8) + all source files
**Apply to:** All new `lib/` files
```json
"strict": true
```
All function parameters and return types must be fully annotated. No implicit `any`. The existing
store uses explicit type casts: `as { elevation?: number[] }`, `as [number, number]`. Use this
cast pattern for external API responses.

### Import Path Convention
**Source:** `components/Sidebar.tsx` (line 3), `components/Map.tsx` (line 6)
**Apply to:** All new files that import from `lib/` or `store/`
```typescript
import { useRouteStore } from "@/store/useRouteStore";
```
Use `@/` alias for all intra-project imports. Never use relative `../` paths from components.
From `lib/` files importing `lib/types/activity.ts`, use `@/lib/types/activity`.

### No Default Export for Utilities
**Source:** `store/useRouteStore.ts` (line 25) exports a named const. Components use `export default`
(`components/Sidebar.tsx` line 75, `components/Map.tsx` line 30).
**Rule:** Utility modules (`lib/*.ts`) use named exports. React components use `export default`.
```typescript
// lib files — named exports
export function interpolatePath(...): InterpolatedPoint[] { ... }
export function fetchElevations(...): Promise<number[]> { ... }
export interface ActivityPoint { ... }
```

### External API Fetch Error Handling
**Source:** `store/useRouteStore.ts` (lines 88–107)
**Apply to:** `lib/elevation-simulator.ts`
```typescript
const response = await fetch(url);
if (!response.ok) {
  throw new Error(`OSRM request failed: ${response.status}`);
}
const json = await response.json();
```
Always check `response.ok` before calling `.json()`. Throw with descriptive message including
status code. The Zustand action (`generateActivity`) is the top-level catch boundary.

### "use client" Directive
**Source:** `components/Sidebar.tsx` (line 1), `components/Map.tsx` (line 1)
**Apply to:** Only React component files. `lib/*.ts` utility modules do NOT get `"use client"` —
they are pure TypeScript modules imported by client components.

---

## No Analog Found

Files with no close match in the codebase (planner should use RESEARCH.md patterns directly):

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `vitest.config.ts` | config | — | No test infrastructure exists; copy from RESEARCH.md pattern |
| `lib/__tests__/route-interpolator.test.ts` | test | — | Zero test files in codebase; no pattern to copy |
| `lib/__tests__/biometric-simulator.test.ts` | test | — | Zero test files in codebase; no pattern to copy |
| `lib/__tests__/elevation-simulator.test.ts` | test | — | Zero test files in codebase; no pattern to copy |

**For `vitest.config.ts`**, planner should use this standard boilerplate (no codebase analog):
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
});
```

**For test files**, planner should use this structure (no codebase analog):
```typescript
// lib/__tests__/route-interpolator.test.ts
import { describe, it, expect } from 'vitest';
import { interpolatePath } from '@/lib/route-interpolator';

describe('interpolatePath', () => {
  it('returns empty array when snappedPath has fewer than 2 points', () => {
    expect(interpolatePath({ snappedPath: [], ... })).toEqual([]);
  });
});
```

---

## Key Observations for Planner

1. **No `lib/` directory exists.** The planner must create it. No existing structure to extend.

2. **`@turf/turf` is NOT installed.** Wave 0 must run `npm install @turf/turf` before any lib code.

3. **The coordinate flip is already handled in the store (line 98).** The stored `snappedPath`
   is `[lat, lon]` Leaflet order. `route-interpolator.ts` must flip back to `[lon, lat]` for turf.
   This is a known asymmetry in the codebase.

4. **The only async API pattern in the project is `fetchSnappedPath`.** The elevation client must
   follow that exact shape (fetch → ok check → json cast → throw on error).

5. **No classes anywhere.** All utilities should be exported functions, not class methods.

6. **Zustand store uses `useRouteStore.getState()` for reading state inside actions** (line 73).
   Copy this pattern for `generateActivity` to read the current `snappedPath` synchronously.

7. **`setConfig` pattern** (`store/useRouteStore.ts`, lines 68–70) allows partial updates:
   ```typescript
   setConfig: (config: Partial<RouteState>) => { set(config); },
   ```
   The new `generateActivity` action should call `set(...)` directly (not via `setConfig`) since
   it sets computed state, not user-configurable state.

---

## Metadata

**Analog search scope:** `/home/thangdm1/Documents/Projects/stravafakerun/` (all `.ts` and `.tsx` files)
**Files scanned:** 6 source files (excluding node_modules and .next)
**Pattern extraction date:** 2026-04-17
