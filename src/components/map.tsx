'use client';

import { useState, useEffect, useRef } from 'react';
import type { LatLng, Map as LeafletMap, Marker, Routing, DivIcon } from 'leaflet';

// Type declarations to satisfy TypeScript for CDN-loaded libraries
declare global {
  interface Window {
    L: any;
  }
}

const Map = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const routingControlRef = useRef<Routing.Control | null>(null);
  const markersRef = useRef<Marker[]>([]);

  const [points, setPoints] = useState<LatLng[]>([]);

  // Effect to initialize the map instance. Runs only once.
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const L = window.L;
    if (!L) return;

    // Initialize map, centered on a default location (e.g., Istanbul).
    mapRef.current = L.map(mapContainerRef.current, {
        zoomControl: false // Disable default zoom to add it back in a better position.
    }).setView([41.0082, 28.9784], 10);

    // Add zoom control to the top-right corner.
    L.control.zoom({ position: 'topright' }).addTo(mapRef.current);

    // Add the OpenStreetMap tile layer.
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(mapRef.current);

    // Define the map click event handler.
    const handleMapClick = (e: { latlng: LatLng }) => {
      // Logic to handle point selection.
      setPoints(currentPoints => {
        // If a route is already drawn (2 points exist), the next click starts a new route.
        if (currentPoints.length >= 2) {
          return [e.latlng]; // Reset with the new point as the start.
        }
        // Otherwise, add the new point.
        return [...currentPoints, e.latlng];
      });
    };

    // Attach the click event listener to the map.
    mapRef.current.on('click', handleMapClick);

    // Cleanup function to run when the component unmounts.
    return () => {
      if (mapRef.current) {
        mapRef.current.off('click', handleMapClick);
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Effect to manage markers and routing, runs whenever 'points' state changes.
  useEffect(() => {
    if (!mapRef.current) return;

    const L = window.L;
    if (!L) return;

    // --- 1. Cleanup Phase: Remove previous layers ---

    // Remove old markers from the map and clear the reference array.
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Remove the old routing control from the map if it exists.
    if (routingControlRef.current) {
      mapRef.current.removeControl(routingControlRef.current);
      routingControlRef.current = null;
    }

    // --- 2. Drawing Phase: Add new layers based on current points ---

    // If there is at least one point, create and add markers.
    if (points.length > 0) {
      const markerIcon = L.divIcon({
          className: 'leaflet-routing-icon',
          html: `<span style="display: block; width: 100%; height: 100%; border-radius: 50%; background-color: hsl(var(--accent)); box-shadow: 0 0 0 3px hsl(var(--accent-foreground));"></span>`,
          iconSize: [14, 14],
          iconAnchor: [7, 7]
      });

      points.forEach(point => {
        const marker = L.marker(point, { icon: markerIcon }).addTo(mapRef.current!);
        markersRef.current.push(marker);
      });
    }

    // If there are exactly two points, create and display the route.
    if (points.length === 2) {
      const routingControl = L.Routing.control({
        waypoints: [
          L.latLng(points[0]),
          L.latLng(points[1]),
        ],
        routeWhileDragging: false,
        addWaypoints: false,
        draggableWaypoints: false,
        fitSelectedRoutes: true,
        show: true, // Ensures the instructions panel is visible.
        createMarker: () => null // Disable default A/B markers, we use our own.
      }).addTo(mapRef.current);

      routingControlRef.current = routingControl;
    }
  }, [points]);

  return <div ref={mapContainerRef} className="absolute inset-0 z-0" />;
};

export default Map;
