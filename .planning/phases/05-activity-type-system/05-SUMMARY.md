# Phase 5 Summary: Activity Type System

Phase 5 successfully introduced an extensible activity type system, allowing users to select between Running, Walking, Cycling, and Hiking.

## Accomplishments

- **Activity Type Contract**: Defined `ActivityType` enum and `SportProfile` interfaces in `lib/types/activity.ts`.
- **Predefined Sport Profiles**: Created `lib/sport-profiles.ts` containing physiological data for each sport (HRR target zones, cadence ranges, and typical pace bounds).
- **Adaptive Biometric Simulation**: Updated `lib/biometric-simulator.ts` to use sport-specific parameters. Cycling now generates cadence in RPM (70-100), while Walking generates light effort HR (Z1-Z2).
- **Zustand Store Integration**: Added `activityType` state and `setActivityType` action to `store/useRouteStore.ts`.
- **Sport-Aware Exports**:
    - **GPX**: Now injects `<type>` element containing `running`, `walking`, `cycling`, or `hiking`.
    - **TCX**: Now sets the `Sport` attribute on the `<Activity>` element. Notably, Cycling uses `Biking` per Strava/Garmin standards.
- **UI Interaction**: Implemented a 2x2 segmented control in `Sidebar.tsx` utilizing Lucide icons (`Footprints`, `PersonStanding`, `Bike`, `Mountain`) and Strava orange branding for active states.

## Verification Results

- **TSC**: Passed (`npx tsc --noEmit`).
- **Biometric Logic**: Verified that `computeHR` and `computeCadence` correctly fall back to legacy behavior for existing tests while utilizing profiles for new logic.
- **Export Schema**: Manually verified that export functions correctly map internal `ActivityType` to their respective XML standards.

## Next Up

Phase 6 will focus on **Configuration UX**, introducing timezone (GMT) management and a pace unit toggle (min/km ↔ km/h).
