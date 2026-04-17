import { describe, it, expect } from 'vitest';
import { computeHR, computeCadence } from '@/lib/biometric-simulator';

describe('computeHR', () => {
  it('at t=0 returns a value close to restHR (warmup not yet started)', () => {
    const hr = computeHR({ elapsedSeconds: 0, totalSeconds: 1800, paceSecPerKm: 330, restHR: 65, maxHR: 185 });
    // At t=0 warmupFactor=0, so baseHR=restHR, drift=0 → should be restHR
    expect(hr).toBe(65);
  });

  it('at t=totalSeconds returns a value near steadyHR + 5 drift', () => {
    const hr = computeHR({ elapsedSeconds: 1800, totalSeconds: 1800, paceSecPerKm: 330, restHR: 65, maxHR: 185 });
    // Z3 fraction=0.75, hrr=120, steadyHR=65+0.75*120=155, drift=5 → ~160 bpm
    expect(hr).toBeGreaterThanOrEqual(150);
    expect(hr).toBeLessThanOrEqual(170);
  });

  it('returns integer values', () => {
    const hr = computeHR({ elapsedSeconds: 600, totalSeconds: 1800, paceSecPerKm: 330 });
    expect(Number.isInteger(hr)).toBe(true);
  });
});

describe('computeCadence', () => {
  it('at 5:30/km (330 s/km) returns cadence in [165, 175] spm range', () => {
    const spm = computeCadence({ paceSecPerKm: 330 });
    expect(spm).toBeGreaterThanOrEqual(165);
    expect(spm).toBeLessThanOrEqual(175);
  });

  it('at 4:00/km (240 s/km) returns ~180 spm', () => {
    const spm = computeCadence({ paceSecPerKm: 240 });
    expect(spm).toBe(180);
  });

  it('at 7:00/km (420 s/km) returns ~158 spm', () => {
    const spm = computeCadence({ paceSecPerKm: 420 });
    expect(spm).toBe(158);
  });

  it('returns integer values', () => {
    const spm = computeCadence({ paceSecPerKm: 300 });
    expect(Number.isInteger(spm)).toBe(true);
  });
});
