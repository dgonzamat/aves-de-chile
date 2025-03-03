import React from 'react';
import { Bird, Calendar, MapPin, Camera } from 'lucide-react';
import type { BirdObservation } from '../types';

interface ObservationListProps {
  observations: BirdObservation[];
}

export function ObservationList({ observations }: ObservationListProps) {
  return (
    <div className="space-y-4">
      {observations.map((obs) => (
        <div 
          key={`${obs.id}-${obs.obsDt}-${obs.locId}`}
          className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-lg text-gray-900">{obs.comName}</h3>
              <p className="text-sm text-gray-500 italic">{obs.sciName}</p>
            </div>
            {obs.howMany && (
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                {obs.howMany} {obs.howMany === 1 ? 'ave' : 'aves'}
              </span>
            )}
          </div>
          
          {obs.photoUrl && (
            <div className="mt-3">
              <img 
                src={obs.photoUrl} 
                alt={obs.comName}
                className="w-full h-48 object-cover rounded-lg"
              />
            </div>
          )}
          
          <div className="mt-3 space-y-2">
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="w-4 h-4 mr-2" />
              {obs.locName}
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="w-4 h-4 mr-2" />
              {new Date(obs.obsDt).toLocaleDateString('es-CL', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}