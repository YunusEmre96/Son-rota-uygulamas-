'use client';

import { MapContainer, TileLayer, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import L from 'leaflet';
import { useEffect } from 'react';
import 'leaflet-routing-machine';

// Leaflet'in varsayılan ikon ayarlarını düzelterek, ikonların doğru görüntülenmesini sağlıyoruz.
// Bu, özellikle Webpack gibi paketleyicilerle çalışırken sık karşılaşılan bir sorunu çözer.
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Rota çizim mantığını yönetecek ayrı bir bileşen.
function Routing() {
  // useMap, üst MapContainer bileşeninin harita örneğini (map instance) verir.
  const map = useMapEvents({
    // Haritaya her tıklandığında bu fonksiyon çalışır.
    click(e) {
      // Harita üzerinde daha önce oluşturulmuş bir rota kontrolü var mı diye bakarız.
      const routingControl = (map as any)._routing;
      if (!routingControl) return;

      // Mevcut ara noktaları (waypoints) alırız.
      const waypoints = routingControl.getWaypoints();
      const newWaypoint = e.latlng;

      if (!waypoints.length || waypoints[0].latLng === null) {
        // Eğer hiç başlangıç noktası yoksa, tıklanan yeri başlangıç noktası olarak ayarla.
        routingControl.setWaypoints([L.latLng(newWaypoint.lat, newWaypoint.lng)]);
      } else if (waypoints.length < 2 || waypoints[1].latLng === null) {
        // Eğer başlangıç var ama bitiş yoksa, tıklanan yeri bitiş noktası olarak ayarla ve rotayı çiz.
        routingControl.setWaypoints([waypoints[0].latLng, L.latLng(newWaypoint.lat, newWaypoint.lng)]);
      } else {
        // Eğer hem başlangıç hem bitiş varsa, her şeyi sıfırla ve tıklanan yeri yeni başlangıç noktası yap.
        routingControl.setWaypoints([L.latLng(newWaypoint.lat, newWaypoint.lng), null]);
      }
    },
  });

  useEffect(() => {
    if (!map) return;
    
    // Eğer harita üzerinde _routing adında bir kontrol yoksa, yenisini oluştur.
    // Bu, React'in geliştirme modundaki çift render etme sorununu engeller.
    if (!(map as any)._routing) {
        const routingControl = L.Routing.control({
            waypoints: [null, null], // Başlangıçta boş ara noktalar
            routeWhileDragging: true, // Sürüklerken rotayı güncelle
            show: true, // Kontrol panelini göster
            lineOptions: {
                styles: [{ color: 'hsl(var(--primary))', opacity: 1, weight: 5 }] // Rota çizgisinin stili
            },
            createMarker: function(i, waypoint, n) {
                // Başlangıç ve bitiş için özel ikonlar
                return L.marker(waypoint.latLng, {
                  draggable: true,
                  icon: new L.Icon.Default()
                });
            }
        }).addTo(map);
        // Oluşturulan kontrolü harita örneğine kaydediyoruz.
        (map as any)._routing = routingControl;
    }

  }, [map]);

  return null; // Bu bileşen ekranda bir şey göstermez, sadece haritayı yönetir.
}

export default function Map() {
    return (
        <MapContainer
            center={[41.0082, 28.9784]} // Haritanın başlangıç merkezi (İstanbul)
            zoom={13} // Başlangıç zoom seviyesi
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
