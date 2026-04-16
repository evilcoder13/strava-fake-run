---
phase: 01
slug: project-setup-core-map
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-16
---

# Phase 01 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Jest / React Testing Library |
| **Config file** | jest.config.ts — Wave 0 installs |
| **Quick run command** | `npm run test -- --passWithNoTests` |
| **Full suite command** | `npm run test -- --passWithNoTests` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run lint` or `npm run type-check` (fast feedback for UI logic)
- **After every plan wave:** Run `npm run build`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| TBD | TBD | TBD | MAP-01, MAP-02, MAP-03 | — | N/A | unit | `npm run test` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `jest.config.ts` — Jest configuration for Next.js
- [ ] `package.json` — Install jest, @testing-library/react
- [ ] `tsconfig.json` — Setup types for jest

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Map plotting | MAP-01,02,03 | Visual interaction | Verify clicking map adds pin, sidebar list updates, polyline draws. |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
