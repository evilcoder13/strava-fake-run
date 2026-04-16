# Phase 1: Project Setup & Core Map - Research

## Context

**Goal**: Get Next.js up and running with a usable map.
**Requirements Coverage**: MAP-01, MAP-02, MAP-03
**Decisions**: Sidebar + Map layout, both sidebar list and map pins for waypoint management, standard OSM provider.

## Technical Findings

1.  **Next.js (App Router) + Leaflet Integration**:
    *   **The Issue**: Leaflet internally references `window` and `document` which throws exceptions during Server-Side Rendering (SSR) in Next.js.
    *   **The Solution**: Any component rendering the `MapContainer` from `react-leaflet` must be imported dynamically with SSR disabled. E.g., `const Map = dynamic(() => import('./Map'), { ssr: false });`
    *   **CSS**: Leaflet's CSS MUST be imported into the application (usually `app/globals.css` or `layout.tsx`) via `import 'leaflet/dist/leaflet.css';`. Without this, map tiles will load completely scattered.
    *   **Icon Issues**: Leaflet's default marker icons often break in bundlers because the image paths get munged. We will likely need to fix the default icon pathing or use custom `DivIcon`s with Tailwind/Lucide icons.

2.  **Shared State Management (Map <-> Sidebar)**:
    *   Because both the `Sidebar` and the dynamically loaded `Map` need access to the exact same list of `waypoints` (for reading and writing), lifting state to a common parent (like a `Layout` or `Page` component) is required.
    *   Given the complexity of adding, deleting, and reordering, a lightweight state manager like `zustand` is strongly recommended over standard React Context/State to avoid excessive re-rendering and keep the logic clean.

3.  **Map Interactions (`react-leaflet`)**:
    *   To capture click events on the map itself (MAP-01), we use the `useMapEvents` hook from `react-leaflet` to listen for the `click` event and append the `e.latlng` to our waypoint state.
    *   To draw the lines (MAP-03), we use the `<Polyline positions={waypoints} />` component.

4.  **Drag-to-Reorder in Sidebar (MAP-02)**:
    *   We can use `@dnd-kit/core` and `@dnd-kit/sortable` for a modern, accessible drag-and-drop list implementation in React.

## Validation Architecture

1.  **Dimension 2 (I/O)**: When `pages` or `layouts` are rendered, they should successfully compile without `window is not defined` errors.
2.  **Dimension 5 (Integration)**: Adding a pin on the map must reflect instantly in the sidebar list instance, and vice-versa.

## RESEARCH COMPLETE
