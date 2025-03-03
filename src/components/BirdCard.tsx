import React from 'react';
import { MapPin, Calendar, Eye } from 'lucide-react';
import type { Bird } from '../types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface BirdCardProps {
  bird: Bird;
  onClick?: () => void;
}

export function BirdCard({ bird, onClick }: BirdCardProps) {
  return (
    <div 
      className="bird-card glass-card group animate-fade-in"
      onClick={onClick}
    >
      {bird.photos[0] && (
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={bird.photos[0].url}
            alt={bird.species.commonName}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute top-3 right-3 flex gap-2">
            {bird.species.threatened && (
              <span className="badge badge-danger transform transition-transform group-hover:scale-105">
                Amenazada
              </span>
            )}
            {bird.species.endemic && (
              <span className="badge badge-success transform transition-transform group-hover:scale-105">
                Endémica
              </span>
            )}
          </div>
          {bird.photos[0].attribution && (
            <div className="photo-attribution">
              {bird.photos[0].attribution}
            </div>
          )}
        </div>
      )}
      
      <div className="p-5 bg-gradient-to-b from-white to-gray-50">
        <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
          {bird.species.commonName}
        </h3>
        <p className="text-sm text-gray-500 italic mt-1">
          {bird.species.name}
        </p>
        
        <div className="mt-4 space-y-2">
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="w-4 h-4 mr-2 text-blue-500" />
            <span>{bird.location.region}</span>
          </div>
          {bird.location.placeGuess && (
            <p className="text-sm text-gray-600 pl-6">
              {bird.location.placeGuess}
            </p>
          )}
          <div className="flex items-center justify-between text-sm text-gray-600 pt-2 border-t border-gray-100">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2 text-blue-500" />
              <span>
                {format(new Date(bird.observedOn), "d 'de' MMMM 'de' yyyy", { locale: es })}
              </span>
            </div>
            <div className="flex items-center">
              <Eye className="w-4 h-4 mr-2 text-blue-500" />
              <span>{bird.observationsCount.toLocaleString('es-CL')} obs.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}