---
phase: 03
slug: route-interpolator-brain
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-17
---

# Phase 03 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest 4.x |
| **Config file** | none — Wave 0 installs |
| **Quick run command** | `vitest run --reporter=verbose` |
| **Full suite command** | `vitest run --coverage` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `vitest run --reporter=verbose`
- **After every plan wave:** Run `vitest run --coverage`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 03-01-01 | 01 | 1 | CFG-04 | T-03-01 | N/A | unit | `npx vitest run lib/__tests__/route-interpolator.test.ts --reporter=verbose` | ✅ W0 | ⬜ pending |
| 03-01-02 | 01 | 1 | CFG-04 | — | N/A | unit | `npx vitest run lib/__tests__/route-interpolator.test.ts --reporter=verbose` | ✅ W0 | ⬜ pending |
| 03-02-01 | 02 | 1 | BIO-01 | — | N/A | unit | `npx vitest run lib/__tests__/biometric-simulator.test.ts --reporter=verbose` | ✅ W0 | ⬜ pending |
| 03-02-02 | 02 | 1 | BIO-02 | — | N/A | unit | `npx vitest run lib/__tests__/biometric-simulator.test.ts --reporter=verbose` | ✅ W0 | ⬜ pending |
| 03-02-03 | 02 | 1 | BIO-03 | — | N/A | unit | `npx vitest run lib/__tests__/elevation-simulator.test.ts --reporter=verbose` | ✅ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `vitest` added to `devDependencies` (`npm install --save-dev vitest`)
- [ ] `vitest.config.ts` created in project root
- [ ] `lib/__tests__/route-interpolator.test.ts` — stubs for CFG-04 (temporal path distancer)
- [ ] `lib/__tests__/biometric-simulator.test.ts` — stubs for BIO-01 (HR curve), BIO-02 (cadence)
- [ ] `lib/__tests__/elevation-simulator.test.ts` — stubs for BIO-03 (elevation profile)

*Wave 0 must complete BEFORE any plan task begins — tests drive the implementation.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Elevation API integration (Open-Meteo) | BIO-03 | External API — mock in unit tests, manual smoke test with real API | 1. Run `vitest run elevation-simulator` 2. Verify mock returns correct values 3. Optionally hit `https://api.open-meteo.com/v1/elevation?latitude=52&longitude=13` to confirm live data |
| GeoJSON coordinate flip `[lat,lon]` → `[lon,lat]` | CFG-04 | Leaflet vs Turf coordinate order — critical bug path | Check output points in devtools: longitude must be in range [-180, 180], latitude in [-90, 90] |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
