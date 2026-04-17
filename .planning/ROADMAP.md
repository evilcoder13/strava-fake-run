# Roadmap: StravaFakeRun

## Milestones

- ✅ **v1.0 MVP** — Phases 1-4 (shipped 2026-04-17)
- ✅ **v1.1 Realism & Activity Types** — Phases 5-8 (shipped 2026-04-17)
- 🚧 **v1.2 Map Utilities & Sharing** — Phases 9-11 (in progress)

## Phases

<details>
<summary>✅ v1.0 MVP (Phases 1-4) — SHIPPED 2026-04-17</summary>

- [x] Phase 1: Project Setup & Core Map (3/3 plans) — 2026-04-16
- [x] Phase 2: UI Controls & Road Snapping (2/2 plans) — 2026-04-16
- [x] Phase 3: Route Interpolator Brain (2/2 plans) — 2026-04-17
- [x] Phase 4: Export Engine (2/2 plans) — 2026-04-17

</details>

<details>
<summary>✅ v1.1 Realism & Activity Types (Phases 5-8) — SHIPPED 2026-04-17</summary>

- [x] Phase 5: Activity Type System (2/2 plans) — 2026-04-17
- [x] Phase 6: Configuration UX (2/2 plans) — 2026-04-17
- [x] Phase 7: Enhanced Simulation (2/2 plans) — 2026-04-17
- [x] Phase 8: Data Preview Charts (2/2 plans) — 2026-04-17

</details>

### ✅ v1.2 Map Utilities & Sharing (Shipped 2026-04-17)

- [x] **Phase 9: Map Navigation Utilities** — Address search and geolocation
- [x] **Phase 10: URL State Sharing** — Share routes via base64 URL params

## Phase Details

### Phase 9: Map Navigation Utilities
- **Goal**: Allow users to quickly find their starting point via text search and GPS geolocation.
- **Depends on**: Phase 1
- **Requirements**: NAV-01, NAV-02, NAV-03
- **Success Criteria**:
  1. Search bar in UI successfully centers map on typed address.
  2. "Locate Me" button successfully zooms to user's physical position.
  3. Map is responsive and markers are placed correctly after navigation.
- **Plans**: 2 plans
- **Status**: COMPLETE ✓

Plans:
- [x] 09-01: Store updates & Geolocation button
- [x] 09-02: Nominatim search implementation

### Phase 10: URL State Sharing
- **Goal**: Enable route sharing and persistence via URL params.
- **Depends on**: Phase 1, Phase 2
- **Requirements**: SHR-01, SHR-02
- **Plans**: 2 plans
- **Status**: COMPLETE ✓

Plans:
- [x] 10-01: Serialization logic & Store integration
- [x] 10-02: URL syncing & UI share button

## Progress

**Execution Order:** 9 → 10

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
| 9. Map Navigation Utilities | v1.2 | 2/2 | Complete | 2026-04-17 |
| 10. URL State Sharing | v1.2 | 2/2 | Complete | 2026-04-17 |

## Progress Summary
