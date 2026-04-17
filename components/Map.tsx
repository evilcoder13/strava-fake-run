"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Polyline, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { useRouteStore } from "@/store/useRouteStore";

// Custom icon to circumvent next.js mapping issues with Leaflet's default markers
const createCustomIcon = () => {
  return L.divIcon({
    className: "custom-div-icon",
    html: `<div style="background-color: #FC4C02; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.5);"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7]
  });
};

function MapEvents() {
  const addWaypoint = useRouteStore((state) => state.addWaypoint);
  
  useMapEvents({
    click: (e) => {
      addWaypoint(e.latlng.lat, e.latlng.lng);
    },
  });

  return null;
}

function MapController() {
  const mapCenter = useRouteStore((state) => state.mapCenter);
  const mapZoom = useRouteStore((state) => state.mapZoom);
  const map = useMapEvents({});

  useEffect(() => {
    if (mapCenter) {
      map.flyTo(mapCenter, mapZoom || 13);
    }
  }, [mapCenter, mapZoom, map]);

  return null;
}

export default function Map() {
  const waypoints = useRouteStore((state) => state.waypoints);
  const snappedPath = useRouteStore((state) => state.snappedPath);
  const moveWaypoint = useRouteStore((state) => state.moveWaypoint);
  const [mounted, setMounted] = useState(false);
  const [customIcon, setCustomIcon] = useState<L.DivIcon | null>(null);

  useEffect(() => {
    setMounted(true);
    setCustomIcon(createCustomIcon());
  }, []);

  if (!mounted || !customIcon) return null;

  return (
    <MapContainer
      center={[51.505, -0.09]} // Default center (London)
      zoom={13}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapEvents />
      <MapController />
      
      {waypoints.map((wp) => (
        <Marker
          key={wp.id}
          position={[wp.lat, wp.lng]}
          icon={customIcon}
          draggable={true}
          eventHandlers={{
            dragend: (e) => {
              const marker = e.target;
              const position = marker.getLatLng();
              moveWaypoint(wp.id, position.lat, position.lng);
            },
          }}
        />
      ))}
      
      {snappedPath.length > 0 && (
        <Polyline
          positions={snappedPath}
          color="#FC4C02"
          weight={4}
        />
      )}
    </MapContainer>
  );
}
