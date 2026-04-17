# Roadmap: StravaFakeRun

## Milestones

- ✅ **v1.0 MVP** — Phases 1-4 (shipped 2026-04-17)
- ✅ **v1.1 Realism & Activity Types** — Phases 5-8 (shipped 2026-04-17)

## Phases

<details>
<summary>✅ v1.0 MVP (Phases 1-4) — SHIPPED 2026-04-17</summary>

- [x] Phase 1: Project Setup & Core Map (3/3 plans) — completed 2026-04-16
- [x] Phase 2: UI Controls & Road Snapping (2/2 plans) — completed 2026-04-16
- [x] Phase 3: Route Interpolator Brain (2/2 plans) — completed 2026-04-17
- [x] Phase 4: Export Engine (2/2 plans) — completed 2026-04-17

</details>

### 🚧 v1.1 Realism & Activity Types (In Progress)

- [x] **Phase 5: Activity Type System** — Sport selector with per-type biometric profiles and Strava sport encoding
- [x] **Phase 7: Enhanced Simulation** — Gradient-responsive cadence/HR, GPS noise, warm-up/cool-down curves
- [ ] **Phase 8: Data Preview Charts** — Pace and HR charts rendered before export
- [x] **Phase 8: Data Preview Charts** — Pace and HR charts rendered before export

## Phase Details

### Phase 5: Activity Type System
  - **Goal**: Let users choose Running, Walking, Cycling, or Hiking — each with biometric profiles tuned to that sport.
  - **Depends on**: Phase 4
  - **Requirements**: ACT-01, ACT-02, ACT-03
  - **Success Criteria**:
    1. User can select activity type from a dropdown or selector in the sidebar.
    2. Generated biometrics (HR zones, cadence range, pace range) differ meaningfully between activity types.
    3. Exported GPX/TCX encodes the correct Strava sport type string for the selected activity.
  - **Plans**: 2 plans — [See detail](.planning/phases/05-activity-type-system/)
  - **Status**: COMPLETE ✓

Plans:
- [x] 05-01: Add ActivityType enum, per-type biometric profile config, and update biometric-simulator
- [x] 05-02: Update UI selector and wire activity type through export layer (GPX/TCX sport tags)

### Phase 6: Configuration UX
**Goal**: Users can pick GMT timezone and toggle pace units — UI preferences that propagate correctly through to exports.
**Depends on**: Phase 2
**Requirements**: CFG-05, CFG-06, CFG-07
**Success Criteria** (what must be TRUE):
  1. Timezone dropdown defaults to browser local timezone; selection updates the exported timestamp UTC offset.
  2. Pace input switches between min/km and km/h with live value conversion on toggle.
  3. Exported timestamps are in ISO 8601 with correct +HH:MM offset matching selected timezone.
**Plans**: 2 plans

Plans:
- [ ] 06-01: Timezone selector — store UTC offset, apply to timestamp generation in route-interpolator
- [ ] 06-02: Pace unit toggle — checkbox state in store, live conversion in Sidebar, update generateActivity pace arg

### Phase 7: Enhanced Simulation
**Goal**: Make generated activities look human — gradient-responsive cadence/HR, GPS noise, warm-up/cool-down ramps.
**Depends on**: Phase 3, Phase 5
**Requirements**: SIM-01, SIM-02, SIM-03, SIM-04
**Success Criteria** (what must be TRUE):
  1. Cadence values drop noticeably on steep uphill segments and rise on downhills.
  2. Heart rate shows a visible spike when route gradient exceeds a threshold.
  3. GPS trackpoints show slight jitter (no two consecutive points are on perfectly straight lines outside of a road).
  4. First 5% and last 5% of activity show HR and pace ramping up/down from/to resting values.
**Plans**: 2 plans

Plans:
- [x] 07-01: Gradient-aware cadence and HR modifiers; warm-up/cool-down ramp logic in biometric-simulator
- [x] 07-02: GPS noise layer — apply Gaussian coordinate perturbation to each ActivityPoint

### Phase 8: Data Preview Charts
**Goal**: Show user a pace and HR chart after generation so they can review before downloading.
**Depends on**: Phase 3, Phase 7
**Requirements**: VIZ-01, VIZ-02
**Success Criteria** (what must be TRUE):
  1. After clicking "Generate Activity", pace-over-distance chart renders in the sidebar or a panel.
  2. Heart-rate-over-distance chart renders alongside or below the pace chart.
  3. Charts are responsive and legible at typical sidebar widths.
**Plans**: 2 plans

Plans:
- [x] 08-01: Install charting library (Recharts or Chart.js) and implement PaceChart component
- [x] 08-02: Implement HRChart component and wire both charts to generatedActivity store slice

## Progress

**Execution Order:** 5 → 6 → 7 → 8 (6 can run in parallel with 5)

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Project Setup & Core Map | v1.0 | 3/3 | Complete | 2026-04-16 |
| 2. UI Controls & Road Snapping | v1.0 | 2/2 | Complete | 2026-04-16 |
| 3. Route Interpolator Brain | v1.0 | 2/2 | Complete | 2026-04-17 |
| 4. Export Engine | v1.0 | 2/2 | Complete | 2026-04-17 |
| 5. Activity Type System | v1.1 | 2/2 | Complete | 2026-04-17 |
| 6. Configuration UX | v1.1 | 2/2 | Complete | 2026-04-17 |
| 7. Enhanced Simulation | v1.1 | 2/2 | Complete | 2026-04-17 |
| 8. Data Preview Charts | v1.1 | 2/2 | Complete | 2026-04-17 |
