import { create } from 'zustand';
import type { ActivityPoint } from '@/lib/types/activity';
import { ActivityType } from '@/lib/types/activity';
import { interpolatePath } from '@/lib/route-interpolator';
import { computeHR, computeCadence, gaussianRandom } from '@/lib/biometric-simulator';
import { fetchElevations } from '@/lib/elevation-simulator';
import { SPORT_PROFILES } from '@/lib/sport-profiles';

export interface Waypoint {
  id: string;
  lat: number;
  lng: number;
}

export function getLocalTimezoneOffsetString(): string {
  const offset = new Date().getTimezoneOffset(); // in minutes
  const sign = offset > 0 ? "-" : "+";
  const absOffset = Math.abs(offset);
  const hours = Math.floor(absOffset / 60).toString().padStart(2, "0");
  const minutes = (absOffset % 60).toString().padStart(2, "0");
  return `${sign}${hours}:${minutes}`;
}

// Data-only fields that callers are allowed to update via setConfig.
// Restricting to Pick prevents accidental overwrite of store action functions.
type RouteConfig = Pick<RouteState,
  'startDate' | 'startTime' | 'timezoneOffset' | 'paceMinutes' | 'paceSeconds' | 'useNoise' | 'useSpeedUnit' | 'activityType'
>;

export interface RouteState {
  waypoints: Waypoint[];
  snappedPath: [number, number][];
  startDate: string;
  startTime: string;
  timezoneOffset: string;
  paceMinutes: number;
  paceSeconds: number;
  useNoise: boolean;
  useSpeedUnit: boolean;
  activityType: ActivityType;
  setActivityType: (type: ActivityType) => void;
  addWaypoint: (lat: number, lng: number) => void;
  removeWaypoint: (id: string) => void;
  reorderWaypoints: (oldIndex: number, newIndex: number) => void;
  moveWaypoint: (id: string, lat: number, lng: number) => void;
  fetchSnappedPath: () => Promise<void>;
  setConfig: (config: Partial<RouteConfig>) => void;
  generatedActivity: ActivityPoint[] | null;
  isGenerating: boolean;
  generateActivity: () => Promise<void>;
  mapCenter: [number, number] | null;
  mapZoom: number | null;
  lastGeneratedAt: number | null;
  flyTo: (lat: number, lng: number, zoom?: number) => void;
  loadFromState: (partialState: Partial<RouteState>) => void;
}

export const useRouteStore = create<RouteState>((set) => ({
  waypoints: [],
  snappedPath: [],
  startDate: new Date().toISOString().split('T')[0],
  startTime: "08:00",
  timezoneOffset: getLocalTimezoneOffsetString(),
  paceMinutes: 5,
  paceSeconds: 30,
  useNoise: false,
  useSpeedUnit: false,
  activityType: ActivityType.Running,
  generatedActivity: null,
  isGenerating: false,
  mapCenter: null,
  mapZoom: null,
  lastGeneratedAt: null,

  flyTo: (lat: number, lng: number, zoom: number = 13) => {
    set({ mapCenter: [lat, lng], mapZoom: zoom });
    // Reset after a tick to allow re-triggering the same location if needed
    setTimeout(() => {
      set({ mapCenter: null, mapZoom: null });
    }, 100);
  },

  loadFromState: (partialState: Partial<RouteState>) => {
    set((state) => ({ ...state, ...partialState }));
  },

  addWaypoint: (lat: number, lng: number) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 9);
    set((state) => ({ waypoints: [...state.waypoints, { id, lat, lng }] }));
    // fetchSnappedPath reads getState() — call after set() commits the new waypoints
    useRouteStore.getState().fetchSnappedPath();
  },

  removeWaypoint: (id: string) => {
    set((state) => ({ waypoints: state.waypoints.filter((wp) => wp.id !== id) }));
    // fetchSnappedPath reads getState() — call after set() commits the removal
    useRouteStore.getState().fetchSnappedPath();
  },

  reorderWaypoints: (oldIndex: number, newIndex: number) => {
    set((state) => {
      const newWaypoints = [...state.waypoints];
      const [movedItem] = newWaypoints.splice(oldIndex, 1);
      newWaypoints.splice(newIndex, 0, movedItem);
      return { waypoints: newWaypoints };
    });
    // fetchSnappedPath reads getState() — call after set() commits the reorder
    useRouteStore.getState().fetchSnappedPath();
  },

  moveWaypoint: (id: string, lat: number, lng: number) => {
    set((state) => ({
      waypoints: state.waypoints.map((wp) =>
        wp.id === id ? { ...wp, lat, lng } : wp
      ),
    }));
    // fetchSnappedPath reads getState() — call after set() commits the move
    useRouteStore.getState().fetchSnappedPath();
  },

  setConfig: (config: Partial<RouteConfig>) => {
    set(config);
  },

  setActivityType: (type: ActivityType) => {
    set({ activityType: type });
  },

  generateActivity: async () => {
    const state = useRouteStore.getState();
    if (state.snappedPath.length < 2) return;
    set({ isGenerating: true });
    try {
      // Step 1: Temporal interpolation (CFG-04)
      const points = interpolatePath({
        snappedPath: state.snappedPath,
        startDate: state.startDate,
        startTime: state.startTime,
        timezoneOffset: state.timezoneOffset,
        paceMinutes: state.paceMinutes,
        paceSeconds: state.paceSeconds,
        useNoise: state.useNoise,
        intervalSeconds: 10,
      });

      if (points.length === 0) {
        set({ isGenerating: false });
        return;
      }

      // Step 2: Elevation fetch (BIO-03)
      // Fallback to 0m elevation if API fails — Strava accepts 0-elevation tracks
      let elevations: number[];
      try {
        elevations = await fetchElevations(points.map(p => ({ lat: p.lat, lon: p.lon })));
      } catch (elevErr) {
        console.error('Elevation fetch failed, defaulting to 0m:', elevErr);
        elevations = new Array(points.length).fill(0);
      }

      // Step 3: HR + Cadence (BIO-01, BIO-02) — sport-profile-aware (v1.1)
      const paceSecPerKm = state.paceMinutes * 60 + state.paceSeconds;
      const totalSeconds = points[points.length - 1].elapsedSeconds;
      const sportProfile = SPORT_PROFILES[state.activityType];

      const activity: ActivityPoint[] = points.map((p, i) => {
        // Calculate gradient (SIM-01, SIM-02)
        let gradient = 0;
        if (i > 0) {
          const elevDiff = (elevations[i] ?? 0) - (elevations[i - 1] ?? 0);
          const distDiffKm = p.distFromStartKm - points[i - 1].distFromStartKm;
          if (distDiffKm > 0) {
            gradient = (elevDiff / 1000) / distDiffKm; // grade = (delta_elevation_km / delta_distance_km)
          }
        }

        const progress = i / (points.length - 1);

        // GPS noise (SIM-03)
        // 0.00001 degrees is ~1.1 meters. stdDev=1.0 puts 68% points within 1m.
        let finalLat = p.lat;
        let finalLon = p.lon;
        if (state.useNoise) {
          finalLat = gaussianRandom(p.lat, 0.00001);
          finalLon = gaussianRandom(p.lon, 0.00001);
        }

        // Calculate instant pace (SIM-04 / Realism)
        // 1.0 factor: 10% grade adds 1.0 min/km to pace
        const paceBase = state.paceMinutes + state.paceSeconds / 60;
        const paceAdjusted = paceBase + Math.max(0, gradient * 10);

        return {
          lat: finalLat,
          lon: finalLon,
          timestamp: p.timestamp,
          distFromStartKm: p.distFromStartKm,
          paceMinKm: paceAdjusted,
          heartRate: computeHR({
            elapsedSeconds: p.elapsedSeconds,
            totalSeconds,
            paceSecPerKm,
            addNoise: state.useNoise,
            profile: sportProfile,
            gradient,
            progress,
          }),
          cadence: computeCadence({
            paceSecPerKm,
            addNoise: state.useNoise,
            profile: sportProfile,
            gradient,
          }),
          elevation: elevations[i] ?? 0,
        };
      });

      set({ generatedActivity: activity, isGenerating: false, lastGeneratedAt: Date.now() });
    } catch (error) {
      console.error('Failed to generate activity:', error);
      set({ isGenerating: false });
    }
  },

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
}));
