import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import type { BirdObservation } from '../types';
import L from 'leaflet';

// Fix for default marker icons
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = defaultIcon;

interface BirdMapProps {
  observation: BirdObservation;
  className?: string;
}

export function BirdMap({ observation, className = 'h-[300px]' }: BirdMapProps) {
  // Intentar obtener coordenadas de diferentes fuentes
  const coordinates = React.useMemo(() => {
    // 1. Usar coordenadas directas de la observación si están disponibles
    if (observation.latitude && observation.longitude) {
      return {
        lat: observation.latitude,
        lng: observation.longitude,
        source: 'observation'
      };
    }

    // 2. Intentar obtener coordenadas de los metadatos de la foto
    const photo = observation.photos?.[0];
    if (photo?.metadata?.gps_latitude && photo?.metadata?.gps_longitude) {
      return {
        lat: photo.metadata.gps_latitude,
        lng: photo.metadata.gps_longitude,
        source: 'photo'
      };
    }

    return null;
  }, [observation]);

  if (!coordinates) {
    return (
      <div className="bg-gray-100 rounded-lg p-4 text-center text-gray-600">
        No hay datos de ubicación disponibles
      </div>
    );
  }

  return (
    <div className="w-full h-[300px] relative rounded-lg overflow-hidden">
      <MapContainer
        center={[coordinates.lat, coordinates.lng]}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[coordinates.lat, coordinates.lng]}>
          <Popup>
            <div className="text-sm">
              <p className="font-semibold">
                {observation.taxon?.vernacular_name || observation.taxon?.preferred_common_name}
              </p>
              <p>{observation.place_guess}</p>
              <p className="text-gray-600">
                {new Date(observation.observed_on).toLocaleDateString('es-CL')}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Fuente: {coordinates.source === 'photo' ? 'Metadatos de la foto' : 'Datos de observación'}
              </p>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}