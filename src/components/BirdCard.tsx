import React, { useState } from 'react';
import { MapPin, Calendar, Eye, Feather } from 'lucide-react';
import type { Bird } from '../types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface BirdCardProps {
  bird: Bird;
  onClick?: () => void;
}

export const BirdCard = React.memo(function BirdCard({ bird, onClick }: BirdCardProps) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  return (
    <div className="bird-card group animate-fade-in" onClick={onClick}>
      {bird.photos[0] && (
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
          {!imgLoaded && !imgError && (
            <div className="absolute inset-0 skeleton" />
          )}
          {imgError && (
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center">
              <Feather className="w-10 h-10 text-emerald-300" />
            </div>
          )}
          <img
            src={bird.photos[0].url}
            alt={bird.species.commonName}
            className={`w-full h-full object-cover transition-opacity duration-300 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
            loading="lazy"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            onLoad={() => setImgLoaded(true)}
            onError={() => { setImgError(true); setImgLoaded(true); }}
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-1.5">
            {bird.species.threatened && (
              <span className="badge badge-danger">Amenazada</span>
            )}
            {bird.species.endemic && (
              <span className="badge badge-success">Endémica</span>
            )}
            {bird.species.native && !bird.species.endemic && (
              <span className="badge badge-native">Nativa</span>
            )}
          </div>

          {/* Attribution on hover */}
          {bird.photos[0].attribution && (
            <div className="photo-attribution">
              {bird.photos[0].attribution}
            </div>
          )}
        </div>
      )}

      <div className="p-4">
        <h3 className="text-base font-bold text-gray-900 group-hover:text-emerald-700 transition-colors leading-snug">
          {bird.species.commonName}
        </h3>
        <p className="text-xs text-gray-400 italic mt-0.5">
          {bird.species.name}
        </p>

        <div className="mt-3 space-y-1.5">
          <div className="flex items-center text-xs text-gray-500">
            <MapPin className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" style={{ color: 'var(--color-primary)' }} />
            <span className="truncate">{bird.location.placeGuess || bird.location.region}</span>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-gray-100">
            <div className="flex items-center">
              <Calendar className="w-3.5 h-3.5 mr-1.5" />
              <span>{format(new Date(bird.observedOn), "d MMM yyyy", { locale: es })}</span>
            </div>
            <div className="flex items-center">
              <Eye className="w-3.5 h-3.5 mr-1" />
              <span>{bird.observationsCount.toLocaleString('es-CL')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
