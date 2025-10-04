'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import 'leaflet-routing-machine';

// Bu, Leaflet'in varsayılan ikon yollarını Webpack gibi paketleyicilerde düzeltmek için standart bir çözümdür.
// İşaretçi ikonlarının doğru görüntülenmesini sağlar.
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const Map = () => {
  // Yeniden render tetiklememesi gereken harita örneği, işaretçiler ve rota kontrolü gibi
  // Leaflet'e özgü nesneleri saklamak için useRef kullanıyoruz.
  const mapRef = useRef<L.Map | null>(null);
  const startPoint = useRef<L.LatLng | null>(null);
  const endPoint = useRef<L.LatLng | null>(null);
  const startMarker = useRef<L.Marker | null>(null);
  const endMarker = useRef<L.Marker | null>(null);
  const routingControl = useRef<L.Routing.Control | null>(null);

  // Boş bağımlılık dizisine sahip useEffect kancası, bileşen DOM'a eklendikten sonra yalnızca bir kez çalışır.
  // Bu, 'map' div'inin DOM'da bulunması garanti edildiği için haritayı başlatmak için doğru yerdir.
  useEffect(() => {
    // Harita zaten başlatılmışsa, tekrar başlatmayı önle.
    if (mapRef.current) return;

    // Haritayı 'map' div'i üzerinde başlat
    mapRef.current = L.map('map').setView([30, 10], 2);

    // OpenStreetMap katmanını haritaya ekle
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(mapRef.current);

    // Harita tıklama olaylarını yönetecek fonksiyon
    const handleMapClick = (e: L.LeafletMouseEvent) => {
      // DURUM 3: Başlangıç ve bitiş noktaları zaten seçiliyse (üçüncü tıklama - Sıfırlama)
      if (startPoint.current && endPoint.current) {
        // Mevcut katmanları ve kontrolü haritadan temizle
        if (mapRef.current) {
          if (startMarker.current) mapRef.current.removeLayer(startMarker.current);
          if (endMarker.current) mapRef.current.removeLayer(endMarker.current);
          if (routingControl.current) mapRef.current.removeControl(routingControl.current);
        }

        // Tüm referans değerlerini başlangıç durumuna döndür
        startPoint.current = null;
        endPoint.current = null;
        startMarker.current = null;
        endMarker.current = null;
        routingControl.current = null;

        // Bu tıklama yeni başlangıç noktası olur
        startPoint.current = e.latlng;
        if (mapRef.current) {
          startMarker.current = L.marker(startPoint.current)
            .addTo(mapRef.current)
            .bindPopup('Başlangıç Noktası')
            .openPopup();
        }
      }
      // DURUM 2: Başlangıç seçilmiş ama bitiş seçilmemişse (ikinci tıklama)
      else if (startPoint.current && !endPoint.current) {
        endPoint.current = e.latlng;
        if (mapRef.current) {
          endMarker.current = L.marker(endPoint.current)
            .addTo(mapRef.current)
            .bindPopup('Bitiş Noktası')
            .openPopup();

          // Rota çizimini başlat
          routingControl.current = L.Routing.control({
            waypoints: [startPoint.current, endPoint.current],
             // Kendi özel işaretçilerimizi kullandığımız için eklentinin varsayılan işaretçilerini oluşturmasını engelle
            createMarker: function () {
              return null;
            },
          }).addTo(mapRef.current);
        }
      }
      // DURUM 1: Henüz başlangıç noktası seçilmemişse (ilk tıklama)
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

    // Tıklama olay dinleyicisini haritaya bağla
    mapRef.current.on('click', handleMapClick);

    // Temizleme fonksiyonu: Bileşen kaldırıldığında çağrılır.
    // Bellek sızıntılarını önlemek için önemlidir.
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []); // Boş bağımlılık dizisi, bu etkinin yalnızca bir kez çalışmasını sağlar.

  // Leaflet haritasının render edileceği div
  return <div id="map" style={{ height: '100vh', width: '100vw' }} />;
};

export default Map;
