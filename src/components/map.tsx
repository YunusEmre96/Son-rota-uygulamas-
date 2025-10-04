'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import 'leaflet-routing-machine';

// Leaflet'in varsayılan ikon yollarını Webpack gibi paketleyicilerde düzeltmek için standart çözüm.
// Bu, işaretçi ikonlarının doğru görüntülenmesini sağlar.
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const Map = () => {
  const mapRef = useRef<L.Map | null>(null);
  const startPoint = useRef<L.LatLng | null>(null);
  const endPoint = useRef<L.LatLng | null>(null);
  const startMarker = useRef<L.Marker | null>(null);
  const endMarker = useRef<L.Marker | null>(null);
  const routingControl = useRef<L.Routing.Control | null>(null);

  useEffect(() => {
    // Harita zaten başlatılmışsa tekrar başlatmayı önle.
    if (!mapRef.current) {
      mapRef.current = L.map('map').setView([30, 10], 2);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(mapRef.current);
    }

    const handleMapClick = (e: L.LeafletMouseEvent) => {
      const map = mapRef.current;
      if (!map) return;

      // DURUM 3: Başlangıç ve bitiş seçiliyse (üçüncü tıklama - Sıfırlama)
      if (startPoint.current && endPoint.current) {
        // Haritayı temizle
        if (startMarker.current) map.removeLayer(startMarker.current);
        if (endMarker.current) map.removeLayer(endMarker.current);
        if (routingControl.current) map.removeControl(routingControl.current);
        
        // Değişkenleri sıfırla
        startPoint.current = null;
        endPoint.current = null;
        startMarker.current = null;
        endMarker.current = null;
        routingControl.current = null;

        // Yeni başlangıç noktasını ayarla
        startPoint.current = e.latlng;
        startMarker.current = L.marker(startPoint.current)
          .addTo(map)
          .bindPopup('Başlangıç Noktası')
          .openPopup();
      }
      // DURUM 2: Başlangıç seçilmiş ama bitiş seçilmemişse (ikinci tıklama)
      else if (startPoint.current && !endPoint.current) {
        endPoint.current = e.latlng;
        endMarker.current = L.marker(endPoint.current)
          .addTo(map)
          .bindPopup('Bitiş Noktası')
          .openPopup();

        // Rota çizimini başlat
        routingControl.current = L.Routing.control({
            waypoints: [startPoint.current, endPoint.current],
            routeWhileDragging: true,
            createMarker: function() { return null; }
        }).addTo(map);

      }
      // DURUM 1: Henüz başlangıç noktası seçilmemişse (ilk tıklama)
      else {
        startPoint.current = e.latlng;
        startMarker.current = L.marker(startPoint.current)
          .addTo(map)
          .bindPopup('Başlangıç Noktası')
          .openPopup();
      }
    };

    mapRef.current.on('click', handleMapClick);

    // Temizleme fonksiyonu: Bileşen kaldırıldığında olay dinleyicisini kaldırır.
    return () => {
      if (mapRef.current) {
        mapRef.current.off('click', handleMapClick);
      }
    };
  }, []); // Boş bağımlılık dizisi, bu etkinin yalnızca bir kez çalışmasını sağlar.

  return <div id="map" style={{ height: '100vh', width: '100vw' }} />;
};

export default Map;
