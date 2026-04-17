// lib/sport-profiles.ts
// Per-sport biometric profile constants used by biometric-simulator.ts and export layer.
// All numeric values sourced from exercise physiology literature.
// [ASSUMED] markers indicate values that are reasonable but not clinically precise.

import { ActivityType } from './types/activity';
import type { SportProfile } from './types/activity';

export const SPORT_PROFILES: Record<ActivityType, SportProfile> = {
  [ActivityType.Running]: {
    activityType: ActivityType.Running,
    gpxType: 'running',
    tcxSport: 'Running',
    hrr: { min: 0.70, max: 0.90 },           // Z3–Z4 [ASSUMED]
    cadence: { min: 150, max: 180, unit: 'SPM' }, // Published running cadence range
    pace: { slowSec: 420, fastSec: 210 },     // 7:00–3:30 min/km
  },
  [ActivityType.Walking]: {
    activityType: ActivityType.Walking,
    gpxType: 'walking',
    tcxSport: 'Walking',
    hrr: { min: 0.35, max: 0.55 },           // Z1–Z2 [ASSUMED]
    cadence: { min: 100, max: 120, unit: 'SPM' }, // Brisk walking range [ASSUMED]
    pace: { slowSec: 900, fastSec: 600 },     // 15:00–10:00 min/km
  },
  [ActivityType.Cycling]: {
    activityType: ActivityType.Cycling,
    gpxType: 'cycling',
    tcxSport: 'Biking',                        // Strava/Garmin TCX uses "Biking"
    hrr: { min: 0.55, max: 0.80 },           // Z2–Z3 [ASSUMED]
    cadence: { min: 70, max: 100, unit: 'RPM' }, // Standard cycling cadence
    pace: { slowSec: 300, fastSec: 90 },      // ~20–66 km/h equivalent
  },
  [ActivityType.Hiking]: {
    activityType: ActivityType.Hiking,
    gpxType: 'hiking',
    tcxSport: 'Hiking',
    hrr: { min: 0.50, max: 0.80 },           // Z2–Z3 (spikes on climbs) [ASSUMED]
    cadence: { min: 90, max: 110, unit: 'SPM' }, // Slower than running, terrain-dependent [ASSUMED]
    pace: { slowSec: 1200, fastSec: 480 },    // 20:00–8:00 min/km
  },
};
