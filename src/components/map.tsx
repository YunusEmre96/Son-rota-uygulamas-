'use client';

import { MapContainer, TileLayer, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import L from 'leaflet';
import { useEffect } from 'react';

// Leaflet marker icon sorununu düzelt
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const startIcon = new L.Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    className: 'marker-start'
});

const endIcon = new L.Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    className: 'marker-end'
});


function Routing() {
  const map = useMapEvents({
    click(e) {
      const routingControl = (map as any)._routing;
      if (!routingControl) return;

      const waypoints = routingControl.getWaypoints();
      const newWaypoint = e.latlng;

      if (!waypoints[0] || waypoints[0].latLng === null) {
        routingControl.setWaypoints([L.latLng(newWaypoint.lat, newWaypoint.lng)]);
      } else if (!waypoints[1] || waypoints[1].latLng === null) {
        routingControl.setWaypoints([...waypoints, L.latLng(newWaypoint.lat, newWaypoint.lng)]);
      } else {
        routingControl.setWaypoints([L.latLng(newWaypoint.lat, newWaypoint.lng)]);
      }
    },
  });

  useEffect(() => {
    if (!map) return;
    
    // routing-machine'i dinamik olarak yükle
    import('leaflet-routing-machine').then((RoutingMachine) => {
        if (map && !map.hasOwnProperty('_routing')) {
             const routingControl = new RoutingMachine.Control({
                waypoints: [null, null],
                routeWhileDragging: true,
                show: true,
                lineOptions: {
                    styles: [{ color: 'hsl(var(--accent))', opacity: 1, weight: 5 }]
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
        }
    });

    return () => {
        if (map && (map as any)._routing) {
            map.removeControl((map as any)._routing);
            (map as any)._routing = null;
        }
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
            style={{ height: '100%', width: '100%' }}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Routing />
        </MapContainer>
    );
}
