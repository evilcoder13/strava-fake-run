import { create } from 'zustand';
import { get } from 'zustand/middleware';

export interface Waypoint {
  id: string;
  lat: number;
  lng: number;
}

interface RouteState {
  waypoints: Waypoint[];
  snappedPath: [number, number][];
  addWaypoint: (lat: number, lng: number) => void;
  removeWaypoint: (id: string) => void;
  reorderWaypoints: (oldIndex: number, newIndex: number) => void;
  moveWaypoint: (id: string, lat: number, lng: number) => void;
  fetchSnappedPath: () => Promise<void>;
}

export const useRouteStore = create<RouteState>((set) => ({
  waypoints: [],
  snappedPath: [],
  
  addWaypoint: (lat: number, lng: number) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 9);
    get().fetchSnappedPath();
    return {
      waypoints: [...get().waypoints, { id, lat, lng }],
    };
  },
  
  removeWaypoint: (id: string) => {
    set((state) => ({
      waypoints: state.waypoints.filter((wp) => wp.id !== id),
    }));
    get().fetchSnappedPath();
  },
  
  reorderWaypoints: (oldIndex: number, newIndex: number) => {
    set((state) => {
      const newWaypoints = [...state.waypoints];
      const [movedItem] = newWaypoints.splice(oldIndex, 1);
      newWaypoints.splice(newIndex, 0, movedItem);
      return { waypoints: newWaypoints };
    });
    get().fetchSnappedPath();
  },
  
  moveWaypoint: (id: string, lat: number, lng: number) => {
    set((state) => ({
      waypoints: state.waypoints.map((wp) =>
        wp.id === id ? { ...wp, lat, lng } : wp
      ),
    }));
    get().fetchSnappedPath();
  },

  fetchSnappedPath: async () => {
    const waypoints = get().waypoints;

    if (waypoints.length < 2) {
      set({ snappedPath: [] });
      return;
    }

    try {
      const waypointsString = waypoints
        .map((wp) => `${wp.lng},${wp.lat}`)
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
        set({ snappedPath: waypoints.map((wp) => [wp.lat, wp.lng]) });
      }
    } catch (error) {
      console.error('Failed to fetch snapped path:', error);
      set({ snappedPath: waypoints.map((wp) => [wp.lat, wp.lng]) });
    }
  },
}));
