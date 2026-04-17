import { RouteState } from "@/store/useRouteStore";

interface SerializedState {
  w: [number, number][]; // waypoints (lat, lng)
  a: string; // activityType
  sd: string; // startDate
  st: string; // startTime
  tz: string; // timezoneOffset
  pm: number; // paceMinutes
  ps: number; // paceSeconds
  n: boolean; // useNoise
  u: boolean; // useSpeedUnit
}

export function encodeState(state: RouteState): string {
  const data: SerializedState = {
    w: state.waypoints.map((w) => [w.lat, w.lng]),
    a: state.activityType,
    sd: state.startDate,
    st: state.startTime,
    tz: state.timezoneOffset,
    pm: state.paceMinutes,
    ps: state.paceSeconds,
    n: state.useNoise,
    u: state.useSpeedUnit,
  };

  try {
    const json = JSON.stringify(data);
    // Use btoa safely for unicode
    const utf8Bytes = new TextEncoder().encode(json);
    let binary = "";
    utf8Bytes.forEach(b => binary += String.fromCharCode(b));
    return btoa(binary);
  } catch (e) {
    console.error("Failed to encode state", e);
    return "";
  }
}

export function decodeState(base64: string): Partial<RouteState> | null {
  try {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const json = new TextDecoder().decode(bytes);
    const data = JSON.parse(json) as SerializedState;

    if (!data.w || !Array.isArray(data.w)) return null;

    return {
      waypoints: data.w.map((coords, i) => ({
        id: `wp-${i}-${Date.now()}`,
        lat: coords[0],
        lng: coords[1],
      })),
      activityType: data.a as any,
      startDate: data.sd,
      startTime: data.st,
      timezoneOffset: data.tz,
      paceMinutes: data.pm,
      paceSeconds: data.ps,
      useNoise: data.n,
      useSpeedUnit: data.u,
    };
  } catch (e) {
    console.error("Failed to decode state", e);
    return null;
  }
}
