import React from 'react';
import { MapPin } from 'lucide-react';
import type { Hotspot } from '../types';

interface MapProps {
  hotspots: Hotspot[];
  onHotspotClick: (hotspot: Hotspot) => void;
}

export function Map({ hotspots, onHotspotClick }: MapProps) {
  return (
    <div className="relative w-full h-[600px] bg-blue-50 rounded-lg overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-1.2.1&auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center opacity-20" />
      
      {/* Placeholder for actual map - would use a real map library in production */}
      <div className="relative h-full p-4">
        {hotspots.map((hotspot) => (
          <button
            key={hotspot.locId}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 group"
            style={{
              left: `${(hotspot.longitude + 180) * (100 / 360)}%`,
              top: `${(90 - hotspot.latitude) * (100 / 180)}%`
            }}
            onClick={() => onHotspotClick(hotspot)}
          >
            <MapPin 
              className="w-6 h-6 text-red-500 transition-transform group-hover:scale-125" 
            />
            <span className="absolute left-1/2 -translate-x-1/2 mt-1 px-2 py-1 bg-white rounded shadow-md text-sm opacity-0 group-hover:opacity-100 transition-opacity">
              {hotspot.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}