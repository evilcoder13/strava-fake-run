# Phase 5: Activity Type System — Research

**Phase**: 05-activity-type-system
**Requirements**: ACT-01, ACT-02, ACT-03
**Researched**: 2026-04-17

---

## 1. Strava Sport Type Encoding

### GPX 1.1 — `<type>` inside `<trk>`

Strava reads the `<type>` element inside the `<trk>` block to determine activity type:

```xml
<trk>
  <name>My Activity</name>
  <type>running</type>   <!-- or: walking, cycling, hiking -->
  <trkseg>...</trkseg>
</trk>
```

| Activity | GPX `<type>` value |
|----------|--------------------|
| Running  | `running`          |
| Walking  | `walking`          |
| Cycling  | `cycling`          |
| Hiking   | `hiking`           |

### TCX (TrainingCenterDatabase) — `Sport` attribute on `<Activity>`

```xml
<Activity Sport="Running">   <!-- or: Walking, Biking, Hiking -->
  ...
</Activity>
```

| Activity | TCX `Sport` attribute |
|----------|-----------------------|
| Running  | `Running`             |
| Walking  | `Walking`             |
| Cycling  | `Biking`              |
| Hiking   | `Hiking`              |

> **Note**: Cycling in TCX uses `Biking`, not `Cycling`. This is the Garmin/Strava convention.

---

## 2. Biometric Profiles by Sport Type

### Karvonen Intensity Fractions (fraction of Heart Rate Reserve)

| Sport   | Min HRR | Max HRR | Typical Zone |
|---------|---------|---------|--------------|
| Running | 0.70    | 0.90    | Z3–Z4        |
| Walking | 0.35    | 0.55    | Z1–Z2        |
| Cycling | 0.55    | 0.80    | Z2–Z3        |
| Hiking  | 0.50    | 0.80    | Z2–Z3 (spikes on climbs) |

Current `computeHR` uses `paceToKarvonenFraction()` which is pace-dependent. For v1.1, the sport profile provides a base intensity range independent of pace (pace ranges differ per sport).

### Cadence Ranges

| Sport   | Min  | Max  | Unit  | Notes |
|---------|------|------|-------|-------|
| Running | 150  | 180  | SPM   | Steps Per Minute |
| Walking | 100  | 120  | SPM   | Steps Per Minute |
| Cycling | 70   | 100  | RPM   | Revolutions Per Minute |
| Hiking  | 90   | 110  | SPM   | Steps Per Minute, lower on steep grades |

### Pace / Speed Ranges

| Sport   | Slow end        | Fast end        | Unit   |
|---------|-----------------|-----------------|--------|
| Running | 7:00 min/km (420s) | 3:30 min/km (210s) | sec/km |
| Walking | 15:00 min/km (900s) | 10:00 min/km (600s) | sec/km |
| Cycling | 5:00 min/km (300s) | 1:30 min/km (90s) | sec/km (equiv) |
| Hiking  | 20:00 min/km (1200s) | 8:00 min/km (480s) | sec/km |

---

## 3. TypeScript Implementation Pattern

### ActivityType Enum

```typescript
// lib/types/activity.ts (extend existing)
export enum ActivityType {
  Running = 'Running',
  Walking = 'Walking',
  Cycling = 'Cycling',
  Hiking  = 'Hiking',
}
```

### SportProfile Interface

```typescript
export interface SportProfile {
  activityType: ActivityType;
  gpxType: string;        // value for GPX <type> element
  tcxSport: string;       // value for TCX Sport= attribute
  hrr: {
    min: number;          // min Karvonen HRR fraction
    max: number;          // max Karvonen HRR fraction
  };
  cadence: {
    min: number;
    max: number;
    unit: 'SPM' | 'RPM';
  };
  pace: {
    slowSec: number;      // slowest reasonable pace in sec/km
    fastSec: number;      // fastest reasonable pace in sec/km
  };
}
```

### Sport Profile Constant

```typescript
// lib/sport-profiles.ts (new file)
import { ActivityType, SportProfile } from './types/activity';

export const SPORT_PROFILES: Record<ActivityType, SportProfile> = {
  [ActivityType.Running]: {
    activityType: ActivityType.Running,
    gpxType: 'running',
    tcxSport: 'Running',
    hrr: { min: 0.70, max: 0.90 },
    cadence: { min: 150, max: 180, unit: 'SPM' },
    pace: { slowSec: 420, fastSec: 210 },
  },
  [ActivityType.Walking]: {
    activityType: ActivityType.Walking,
    gpxType: 'walking',
    tcxSport: 'Walking',
    hrr: { min: 0.35, max: 0.55 },
    cadence: { min: 100, max: 120, unit: 'SPM' },
    pace: { slowSec: 900, fastSec: 600 },
  },
  [ActivityType.Cycling]: {
    activityType: ActivityType.Cycling,
    gpxType: 'cycling',
    tcxSport: 'Biking',
    hrr: { min: 0.55, max: 0.80 },
    cadence: { min: 70, max: 100, unit: 'RPM' },
    pace: { slowSec: 300, fastSec: 90 },
  },
  [ActivityType.Hiking]: {
    activityType: ActivityType.Hiking,
    gpxType: 'hiking',
    tcxSport: 'Hiking',
    hrr: { min: 0.50, max: 0.80 },
    cadence: { min: 90, max: 110, unit: 'SPM' },
    pace: { slowSec: 1200, fastSec: 480 },
  },
};
```

---

## 4. Integration Points

| File | Change Needed |
|------|---------------|
| `lib/types/activity.ts` | Add `ActivityType` enum and `SportProfile` interface |
| `lib/sport-profiles.ts` | **New file** — `SPORT_PROFILES` constant record |
| `lib/biometric-simulator.ts` | Accept `SportProfile` param; derive cadence from `profile.cadence.{min,max}` instead of pure-pace linear model; derive HR intensity from `profile.hrr` |
| `store/useRouteStore.ts` | Add `activityType: ActivityType` to state (default `Running`); pass profile to `generateActivity` |
| `lib/export/gpx.ts` | Accept `activityType` and inject `<type>{gpxType}</type>` in `<trk>` |
| `lib/export/tcx.ts` | Accept `activityType` and set `Sport="{tcxSport}"` on `<Activity>` element |
| `components/Sidebar.tsx` | Add `<select>` for ActivityType; pass selection to store; display cadence unit label |

---

## 5. Validation Architecture

### Automated Checks

```bash
# TypeScript compiles without errors
npx tsc --noEmit

# ActivityType enum exported
grep "export enum ActivityType" lib/types/activity.ts

# SPORT_PROFILES keys = all 4 types
grep -E "Running|Walking|Cycling|Hiking" lib/sport-profiles.ts | wc -l  # expect >= 4

# GPX output contains <type> tag
grep "<type>running</type>" # in generated GPX for Running activity

# TCX output has Sport attribute
grep 'Sport="Running"'  # in generated TCX
grep 'Sport="Biking"'   # for Cycling
```

### Manual Smoke Tests

1. Select Cycling → generate → verify cadence values in 70–100 RPM range
2. Select Walking → generate → verify HR stays in 40–55% max HR range
3. Export Walking GPX → open in text editor → verify `<type>walking</type>` present
4. Export Cycling TCX → verify `Sport="Biking"` on `<Activity>` element
5. Upload Cycling TCX to Strava → verify it registers as a Ride (not a Run)

---

## RESEARCH COMPLETE

Documented Strava GPX/TCX sport type encoding, sport-specific biometric profile constants, TypeScript enum/profile pattern, and all integration points for Phase 5.
