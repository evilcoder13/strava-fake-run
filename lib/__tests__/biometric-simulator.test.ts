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

  it('increases HR on steep climb gradients (SIM-02)', () => {
    const flatHR = computeHR({ elapsedSeconds: 600, totalSeconds: 1800, paceSecPerKm: 330, gradient: 0 });
    const climbHR = computeHR({ elapsedSeconds: 600, totalSeconds: 1800, paceSecPerKm: 330, gradient: 0.1 }); // 10% grade
    expect(climbHR).toBeGreaterThan(flatHR);
    expect(climbHR - flatHR).toBeCloseTo(15, 0); // 150 factor * 0.1
  });

  it('drops HR during cool-down phase (SIM-04)', () => {
    const peakHR = computeHR({ elapsedSeconds: 1700, totalSeconds: 1800, paceSecPerKm: 330, progress: 0.94 });
    const endHR = computeHR({ elapsedSeconds: 1799, totalSeconds: 1800, paceSecPerKm: 330, progress: 0.999 });
    expect(endHR).toBeLessThan(peakHR);
    expect(endHR).toBeCloseTo(65, 0); // Should be near rest
  });
});

describe('computeCadence', () => {
  it('at 5:30/km (330 s/km) returns cadence in [165, 175] spm range', () => {
    const spm = computeCadence({ paceSecPerKm: 330 });
    expect(spm).toBeGreaterThanOrEqual(165);
    expect(spm).toBeLessThanOrEqual(175);
  });

  it('reduces cadence on steep climbs (SIM-01)', () => {
    // Only profile-based cadence currently implements SIM-01
    const { ActivityType } = require('../types/activity');
    const { SPORT_PROFILES } = require('../sport-profiles');
    const profile = SPORT_PROFILES[ActivityType.Running];
    
    const flatCadence = computeCadence({ paceSecPerKm: 330, profile, gradient: 0 });
    const climbCadence = computeCadence({ paceSecPerKm: 330, profile, gradient: 0.1 });
    // 200 factor * 0.1 = 20 drop
    expect(climbCadence).toBeLessThan(flatCadence);
    expect(flatCadence - climbCadence).toBeCloseTo(20, 0);
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
