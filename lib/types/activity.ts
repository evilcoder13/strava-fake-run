// lib/types/activity.ts
// Phase 3 → Phase 4 boundary contract. Do NOT rename fields without updating Phase 4 plans.

export interface ActivityPoint {
  lat: number;               // WGS84 latitude
  lon: number;               // WGS84 longitude
  timestamp: string;         // ISO 8601 UTC e.g. "2024-01-15T08:00:10.000Z"
  heartRate: number;         // bpm integer
  cadence: number;           // steps per minute (spm, both feet) integer
  elevation: number;         // meters above sea level
  distFromStartKm: number;   // cumulative distance from route start in km
}

export interface InterpolatedPoint {
  lat: number;
  lon: number;
  timestamp: string;         // ISO 8601 UTC
  distFromStartKm: number;   // cumulative km from route start
  elapsedSeconds: number;    // seconds since activity start
}

export interface InterpolateOptions {
  snappedPath: [number, number][];  // [lat, lon] Leaflet format — MUST flip to [lon, lat] for turf
  startDate: string;                // "YYYY-MM-DD"
  startTime: string;                // "HH:MM"
  paceMinutes: number;
  paceSeconds: number;
  useNoise: boolean;
  intervalSeconds?: number;         // Default: 10 seconds
}

// Activity type enum (v1.1)
export enum ActivityType {
  Running = 'Running',
  Walking = 'Walking',
  Cycling = 'Cycling',
  Hiking  = 'Hiking',
}

// Per-sport biometric profile
export interface SportProfile {
  activityType: ActivityType;
  gpxType: string;        // value for GPX <type> element — lowercase
  tcxSport: string;       // value for TCX Sport= attribute — Strava convention
  hrr: {
    min: number;          // minimum Karvonen HRR fraction
    max: number;          // maximum Karvonen HRR fraction
  };
  cadence: {
    min: number;          // minimum cadence in native unit
    max: number;          // maximum cadence in native unit
    unit: 'SPM' | 'RPM';  // Steps Per Minute or Revolutions Per Minute
  };
  pace: {
    slowSec: number;      // slowest reasonable pace in sec/km equivalent
    fastSec: number;      // fastest reasonable pace in sec/km equivalent
  };
}
