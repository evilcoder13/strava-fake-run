# Requirements: StravaFakeRun v1.2

**Defined:** 2026-04-17
**Core Value:** Empower users to easily and realistically generate synthetic workout data that seamlessly uploads to Strava without looking fake.

## v1.2 Requirements

### Map Navigation & Utilities

- [x] **NAV-01**: User can type an address or city name into a search bar to instantly center the map on that location
- [x] **NAV-02**: User can click a "Locate Me" button to zoom the map to their current physical GPS coordinates
- [x] **NAV-03**: Search functionality provides autocomplete or suggestions via a free geocoding service (e.g. Nominatim)

### Sharing & Persistence

- [ ] **SHR-01**: Current route waypoints and configuration are persisted in the URL as a base64 encoded string
- [ ] **SHR-02**: Copying and opening the URL on another device/browser restores the route exactly
- [ ] **SHR-03**: (Bonus) Direct Strava OAuth upload to skip manual file handling

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| NAV-01 | Phase 9 | Complete |
| NAV-02 | Phase 9 | Complete |
| NAV-03 | Phase 9 | Complete |
| SHR-01 | Phase 10 | Pending |
| SHR-02 | Phase 10 | Pending |
| SHR-03 | Phase 11 | Pending |

**Coverage:**
- v1.2 requirements: 6 total
- Mapped to phases: 6
- Unmapped: 0 ✓

---
*Last updated: 2026-04-17 after v1.1 milestone completion — starting v1.2*
