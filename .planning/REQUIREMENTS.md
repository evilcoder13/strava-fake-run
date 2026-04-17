# Requirements: StravaFakeRun

**Defined:** 2026-04-16
**Core Value:** Empower users to easily and realistically generate synthetic workout data that seamlessly uploads to Strava without looking fake.

## v1 Requirements

### Mapping & Routing

- [ ] **MAP-01**: User can interactively click the map to add route waypoints
- [ ] **MAP-02**: User can drag to reorder, move, or delete existing waypoints
- [ ] **MAP-03**: Application draws polylines connecting waypoints
- [ ] **MAP-04**: Map utilizes a "snap-to-road" routing API for realistic paths between waypoints

### Activity Configuration

- [ ] **CFG-01**: User can specify exact date and start time for the activity
- [ ] **CFG-02**: User can input target average pace (e.g., min/km)
- [ ] **CFG-03**: User can toggle pacing variability/noise to prevent robotic flatlining
- [x] **CFG-04**: Application calculates segmented distances and interpolates timestamps based on target pace

### Biometric Simulation

- [x] **BIO-01**: Application can generate a baseline simulated heart rate curve
- [x] **BIO-02**: Application can generate running cadence corresponding to the chosen pace
- [x] **BIO-03**: (Optional initially, high priority) Application fetches real-world elevation profiles for the route points

### Export & Output

- [ ] **OUT-01**: User can export the generated activity as a valid `.gpx` file
- [ ] **OUT-02**: User can export the generated activity as a valid `.tcx` file (including biometric extensions)

## v2 Requirements

### Integrations

- **INT-01**: User can import an existing GPX file to act as the base route
- **INT-02**: User can securely authorize OAuth to upload directly to Strava API without downloading files

## Out of Scope

| Feature | Reason |
|---------|--------|
| Direct Strava OAuth | High friction to configure for MVP; local file export handles 100% of the core value. |
| Database Backend / User Accounts | Ephemeral browser processing is fast, free to host, and respects privacy. |
| Mobile Application | Web-first MVP. |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| MAP-01 | Phase 1 | Pending |
| MAP-02 | Phase 1 | Pending |
| MAP-03 | Phase 1 | Pending |
| MAP-04 | Phase 2 | Pending |
| CFG-01 | Phase 2 | Pending |
| CFG-02 | Phase 2 | Pending |
| CFG-03 | Phase 2 | Pending |
| CFG-04 | Phase 3 | Complete |
| BIO-01 | Phase 3 | Complete |
| BIO-02 | Phase 3 | Complete |
| BIO-03 | Phase 3 | Complete |
| OUT-01 | Phase 4 | Pending |
| OUT-02 | Phase 4 | Pending |

**Coverage:**
- v1 requirements: 13 total
- Mapped to phases: 13
- Unmapped: 0 ✓

---
*Requirements defined: 2026-04-16*
*Last updated: 2026-04-16 after initial definition*
