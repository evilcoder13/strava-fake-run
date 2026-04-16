import { create } from 'zustand';

export interface Waypoint {
  id: string;
  lat: number;
  lng: number;
}

interface RouteState {
  waypoints: Waypoint[];
  addWaypoint: (lat: number, lng: number) => void;
  removeWaypoint: (id: string) => void;
  reorderWaypoints: (oldIndex: number, newIndex: number) => void;
  moveWaypoint: (id: string, lat: number, lng: number) => void;
}

export const useRouteStore = create<RouteState>((set) => ({
  waypoints: [],
  
  addWaypoint: (lat: number, lng: number) => set((state) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 9);
    return {
      waypoints: [...state.waypoints, { id, lat, lng }],
    };
  }),
  
  removeWaypoint: (id: string) => set((state) => ({
    waypoints: state.waypoints.filter((wp) => wp.id !== id),
  })),
  
  reorderWaypoints: (oldIndex: number, newIndex: number) => set((state) => {
    const newWaypoints = [...state.waypoints];
    const [movedItem] = newWaypoints.splice(oldIndex, 1);
    newWaypoints.splice(newIndex, 0, movedItem);
    return { waypoints: newWaypoints };
  }),
  
  moveWaypoint: (id: string, lat: number, lng: number) => set((state) => ({
    waypoints: state.waypoints.map((wp) => 
      wp.id === id ? { ...wp, lat, lng } : wp
    ),
  })),
}));
