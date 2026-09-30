import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
export default function SatelliteMap({ satellites = [] }) {
  const ref = useRef();
  const layerRef = useRef();
  useEffect(() => {
    if (!ref.current) return;
    const map = L.map(ref.current).setView([20, 78], 3);
    L.tileLayer('https://tile.openstreetmap.de/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 18,
    }).addTo(map);
    layerRef.current = L.layerGroup().addTo(map);
    return () => {
      layerRef.current?.clearLayers();
      map.remove();
      layerRef.current = null;
    };
  }, []);
  useEffect(() => {
    if (!layerRef.current) return;
    layerRef.current.clearLayers();
    satellites
      .filter((s) => s.lastPosition)
      .forEach((s) =>
        L.marker([s.lastPosition.latitude, s.lastPosition.longitude])
          .addTo(layerRef.current)
          .bindPopup(`<b>${s.name}</b><br>NORAD ${s.noradId}`),
      );
  }, [satellites]);
  return <div ref={ref} className="map" />;
}
