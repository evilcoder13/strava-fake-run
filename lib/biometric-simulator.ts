// lib/biometric-simulator.ts
// Karvonen HR model with exponential warmup and linear pace-to-cadence.
// Defaults for restHR/maxHR are labeled [ASSUMED] — reasonable recreational runner baseline.

import type { SportProfile } from './types/activity';

// Box-Muller transform — noise utility
export function gaussianRandom(mean: number, stdDev: number): number {
  let u1: number, u2: number;
  do { u1 = Math.random(); } while (u1 === 0);
  do { u2 = Math.random(); } while (u2 === 0);
  const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  return mean + z0 * stdDev;
}

// Maps pace to Karvonen heart rate reserve fraction
// Zones are standard physiology approximations [ASSUMED]
function paceToKarvonenFraction(paceSecPerKm: number): number {
  if (paceSecPerKm < 270) return 0.85;   // sub-4:30/km → Z4/Z5
  if (paceSecPerKm <= 330) return 0.75;  // 4:30–5:30/km → Z3 (inclusive of 5:30)
  if (paceSecPerKm < 390) return 0.65;   // 5:30–6:30/km → Z2
  return 0.55;                           // 6:30+/km → Z1
}

export function computeHR(params: {
  elapsedSeconds: number;
  totalSeconds: number;
  paceSecPerKm: number;
  restHR?: number;    // [ASSUMED default: 65 bpm — typical recreational runner]
  maxHR?: number;     // [ASSUMED default: 185 bpm — 220 - 35yr age formula]
  addNoise?: boolean;
  profile?: SportProfile;   // When provided, overrides paceToKarvonenFraction with profile.hrr
  gradient?: number;        // delta_elevation / delta_distance_meters
  progress?: number;        // 0.0 to 1.0 (elapsedSeconds / totalSeconds)
}): number {
  const { elapsedSeconds, totalSeconds, paceSecPerKm } = params;
  const restHR = params.restHR ?? 65;
  const maxHR = params.maxHR ?? 185;

  const hrr = maxHR - restHR;                           // Heart rate reserve
  // When a sport profile is provided, use its HRR midpoint as the intensity fraction.
  // This ensures Walking never feels like Running regardless of pace input.
  const fraction = params.profile
    ? (params.profile.hrr.min + params.profile.hrr.max) / 2
    : paceToKarvonenFraction(paceSecPerKm);
  const steadyHR = restHR + fraction * hrr;

  // Exponential warmup: tau=120s [ASSUMED — typical recreational runner warmup rate]
  const warmupFactor = 1 - Math.exp(-elapsedSeconds / 120);
  const baseHR = restHR + (steadyHR - restHR) * warmupFactor;

  // Cardiac drift: creeps ~5 bpm over the full run duration [ASSUMED]
  // Guard against totalSeconds === 0 (single-point route) to prevent NaN
  const drift = totalSeconds > 0 ? (elapsedSeconds / totalSeconds) * 5 : 0;

  const raw = baseHR + drift;
  
  // Apply Cool-down ramp (last 5% of activity)
  const progress = params.progress ?? 0;
  const coolDownFactor = progress > 0.95 ? (1 - progress) / 0.05 : 1.0;
  const finalSteady = restHR + (raw - restHR) * coolDownFactor;

  // Apply Gradient bonus (SIM-02)
  // factor 150 means 10% grade (0.1) adds 15 bpm
  const gradient = params.gradient ?? 0;
  const climbBonus = Math.max(0, gradient * 150);

  const finalHR = finalSteady + climbBonus;
  return Math.round(params.addNoise ? gaussianRandom(finalHR, 3) : finalHR);
}

export function computeCadence(params: {
  paceSecPerKm: number;
  addNoise?: boolean;
  profile?: SportProfile;   // When provided, cadence drawn from profile.cadence range
  gradient?: number;
}): number {
  // When a sport profile is provided, use its cadence range (midpoint + noise)
  if (params.profile) {
    const { min, max } = params.profile.cadence;
    const mid = (min + max) / 2;
    // Apply Gradient response (SIM-01)
    // uphill (positive gradient) drops cadence; downhill rises it
    // 200 factor means 10% grade (0.1) drops cadence by 20
    const gradient = params.gradient ?? 0;
    const adjustedMid = mid - (gradient * 200);
    return Math.round(params.addNoise ? gaussianRandom(adjustedMid, (max - min) / 6) : adjustedMid);
  }

  // Legacy running-only linear model (kept for backwards compatibility)
  // Linear model: 4:00/km (240s) → 180 spm; 7:00/km (420s) → 158 spm [ASSUMED — published range]
  const pace4Min = 240;
  const pace7Min = 420;
  const spmAt4Min = 180;
  const spmAt7Min = 158;
  const clamped = Math.min(Math.max(params.paceSecPerKm, pace4Min), pace7Min);
  const fraction = (clamped - pace4Min) / (pace7Min - pace4Min);
  const baseSpm = Math.round(spmAt4Min + fraction * (spmAt7Min - spmAt4Min));
  return Math.round(params.addNoise ? gaussianRandom(baseSpm, 2) : baseSpm);
}
