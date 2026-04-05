import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Bird } from '../types';

interface BirdMapViewProps {
  birds: Bird[];
  onSelectBird: (bird: Bird) => void;
  loading: boolean;
}

const CHILE_CENTER: [number, number] = [-35.5, -71.5];
const CHILE_ZOOM = 4;

function createBirdIcon() {
  return L.divIcon({
    className: 'bird-marker',
    html: `<div style="
      width: 32px; height: 32px;
      background: #1b6b4a;
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      display: flex; align-items: center; justify-content: center;
    ">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5">
        <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"/>
        <line x1="16" y1="8" x2="2" y2="22"/>
        <line x1="17.5" y1="15" x2="9" y2="15"/>
      </svg>
    </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18],
  });
}

export function BirdMapView({ birds, onSelectBird, loading }: BirdMapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);
  const birdIconRef = useRef<L.DivIcon | null>(null);

  // Init map
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    birdIconRef.current = createBirdIcon();

    const map = L.map(mapRef.current, {
      zoomControl: false,
    }).setView(CHILE_CENTER, CHILE_ZOOM);

    L.control.zoom({ position: 'topright' }).addTo(map);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 18,
    }).addTo(map);

    markersRef.current = L.layerGroup().addTo(map);
    mapInstance.current = map;

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, []);

  // Update markers when birds change
  useEffect(() => {
    if (!markersRef.current) return;

    markersRef.current.clearLayers();

    birds.forEach(bird => {
      if (bird.location.latitude === 0 && bird.location.longitude === 0) return;
      if (bird.location.latitude == null || bird.location.longitude == null) return;

      const marker = L.marker(
        [bird.location.latitude, bird.location.longitude],
        { icon: birdIconRef.current! }
      );

      const container = document.createElement('div');
      container.style.cssText = 'font-family: Plus Jakarta Sans, system-ui; min-width: 180px;';

      if (bird.photos[0]) {
        const img = document.createElement('img');
        img.src = bird.photos[0].url;
        img.alt = bird.species.commonName;
        img.style.cssText = 'width:100%;height:100px;object-fit:cover;border-radius:8px;margin-bottom:8px;';
        container.appendChild(img);
      }

      const name = document.createElement('div');
      name.textContent = bird.species.commonName;
      name.style.cssText = 'font-weight:700;font-size:13px;color:#111;';
      container.appendChild(name);

      const sciName = document.createElement('div');
      sciName.textContent = bird.species.name;
      sciName.style.cssText = 'font-size:11px;color:#888;font-style:italic;';
      container.appendChild(sciName);

      const location = document.createElement('div');
      location.textContent = bird.location.placeGuess || bird.location.region;
      location.style.cssText = 'font-size:11px;color:#666;margin-top:4px;';
      container.appendChild(location);

      const btn = document.createElement('button');
      btn.textContent = 'Ver detalles';
      btn.style.cssText = 'margin-top:8px;width:100%;padding:6px;background:#1b6b4a;color:white;border:none;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;';
      btn.addEventListener('click', () => window.__selectBird?.(bird.id));
      container.appendChild(btn);

      marker.bindPopup(container, {
        maxWidth: 220,
        className: 'bird-popup',
      });

      markersRef.current!.addLayer(marker);
    });
  }, [birds]);

  // Expose select handler to popup buttons
  useEffect(() => {
    (window as any).__selectBird = (id: number) => {
      const bird = birds.find(b => b.id === id);
      if (bird) onSelectBird(bird);
    };
    return () => { (window as any).__selectBird = undefined; };
  }, [birds, onSelectBird]);

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Mapa de Observaciones</h2>
          <p className="text-sm text-gray-500">
            {loading ? 'Cargando...' : birds.length === 0 ? 'Sin observaciones con ubicación' : `${birds.length} observaciones en Chile`}
          </p>
        </div>
      </div>
      <div
        ref={mapRef}
        className="w-full rounded-2xl overflow-hidden border border-gray-200"
        style={{ height: 'calc(100vh - 220px)', minHeight: '400px', boxShadow: 'var(--card-shadow)' }}
      />
    </div>
  );
}
