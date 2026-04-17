# UI-SPEC: Phase 5 — Activity Type System

**Phase**: 05-activity-type-system
**Created**: 2026-04-17
**Status**: Approved

---

## Components

### ActivityTypeSelector

A segmented radio-button group placed in the sidebar above the "Generate Activity" button. Single-choice toggle — selecting one deseclects all others.

**Position in sidebar:**
1. Waypoints section
2. Configuration section (date, time, pace)
3. ➡ **Activity Type Selector** ← (new)
4. Generate Activity button
5. Export buttons (conditional)

**Layout:** 2×2 grid (fixed — sidebar is narrow, 4-in-a-row is too cramped)

```
┌──────────────┬──────────────┐
│  🏃  Running │  🚶  Walking │
├──────────────┼──────────────┤
│  🚴  Cycling │  🥾  Hiking  │
└──────────────┴──────────────┘
```

**Dimensions:** Each button `py-2 px-2`, icon size `16px`, gap between buttons `gap-2`, container `rounded-xl`.

---

### CadenceUnitLabel

A conditional inline label in the Generate Activity output stats row:
- When `activityType === 'Cycling'` → show **"RPM"**
- All other types → show **"SPM"**

No separate component needed — a ternary in existing JSX.

---

## Visual Tokens

### Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--accent` | `#FC4C02` | Selected button background |
| `--btn-inactive-bg` | `#27272a` (zinc-800) | Unselected button background |
| `--btn-hover-bg` | `#3f3f46` (zinc-700) | Hover state |
| `--btn-active-text` | `#FFFFFF` | Selected button label |
| `--btn-inactive-text` | `#a1a1aa` (zinc-400) | Unselected label |
| `--container-bg` | `#18181b` (zinc-900) | Selector container background |

### Typography

| Element | Size | Weight | Color (active/inactive) |
|---------|------|--------|------------------------|
| Button label | `text-xs` (12px) | `font-medium` | white / zinc-400 |
| Section label | `text-xs` (12px) | `font-medium` | zinc-400 |
| Icon | 16×16px | — | white / zinc-400 |

### Spacing

| Token | Value |
|-------|-------|
| Button padding | `py-2 px-2` |
| Grid gap | `gap-2` (8px) |
| Container padding | `p-1` |
| Border radius (buttons) | `rounded-lg` (8px) |
| Border radius (container) | `rounded-xl` (12px) |
| Margin top (from config section) | `mt-4` |

---

## Interaction Design

### States

| State | Background | Text | Shadow |
|-------|------------|------|--------|
| Default | zinc-800 (`#27272a`) | zinc-400 | none |
| Hover | zinc-700 (`#3f3f46`) | zinc-200 | none |
| Selected | `#FC4C02` | white | `shadow-md` drop |
| Disabled | zinc-900 | zinc-600 | none |

### Transitions

```css
transition-colors duration-150 ease-in-out
```

Applied to both background and text color on all buttons.

---

## Copywriting

### Button Labels (icon + text)

| ActivityType | Icon (lucide-react) | Label |
|--------------|---------------------|-------|
| Running | `Footprints` | `Run` |
| Walking | `PersonStanding` | `Walk` |
| Cycling | `Bike` | `Cycle` |
| Hiking | `Mountain` | `Hike` |

> Use short labels (4 chars max) — sidebar is narrow. Full sport name available as tooltip/`title` attribute.

### Section heading (above selector)

```
Activity Type
```

Class: `text-xs font-medium text-zinc-400 mb-2`

### Accessible Labels

```html
<div role="radiogroup" aria-label="Select activity type">
  <button role="radio" aria-checked="true" aria-label="Running" title="Running">
  <button role="radio" aria-checked="false" aria-label="Walking" title="Walking">
  <button role="radio" aria-checked="false" aria-label="Cycling" title="Cycling">
  <button role="radio" aria-checked="false" aria-label="Hiking" title="Hiking">
</div>
```

---

## Tailwind Class Reference

### Container

```
grid grid-cols-2 gap-2 p-1 bg-zinc-900 rounded-xl
```

### Button — Base (applies to all)

```
flex flex-col items-center justify-center gap-1 py-2 px-2 rounded-lg
transition-colors duration-150 ease-in-out cursor-pointer text-xs font-medium
```

### Button — Inactive

```
bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200
```

### Button — Active/Selected

```
bg-[#FC4C02] text-white shadow-md
```

### Full combined (inactive):

```
flex flex-col items-center justify-center gap-1 py-2 px-2 rounded-lg text-xs font-medium
bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200 transition-colors duration-150
```

### Full combined (active):

```
flex flex-col items-center justify-center gap-1 py-2 px-2 rounded-lg text-xs font-medium
bg-[#FC4C02] text-white shadow-md transition-colors duration-150
```

---

## Implementation Notes

### Files to Modify

| File | Change |
|------|--------|
| `lib/types/activity.ts` | Add `ActivityType` enum |
| `store/useRouteStore.ts` | Add `activityType` state field (default: `ActivityType.Running`) + `setActivityType` action |
| `components/Sidebar.tsx` | Add section with `ActivityTypeSelector` UI above "Generate Activity" button |

### Do NOT create a separate component file

The selector is compact and sidebar-only — implement inline in `Sidebar.tsx` using a `const ACTIVITY_OPTIONS` array + `.map()` for the buttons. No need for a separate component file at this stage.

### Icon imports (lucide-react)

```typescript
import { Footprints, PersonStanding, Bike, Mountain } from 'lucide-react';
```

Verify these icon names exist in the installed lucide-react version before using — fallback to `Activity` icon if needed.

---

## UI-SPEC COMPLETE
