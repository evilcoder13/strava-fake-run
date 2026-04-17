# Phase 6: Configuration UX

## Context
Users currently set `startDate` and `startTime`. However, `startTime` is appended with `Z` in the Route Interpolator, which forces it to be treated as UTC. For example, setting `08:00` results in `08:00 UTC`. If the user is in Tokyo, they might have meant `08:00 JST`. Furthermore, Strava uses either GPX/TCX timestamp TZ offsets, or internal GPS-based TZ mapping. But providing explicit correct offsets in the generated XML files is best practice for TCX/GPX.

Also, the pace slider and display currently only supports `min/km`. Many users prefer `km/h` for cycling, walking, or treadmills. We need a live toggle in the UI to switch between Pace (`min/km`) and Speed (`km/h`).

## Requirements
1. **CFG-05**: Timezone selector setting. Default to browser's local timezone offset.
2. **CFG-06**: Modifying the exported timestamp to include the selected UTC offset (or calculating the UTC epoch correctly so that the input local time represents the actual local time of the run).
3. **CFG-07**: Pace unit toggle in UI between Pace (min/km) and Speed (km/h) with live UI conversions.

## Research Findings
- **Unit Conversions:**
  - `min/km` to `km/h`: Speed = 60 / Pace. E.g., `5:00 min/km` -> `60 / 5 = 12 km/h`.
  - `km/h` to `min/km`: Pace = 60 / Speed. E.g., `10 km/h` -> `60 / 10 = 6 min/km` -> `6:00 min/km`.
  - The actual state in `useRouteStore` can just stay `paceMinutes` and `paceSeconds`, meaning `min/km` is the source of truth, and the UI component handles the display and input parsing if the user is in "Speed" mode.
- **Timezone Export:**
  - Strava parses standard ISO 8601 strings.
  - The store can hold `timezoneOffset: string` (e.g., `"+07:00"`, `"-04:00"`, `"Z"`).
  - Browser local timezone offset can be retrieved via `new Date().getTimezoneOffset()`. (e.g. -420 minutes = `+07:00`).
  - `route-interpolator.ts` can use this offset string instead of appending `.000Z` to construct the Date object, and then re-format the ISO strings with the chosen offset instead of native `Z`. Wait, Javascript `toISOString()` ALWAYS uses `Z` and converts to UTC.
  - We can format localized ISO 8601 strings manually.

### Offset Formatter implementation
```typescript
function formatOffsetISO(date: Date, offsetStr: string): string {
    // Note: since JS Dates are inherently UTC-based epoch values, we can't just apply an offset string unless we compute the string perfectly.
}
```
Wait, if the user picks `08:00` and `+09:00`, the file should ideally just output UTC time (e.g. `23:00` the day before). Strava's backend processes standard ISO 8601 strings with `Z` timezone and uses the coordinate or the `Z` time correctly.
So if we construct the `startMs` as:
`new Date(\`\${startDate}T\${normalizedTime}:00\${timezoneOffset}\`).getTime()`
and then just emit `.toISOString()` for each trackpoint, it correctly maps the user's intent to actual UTC timestamps! This is vastly simpler and 100% compliant.

Wait, if they want "08:00 local time", and they pick `+09:00`, the constructed string is `2024-01-15T08:00:00+09:00`. Native `Date` parses this to `1705273200000` (which is 23:00 UTC). `new Date(1705273200000).toISOString()` gives `2024-01-14T23:00:00.000Z`. Strava maps `23:00 UTC` using GPS to local `08:00 JST`. Perfect and elegant!

## Tasks
1. **06-01**: **Timezone Selector**
   - Add `timezoneOffset` to `RouteState`.
   - Update `route-interpolator` to respect the offset string during Date parsing.
   - Add selector UI to `Sidebar.tsx`.
2. **06-02**: **Pace Unit Toggle**
   - Add `useSpeedUnit` (boolean) to `RouteState`, default false.
   - Update `Sidebar.tsx` pace controls to render either "Pace" (Min, Sec sliders) or "Speed" (Number input for km/h).
   - Convert on the fly when setting store values.
