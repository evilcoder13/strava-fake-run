// lib/route-interpolator.ts
import { lineString, along, length } from '@turf/turf';
import type { InterpolateOptions, InterpolatedPoint } from '@/lib/types/activity';

// Box-Muller transform — produces normally distributed values
// Not exported: internal noise utility only
function gaussianRandom(mean: number, stdDev: number): number {
  let u1: number, u2: number;
  do { u1 = Math.random(); } while (u1 === 0);
  do { u2 = Math.random(); } while (u2 === 0);
  const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  return mean + z0 * stdDev;
}

export function interpolatePath(opts: InterpolateOptions): InterpolatedPoint[] {
  const { snappedPath, startDate, startTime, paceMinutes, paceSeconds, useNoise } = opts;
  const intervalSec = opts.intervalSeconds ?? 10;

  // Guard: need at least 2 points to form a line
  if (snappedPath.length < 2) return [];

  // CRITICAL: snappedPath is [lat, lon] (Leaflet) — flip to [lon, lat] for GeoJSON/turf
  // This mirrors the inverse of store/useRouteStore.ts line 98 which flips OSRM [lon,lat] → [lat,lon]
  const coords = snappedPath.map(([lat, lon]: [number, number]) => [lon, lat]);
  const line = lineString(coords);
  const totalKm = length(line, { units: 'kilometers' });

  const paceSecPerKm = paceMinutes * 60 + paceSeconds;
  // Normalize startTime to "HH:MM" — browsers with seconds enabled return "HH:MM:SS",
  // which would produce an invalid ISO string like "2024-01-15T08:00:30:00.000Z".
  const normalizedTime = startTime.substring(0, 5);
  // Parse startTime as UTC to avoid local timezone offset issues
  const startMs = new Date(`${startDate}T${normalizedTime}:00.000Z`).getTime();
  if (isNaN(startMs)) throw new Error(`Invalid startDate/startTime: ${startDate} ${startTime}`);

  const points: InterpolatedPoint[] = [];
  let cumDistKm = 0;
  let cumSeconds = 0;

  while (cumDistKm < totalKm) {
    // Guard against along() being called past the line end (produces duplicate final coord)
    if (cumDistKm >= totalKm) break;

    const pt = along(line, cumDistKm, { units: 'kilometers' });
    const [lon, lat] = pt.geometry.coordinates;

    points.push({
      lat,
      lon,
      timestamp: new Date(startMs + cumSeconds * 1000).toISOString(),
      distFromStartKm: cumDistKm,
      elapsedSeconds: cumSeconds,
    });

    // Apply pace noise only when useNoise is true
    // Clamp: pace cannot be more than 30% faster than target (prevents NaN/Infinity)
    const noisyPace = useNoise
      ? Math.max(paceSecPerKm * 0.70, gaussianRandom(paceSecPerKm, paceSecPerKm * 0.05))
      : paceSecPerKm;

    cumDistKm += intervalSec / noisyPace;
    cumSeconds += intervalSec;
  }

  return points;
}
