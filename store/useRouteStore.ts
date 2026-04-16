import { create } from 'zustand';

export interface Waypoint {
  id: string;
  lat: number;
  lng: number;
}

interface RouteState {
  waypoints: Waypoint[];
  snappedPath: [number, number][];
  startDate: string;
  startTime: string;
  paceMinutes: number;
  paceSeconds: number;
  useNoise: boolean;
  addWaypoint: (lat: number, lng: number) => void;
  removeWaypoint: (id: string) => void;
  reorderWaypoints: (oldIndex: number, newIndex: number) => void;
  moveWaypoint: (id: string, lat: number, lng: number) => void;
  fetchSnappedPath: () => Promise<void>;
  setConfig: (config: Partial<RouteState>) => void;
}

export const useRouteStore = create<RouteState>((set) => ({
  waypoints: [],
  snappedPath: [],
  startDate: new Date().toISOString().split('T')[0],
  startTime: "08:00",
  paceMinutes: 5,
  paceSeconds: 30,
  useNoise: false,

  addWaypoint: (lat: number, lng: number) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 9);
    set((state) => {
      state.fetchSnappedPath();
      return { waypoints: [...state.waypoints, { id, lat, lng }] };
    });
  },

  removeWaypoint: (id: string) => {
    set((state) => {
      state.fetchSnappedPath();
      return { waypoints: state.waypoints.filter((wp) => wp.id !== id) };
    });
  },

  reorderWaypoints: (oldIndex: number, newIndex: number) => {
    set((state) => {
      const newWaypoints = [...state.waypoints];
      const [movedItem] = newWaypoints.splice(oldIndex, 1);
      newWaypoints.splice(newIndex, 0, movedItem);
      state.fetchSnappedPath();
      return { waypoints: newWaypoints };
    });
  },

  moveWaypoint: (id: string, lat: number, lng: number) => {
    set((state) => {
      state.fetchSnappedPath();
      return { waypoints: state.waypoints.map((wp) =>
        wp.id === id ? { ...wp, lat, lng } : wp
      )};
    });
  },

  setConfig: (config: Partial<RouteState>) => {
    set(config);
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
