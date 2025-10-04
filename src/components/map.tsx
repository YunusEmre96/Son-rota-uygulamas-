'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';

// Leaflet'in varsayılan ikon ayarlarını düzeltme (Next.js ile uyumluluk için)
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
    if (mapRef.current) return; // Harita zaten başlatıldıysa tekrar başlatma

    // Haritayı başlat
    mapRef.current = L.map('map').setView([30, 10], 2);

    // Harita katmanını ekle
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(mapRef.current);

    // Leaflet Routing Machine'i dinamik olarak yükle
    import('leaflet-routing-machine').then((L) => {
        // Bu blok, kütüphane yüklendikten sonra çalışır.
    });

    // Harita tıklama olayını yönet
    const handleMapClick = (e: L.LeafletMouseEvent) => {
      const clickedPos = e.latlng;

      // Durum 3: Sıfırlama (3. tıklama)
      if (startPoint.current && endPoint.current) {
        // Mevcut işaretçileri ve rotayı kaldır
        if (startMarker.current) mapRef.current?.removeLayer(startMarker.current);
        if (endMarker.current) mapRef.current?.removeLayer(endMarker.current);
        if (routingControl.current) mapRef.current?.removeControl(routingControl.current);
        
        // Değişkenleri sıfırla
        startMarker.current = null;
        endMarker.current = null;
        routingControl.current = null;
        startPoint.current = null;
        endPoint.current = null;
        
        // Yeni başlangıç noktasını ayarla
        startPoint.current = clickedPos;
        startMarker.current = L.marker(clickedPos)
          .addTo(mapRef.current!)
          .bindPopup('Başlangıç Noktası')
          .openPopup();
        return;
      }

      // Durum 1: Başlangıç noktası belirleme (1. tıklama)
      if (!startPoint.current) {
        startPoint.current = clickedPos;
        startMarker.current = L.marker(clickedPos)
          .addTo(mapRef.current!)
          .bindPopup('Başlangıç Noktası')
          .openPopup();
        return;
      }

      // Durum 2: Bitiş noktası belirleme ve rota çizme (2. tıklama)
      if (!endPoint.current) {
        endPoint.current = clickedPos;
        endMarker.current = L.marker(clickedPos)
          .addTo(mapRef.cvurrent!)
          .bindPopup('Bitiş Noktası')
          .openPopup();

        // Rota çizimini başlat
        if (mapRef.current && startPoint.current && endPoint.current) {
          import('leaflet-routing-machine').then((Routing) => {
            if (mapRef.current) {
                 routingControl.current = Routing.control({
                    waypoints: [startPoint.current!, endPoint.current!],
                    routeWhileDragging: false,
                    // Kendi özel işaretçilerimizi kullandığımız için
                    // routing machine'in varsayılan işaretçilerini devre dışı bırak
                    createMarker: function () {
                      return null;
                    },
                  }).addTo(mapRef.current);
            }
          });
        }
      }
    };

    mapRef.current.on('click', handleMapClick);

    // Bileşen kaldırıldığında haritayı temizle
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return <div id="map" style={{ height: '100%', width: '100%' }} />;
};

export default Map;
