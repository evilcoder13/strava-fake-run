# Requirements: StravaFakeRun v1.1

**Defined:** 2026-04-17
**Core Value:** Empower users to easily and realistically generate synthetic workout data that seamlessly uploads to Strava without looking fake.

## v1.1 Requirements

### Activity Types

- [ ] **ACT-01**: User can select activity type (Running, Walking, Cycling, Hiking) before generating
- [ ] **ACT-02**: Each activity type uses a sport-specific biometric profile (HR zones, cadence ranges, pace ranges)
- [ ] **ACT-03**: Exported GPX and TCX files encode the correct Strava sport type for the selected activity

### Configuration UX

- [ ] **CFG-05**: User can select a timezone (GMT offset) from a dropdown; it defaults to the browser's local timezone
- [ ] **CFG-06**: Exported file timestamps reflect the selected timezone's correct UTC offset
- [ ] **CFG-07**: User can toggle pace input unit between min/km and km/h via a checkbox; the displayed value converts live on toggle

### Enhanced Realism

- [ ] **SIM-01**: Cadence varies in response to route gradient — drops on uphills, rises on downhills
- [ ] **SIM-02**: Heart rate spikes at climbs proportional to the gradient angle
- [ ] **SIM-03**: Each trackpoint receives a small random GPS coordinate offset (positional noise) to avoid perfectly straight GPS traces
- [ ] **SIM-04**: First ~5% and last ~5% of activity use a warm-up / cool-down ramp for HR and pace

### Data Preview

- [ ] **VIZ-01**: After generating an activity, user can view a pace-over-distance chart
- [ ] **VIZ-02**: After generating an activity, user can view a heart-rate-over-distance chart

## Future Requirements (Deferred)

- Direct Strava OAuth upload (v1.2)
- Swimming activity type (different data model)
- Activity history / saved runs
- Elevation chart preview
- Cadence chart preview

## Out of Scope

| Feature | Reason |
|---------|--------|
| Direct Strava OAuth | High friction to configure; local file export handles core value |
| Database Backend / User Accounts | Ephemeral browser processing respects privacy |
| Mobile Application | Web-first MVP |
| Swimming | Very different data model (pool lengths, strokes/min) — future milestone |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| ACT-01 | Phase 5 | Pending |
| ACT-02 | Phase 5 | Pending |
| ACT-03 | Phase 5 | Pending |
| CFG-05 | Phase 6 | Pending |
| CFG-06 | Phase 6 | Pending |
| CFG-07 | Phase 6 | Pending |
| SIM-01 | Phase 7 | Pending |
| SIM-02 | Phase 7 | Pending |
| SIM-03 | Phase 7 | Pending |
| SIM-04 | Phase 7 | Pending |
| VIZ-01 | Phase 8 | Pending |
| VIZ-02 | Phase 8 | Pending |

**Coverage:**
- v1.1 requirements: 12 total
- Mapped to phases: 12
- Unmapped: 0 ✓

---
*Requirements defined: 2026-04-17*
*Last updated: 2026-04-17 after v1.1 milestone definition*
