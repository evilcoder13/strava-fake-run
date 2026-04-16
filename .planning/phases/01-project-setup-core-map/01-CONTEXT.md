# Phase 1: Project Setup & Core Map - Context

**Gathered:** 2026-04-16
**Status:** Ready for planning

<domain>
## Phase Boundary

Setting up the initial Next.js foundation and the core interactive Leaflet map for plotting and managing waypoints. This handles the UI/UX for MAP-01, MAP-02, and MAP-03.
</domain>

<decisions>
## Implementation Decisions

### Waypoint Management UI
- **Both map pins + sidebar list:** Users can click on the map to add waypoints, but they will also have a sidebar list representation of the waypoints where they can drag-to-reorder and delete. This is optimized for long route creation.

### the agent's Discretion
- **Overall Layout Structure:** We will use a Sidebar + Full Height Map layout to support the sidebar list naturally.
- **Map Provider Base Layer:** We will use standard OpenStreetMap tiles by default to avoid the need for immediate API keys and configure Leaflet to load them securely.
</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

No external specs — requirements fully captured in decisions above.
</canonical_refs>

<specifics>
## Specific Ideas

None recorded for this phase.
</specifics>

<deferred>
## Deferred Ideas

None at this time.
</deferred>

---

*Phase: 01-project-setup-core-map*
*Context gathered: 2026-04-16*
