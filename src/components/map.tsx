
'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import 'leaflet-routing-machine';

// Leaflet'in varsayılan ikon yollarını düzeltmek için standart çözüm.
// Bu, işaretçi ikonlarının doğru görüntülenmesini sağlar.
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Kontrol noktaları için özel sarı ikon
const yellowIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-yellow.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [20, 33],
  iconAnchor: [10, 33],
  popupAnchor: [1, -28],
  shadowSize: [33, 33]
});

const Map = () => {
  const mapRef = useRef<L.Map | null>(null);
  const startPoint = useRef<L.LatLng | null>(null);
  const endPoint = useRef<L.LatLng | null>(null);
  const startMarker = useRef<L.Marker | null>(null);
  const endMarker = useRef<L.Marker | null>(null);
  const routingControl = useRef<L.Routing.Control | null>(null);
  const checkpointMarkers = useRef<L.Marker[]>([]);

  useEffect(() => {
    // Harita zaten başlatılmışsa tekrar başlatmayı önle.
    if (!mapRef.current) {
      mapRef.current = L.map('map').setView([30, 10], 2);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(mapRef.current);
    }

    const map = mapRef.current;

    // Yardımcı fonksiyon: Haritadaki tüm işaretçileri ve rotayı temizler.
    const clearMap = () => {
      if (startMarker.current) map.removeLayer(startMarker.current);
      if (endMarker.current) map.removeLayer(endMarker.current);
      if (routingControl.current) map.removeControl(routingControl.current);
      
      checkpointMarkers.current.forEach(marker => map.removeLayer(marker));
      checkpointMarkers.current = [];

      startPoint.current = null;
      endPoint.current = null;
      startMarker.current = null;
      endMarker.current = null;
      routingControl.current = null;
    };

    // Yardımcı fonksiyon: Başlangıç işaretçisini oluşturur ve ayarlar.
    const createStartMarker = (latlng: L.LatLng) => {
      startPoint.current = latlng;
      startMarker.current = L.marker(startPoint.current)
        .addTo(map)
        .bindPopup('Başlangıç Noktası')
        .openPopup();
    };

    // Haritaya tıklama olayını yöneten fonksiyon.
    const handleMapClick = (e: L.LeafletMouseEvent) => {
      // DURUM 3: Başlangıç ve bitiş seçiliyse (üçüncü tıklama - Sıfırlama)
      if (startPoint.current && endPoint.current) {
        clearMap();
        createStartMarker(e.latlng);
      }
      // DURUM 2: Başlangıç seçilmiş ama bitiş seçilmemişse (ikinci tıklama)
      else if (startPoint.current && !endPoint.current) {
        endPoint.current = e.latlng;
        endMarker.current = L.marker(endPoint.current)
          .addTo(map)
          .bindPopup('Bitiş Noktası')
          .openPopup();

        // Rota çizimini başlat
        const control = L.Routing.control({
          waypoints: [startPoint.current, endPoint.current],
          routeWhileDragging: true,
          createMarker: function () {
            return null;
          },
        }).addTo(map);

        // Rota bulunduğunda kontrol noktalarını ekle
        control.on('routesfound', function (e) {
          const routes = e.routes;
          const route = routes[0];
          if (!route) return;

          // Önceki kontrol noktalarını temizle
          checkpointMarkers.current.forEach(marker => map.removeLayer(marker));
          checkpointMarkers.current = [];

          let totalDistance = 0;
          let nextCheckpoint = 100000; // 100 km (metre cinsinden)

          route.coordinates.forEach((coord, index) => {
            if (index > 0) {
              const prevCoord = route.coordinates[index - 1];
              totalDistance += prevCoord.distanceTo(coord);
            }

            if (totalDistance >= nextCheckpoint) {
                const checkpointMarker = L.marker(coord, { icon: yellowIcon })
                    .addTo(map)
                    .bindPopup(`Kontrol Noktası: ${Math.round(nextCheckpoint / 1000)} km`);
                checkpointMarkers.current.push(checkpointMarker);
                nextCheckpoint += 100000;
            }
          });
        });

        routingControl.current = control;
      }
      // DURUM 1: Henüz başlangıç noktası seçilmemişse (ilk tıklama)
      else {
        createStartMarker(e.latlng);
      }
    };

    map.on('click', handleMapClick);

    // Temizleme fonksiyonu: Bileşen kaldırıldığında olay dinleyicisini kaldırır.
    return () => {
      if (map) {
        map.off('click', handleMapClick);
      }
    };
  }, []); // Boş bağımlılık dizisi, bu etkinin yalnızca bir kez çalışmasını sağlar.

  return <div id="map" style={{ height: '100vh', width: '100vw' }} />;
};

export default Map;
