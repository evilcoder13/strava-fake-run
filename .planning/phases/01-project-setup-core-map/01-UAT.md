---
status: complete
phase: 01-project-setup-core-map
source: 01-01-SUMMARY.md, 01-02-SUMMARY.md, 01-03-SUMMARY.md
started: 2026-04-16T14:38:00Z
updated: 2026-04-16T14:42:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Cold Start Smoke Test
expected: |
  Kill any running server/service. Start the application from scratch using `npm run dev`. The server boots without errors, and the homepage loads showing the map filling the main area and an empty sidebar on the side.
result: pass

### 2. Interactive Map Click-to-Add
expected: |
  Clicking anywhere on the map adds a new custom orange marker at that location.
result: pass

### 3. Sidebar Waypoint Tracking
expected: |
  When a marker is added to the map, a corresponding entry appears automatically in the sidebar listing its coordinates.
result: pass

### 4. Waypoint Repositioning (Drag Map Marker)
expected: |
  The orange markers on the map can be dragged. Dropping them updates the connecting line, and the coordinate values in the sidebar update in real time.
result: pass

### 5. Route Polyline Rendering
expected: |
  After adding 2 or more markers, a solid orange line connects them in the order they were added.
result: pass

### 6. Sidebar Reordering via Drag-and-Drop
expected: |
  Dragging a waypoint row in the sidebar and dropping it into a different position reorders the list. The orange route line on the map updates instantly to reflect the new sequence.
result: pass

### 7. Removing Custom Waypoints
expected: |
  Clicking the delete/trash icon on a waypoint in the sidebar prompts for deletion, and upon confirmation, removes it from the sidebar list, deletes the marker on the map, and re-draws the connecting lines.
result: pass

## Summary

total: 7
passed: 7
issues: 0
pending: 0
skipped: 0

## Gaps
