# Phase 6 UI Specification

## 1. Timezone Selector
- **Location:** Inside the "Settings" section block alongside the Date and Time pickers in `Sidebar.tsx`.
- **UI Element:** A native `<select>` element styled uniformly with other inputs.
- **Values:** Standard offsets: `Z` (UTC), `+01:00`, `+02:00`, ... `+14:00`, `-01:00`, ... `-12:00`.
- **Labels:** e.g., "UTC", "UTC+01:00", "UTC+07:00 (Local)".
- **Default:** We can calculate browser local timezone by default:
  ```typescript
  const tzOffset = new Date().getTimezoneOffset(); // returns minutes relative to UTC
  // e.g. -420 -> +07:00
  ```

## 2. Pace / Speed Unit Toggle
- **Location:** In the Activity section, near the Pace sliders.
- **UI Component:** A small toggle or two-button group (Pace vs. Speed) positioned aligned right to the Pace section title.
- **State Switch:**
  - **If Pace:** Show the existing `min/km` sliders (Minutes: 1-15, Seconds: 0-59).
  - **If Speed:** Show a range slider or number input for `km/h` (Range: 1 to 40 km/h with 0.1 step).
- **Data Model Safety:** The store uses `paceMinutes` and `paceSeconds` as truth.
  - When user switches to "Speed", the UI component derives `kmh = 60 / (paceMinutes + paceSeconds/60)`.
  - When user modifies Speed, we convert back and update `paceMinutes` and `paceSeconds`.
    - E.g. user sets `Speed = 12 km/h` -> `Pace = 5:00 min/km` -> `paceMinutes = 5`, `paceSeconds = 0`.
