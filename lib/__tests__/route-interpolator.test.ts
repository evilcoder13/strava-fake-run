import { describe, it, expect } from 'vitest';
import { interpolatePath } from '@/lib/route-interpolator';

describe('interpolatePath', () => {
  it('returns empty array when snappedPath has fewer than 2 points', () => {
    const result = interpolatePath({
      snappedPath: [],
      startDate: '2024-01-15',
      startTime: '08:00',
      paceMinutes: 5,
      paceSeconds: 30,
      useNoise: false,
    });
    expect(result).toEqual([]);
  });

  it('returns expected point count for a short known route at 10s intervals', () => {
    // ~556m straight line: Eiffel Tower to nearby point
    const snappedPath: [number, number][] = [
      [48.8584, 2.2945],
      [48.8584, 2.3005],
    ];
    const result = interpolatePath({
      snappedPath,
      startDate: '2024-01-15',
      startTime: '08:00',
      paceMinutes: 5,
      paceSeconds: 30,
      useNoise: false,
      intervalSeconds: 10,
    });
    // 330 sec/km pace, ~0.5 km → ~16.5 steps → expect 15-18 points
    expect(result.length).toBeGreaterThan(10);
    expect(result.length).toBeLessThan(25);
  });

  it('timestamps advance by intervalSeconds per point', () => {
    const snappedPath: [number, number][] = [
      [48.8584, 2.2945],
      [48.8584, 2.3005],
    ];
    const result = interpolatePath({
      snappedPath,
      startDate: '2024-01-15',
      startTime: '08:00',
      paceMinutes: 5,
      paceSeconds: 30,
      useNoise: false,
      intervalSeconds: 10,
    });
    expect(result.length).toBeGreaterThan(1);
    const t0 = new Date(result[0].timestamp).getTime();
    const t1 = new Date(result[1].timestamp).getTime();
    expect(t1 - t0).toBe(10_000);
  });

  it('useNoise=true produces at least one interval different from deterministic pace', () => {
    const snappedPath: [number, number][] = [
      [48.8584, 2.2945],
      [48.8584, 2.3005],
    ];
    const noiseResult = interpolatePath({
      snappedPath,
      startDate: '2024-01-15',
      startTime: '08:00',
      paceMinutes: 5,
      paceSeconds: 30,
      useNoise: true,
      intervalSeconds: 10,
    });
    const deterministicResult = interpolatePath({
      snappedPath,
      startDate: '2024-01-15',
      startTime: '08:00',
      paceMinutes: 5,
      paceSeconds: 30,
      useNoise: false,
      intervalSeconds: 10,
    });
    // With noise, cumulative distances will differ from no-noise at some point
    // Point count may also differ. Either condition satisfies the test.
    const noisyDists = noiseResult.map(p => p.distFromStartKm);
    const deterministicDists = deterministicResult.map(p => p.distFromStartKm);
    const allSame = noisyDists.every((d, i) => deterministicDists[i] !== undefined && Math.abs(d - deterministicDists[i]) < 0.0001);
    expect(allSame).toBe(false);
  });

  it('output coordinates are in valid WGS84 range', () => {
    const snappedPath: [number, number][] = [
      [48.8584, 2.2945],
      [48.8584, 2.3005],
    ];
    const result = interpolatePath({
      snappedPath,
      startDate: '2024-01-15',
      startTime: '08:00',
      paceMinutes: 5,
      paceSeconds: 30,
      useNoise: false,
    });
    result.forEach(p => {
      expect(p.lat).toBeGreaterThan(-90);
      expect(p.lat).toBeLessThan(90);
      expect(p.lon).toBeGreaterThan(-180);
      expect(p.lon).toBeLessThan(180);
    });
  });
});
