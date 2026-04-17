---
phase: "05"
phase_slug: activity-type-system
nyquist_compliant: false
wave_0_complete: false
date: 2026-04-17
---

# Phase 05: Activity Type System — Nyquist Validation Plan

## Objectives

Verify that the Activity Type System correctly differentiates biometric profiles between sports, encodes Strava-compatible sport types in GPX/TCX exports, and provides a functional UI selector.

## Validation Strategies

1. **TypeScript Enum Export Verification**
   - **Risk**: `ActivityType` enum missing or not exported causes downstream import failures silently.
   - **Validation Step**: `grep "export enum ActivityType" lib/types/activity.ts` must return a match.

2. **Sport Profile Coverage Verification**
   - **Risk**: Missing sport entries in `SPORT_PROFILES` cause runtime undefined errors when a user selects an unmapped type.
   - **Validation Step**: `SPORT_PROFILES` must contain all 4 keys — verify with TypeScript compiler (Record<ActivityType, SportProfile> enforces exhaustiveness).

3. **GPX Sport Type Encoding**
   - **Risk**: Wrong or missing `<type>` XML element causes Strava to default to Running regardless of selection.
   - **Validation Step**: A generated GPX for Cycling type must contain `<type>cycling</type>` inside `<trk>`. Grep-verifiable in output string.

4. **TCX Sport Attribute Encoding**
   - **Risk**: Cycling uses `"Biking"` not `"Cycling"` in Strava TCX — wrong value causes wrong sport type on import.
   - **Validation Step**: A generated TCX for Cycling must contain `Sport="Biking"`. For Running: `Sport="Running"`.

5. **Biometric Range Differentiation**
   - **Risk**: If cadence/HR computation ignores the sport profile, Walking and Running produce identical outputs.
   - **Validation Step**: Walking cadence output must be in [100, 120] SPM range (not 150-180 of Running). HR for Walking must use HRR fraction 0.35-0.55 range.

6. **UI Selector Store Wiring**
   - **Risk**: UI dropdown changes state locally but `generateActivity` still uses hardcoded Running profile.
   - **Validation Step**: `store/useRouteStore.ts` must reference `activityType` state field in `generateActivity` call.

## Acceptance Criteria Checklist

- [ ] `lib/types/activity.ts` exports `ActivityType` enum with Running, Walking, Cycling, Hiking values.
- [ ] `lib/sport-profiles.ts` exports `SPORT_PROFILES: Record<ActivityType, SportProfile>` with all 4 entries.
- [ ] `lib/biometric-simulator.ts` accepts `SportProfile` parameter and uses it for cadence and HR ranges.
- [ ] `lib/export/gpx.ts` injects `<type>{gpxType}</type>` in the `<trk>` element.
- [ ] `lib/export/tcx.ts` sets `Sport="{tcxSport}"` on the `<Activity>` element.
- [ ] `store/useRouteStore.ts` has `activityType` state field (default: Running) and passes profile to generateActivity.
- [ ] `components/Sidebar.tsx` has activity type selector that updates the store.
- [ ] `npx tsc --noEmit` exits 0 (no TypeScript errors).
