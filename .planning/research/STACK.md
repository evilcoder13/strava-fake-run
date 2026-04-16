# Stack Research

**Domain:** Strava Log Simulation / GPS Builder
**Researched:** 2026-04-16
**Confidence:** HIGH

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Next.js | 15.x | Web App Framework | Best-in-class React framework, great for single-page dynamic interaction and fast load. |
| React | 18.x | UI Library | Component-based structure is ideal for maps and dynamic forms. |
| Tailwind CSS | 4.x | Styling | Utility-first CSS framework for rapid, modern design. |
| React Leaflet | 4.x | Mapping Components | Simple React wrapper around Leaflet; easy to draw routes, handle map clicks. |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| date-fns | 3.x | Time Manipulation | When interpolating timestamps across waypoints for pace simulation. |
| @turf/turf | 7.x | Geo Math | Calculating distances between coordinates to segment route by pace. |
| xmlbuilder2 | 3.x | File Export | Custom XML generation is better for TCX building (to support Heart Rate). |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| ESLint / Prettier | Linting / Formatting | Keep code clean and standardized. |

## Installation

```bash
# Core
npm install next react react-dom react-leaflet leaflet @turf/turf date-fns xmlbuilder2
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| React Leaflet | Mapbox GL JS | When you need 3D terrain, heatmaps, or rendering huge tracks efficiently. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Google Maps API | Expensive and overkill for simple route drawing / GPX exports. | Leaflet / Mapbox with OSM maps. |
| Create React App | Outdated, deprecated by React team. | Next.js or Vite. |

---
*Stack research for: GPS log simulation builder*
