'use client';

import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';
import { useState, useEffect, useRef } from 'react';
import L, { LatLng } from 'leaflet';

// Leaflet marker icon issue fix
delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const startIcon = new L.Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
    className: 'marker-start'
});

const endIcon = new L.Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
    className: 'marker-end'
});


function Routing() {
  const map = useMapEvents({
    click(e) {
      map.closePopup();
      const { lat, lng } = e.latlng;
      
      const waypoints = (this as any)._routing.getWaypoints();

      if (!waypoints[0] || waypoints[0].latLng === null) {
        (this as any)._routing.setWaypoints([L.latLng(lat, lng)]);
      } else if (!waypoints[1] || waypoints[1].latLng === null) {
        (this as any)._routing.setWaypoints([...waypoints, L.latLng(lat, lng)]);
      } else {
        (this as any)._routing.setWaypoints([L.latLng(lat, lng)]);
      }
    },
  });

  useEffect(() => {
    if (!map) return;

    const routingControl = L.Routing.control({
      waypoints: [null, null],
      routeWhileDragging: true,
      show: true,
       lineOptions: {
        styles: [{ color: '#90EE90', opacity: 1, weight: 5 }]
      },
      createMarker: function(i, waypoint, n) {
        const icon = i === 0 ? startIcon : endIcon;
        return L.marker(waypoint.latLng, {
          draggable: true,
          icon: icon
        });
      }
    }).addTo(map);

    (map as any)._routing = routingControl;

    return () => {
      map.removeControl(routingControl);
      (map as any)._routing = null;
    };
  }, [map]);

  return null;
}

export default function Map() {
    return (
        <MapContainer
            center={[41.0082, 28.9784]}
            zoom={13}
            scrollWheelZoom={true}
            style={{ height: '100vh', width: '100vw' }}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Routing />
        </MapContainer>
    );
}
