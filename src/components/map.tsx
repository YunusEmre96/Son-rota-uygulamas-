'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
// Import the routing machine library to ensure it's loaded
import 'leaflet-routing-machine';

// This is a standard fix for Leaflet's default icon paths in module bundlers like Webpack.
// It ensures that marker icons are displayed correctly.
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const Map = () => {
  // We use useRef to hold mutable values that persist across renders without causing re-renders.
  // This is perfect for storing the map instance and other Leaflet-specific objects.
  const mapRef = useRef<L.Map | null>(null);
  const startPoint = useRef<L.LatLng | null>(null);
  const endPoint = useRef<L.LatLng | null>(null);
  const startMarker = useRef<L.Marker | null>(null);
  const endMarker = useRef<L.Marker | null>(null);
  const routingControl = useRef<L.Routing.Control | null>(null);

  // The useEffect hook with an empty dependency array runs only once after the component mounts.
  // This is the correct place to initialize the map, as the 'map' div is guaranteed to be in the DOM.
  useEffect(() => {
    // If the map is already initialized, do nothing. This prevents re-initialization on hot reloads.
    if (mapRef.current) return;

    // Initialize the map on the 'map' div
    mapRef.current = L.map('map').setView([30, 10], 2);

    // Add the OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(mapRef.current);

    // This function will handle all map click events
    const handleMapClick = (e: L.LeafletMouseEvent) => {
      // Third click or more: Reset everything
      if (startPoint.current && endPoint.current) {
        // Clear existing layers and controls from the map
        if (mapRef.current) {
            if(startMarker.current) mapRef.current.removeLayer(startMarker.current);
            if(endMarker.current) mapRef.current.removeLayer(endMarker.current);
            if(routingControl.current) mapRef.current.removeControl(routingControl.current);
        }
        
        // Reset all ref values to their initial state
        startPoint.current = null;
        endPoint.current = null;
        startMarker.current = null;
        endMarker.current = null;
        routingControl.current = null;
        
        // The current click becomes the new starting point
        startPoint.current = e.latlng;
        if (mapRef.current) {
            startMarker.current = L.marker(startPoint.current)
              .addTo(mapRef.current)
              .bindPopup('Başlangıç Noktası')
              .openPopup();
        }
      } 
      // Second click: Set the end point and draw the route
      else if (startPoint.current && !endPoint.current) {
        endPoint.current = e.latlng;
        if (mapRef.current) {
            endMarker.current = L.marker(endPoint.current)
              .addTo(mapRef.current)
              .bindPopup('Bitiş Noktası')
              .openPopup();

            // Create the routing control
            routingControl.current = L.Routing.control({
                waypoints: [startPoint.current, endPoint.current],
                // We use our own markers, so disable the default ones from the routing machine
                createMarker: function () {
                  return null;
                },
                routeWhileDragging: false, // Optional: disable route recalculation on marker drag
              }).addTo(mapRef.current);
        }
      }
      // First click: Set the start point
      else {
        startPoint.current = e.latlng;
        if (mapRef.current) {
            startMarker.current = L.marker(startPoint.current)
              .addTo(mapRef.current)
              .bindPopup('Başlangıç Noktası')
              .openPopup();
        }
      }
    };

    // Attach the click event listener to the map
    mapRef.current.on('click', handleMapClick);

    // Cleanup function: This will be called when the component is unmounted.
    // It's important for preventing memory leaks.
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []); // Empty dependency array means this effect runs only once on mount.

  // This is the div where the Leaflet map will be rendered.
  return <div id="map" style={{ height: '100vh', width: '100vw' }} />;
};

export default Map;
