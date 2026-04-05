import React from 'react';
import { ArrowLeft, MapPin, Calendar, Eye, ExternalLink, Feather, Share2 } from 'lucide-react';
import type { Bird } from '../types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ObservationDetailProps {
  bird: Bird;
  onBack: () => void;
  onViewSpecies: () => void;
}

export function ObservationDetail({ bird, onBack, onViewSpecies }: ObservationDetailProps) {
  return (
    <div className="animate-fade-in">
      {/* Hero photo */}
      <div className="relative rounded-2xl overflow-hidden mb-6">
        <button
          onClick={onBack}
          className="absolute top-4 left-4 z-10 w-10 h-10 rounded-xl bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-all shadow-lg"
          aria-label="Volver"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        {bird.photos[0] ? (
          <img
            src={bird.photos[0].url}
            alt={bird.species.commonName}
            className="w-full h-56 sm:h-72 md:h-96 object-cover"
          />
        ) : (
          <div className="w-full h-56 sm:h-72 bg-gradient-to-br from-emerald-100 to-emerald-50 flex items-center justify-center">
            <Feather className="w-16 h-16 text-emerald-300" />
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6 bg-gradient-to-t from-black/70 via-black/30 to-transparent">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">{bird.species.commonName}</h2>
          <p className="text-white/70 italic text-sm mt-1">{bird.species.name}</p>
          <div className="flex gap-2 mt-3">
            {bird.species.threatened && (
              <span className="badge badge-danger">Amenazada</span>
            )}
            {bird.species.endemic && (
              <span className="badge badge-success">Endémica</span>
            )}
          </div>
        </div>
      </div>

      {/* Photo gallery */}
      {bird.photos.length > 1 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 mb-6">
          {bird.photos.slice(1).map((photo, i) => (
            <div key={i} className="aspect-square rounded-xl overflow-hidden">
              <img src={photo.url} alt={bird.species.commonName} className="w-full h-full object-cover hover:scale-110 transition-transform duration-300" loading="lazy" />
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: observation info */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl p-5 sm:p-6" style={{ boxShadow: 'var(--card-shadow)' }}>
            <h3 className="text-base font-bold text-gray-900 mb-4">Detalles del avistamiento</h3>
            <div className="space-y-3">
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="w-4 h-4 mr-2.5 flex-shrink-0" style={{ color: 'var(--color-primary)' }} />
                <span>{bird.location.placeGuess || bird.location.region}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="w-4 h-4 mr-2.5 flex-shrink-0" style={{ color: 'var(--color-primary)' }} />
                <span>{format(new Date(bird.observedOn), "d 'de' MMMM yyyy", { locale: es })}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Eye className="w-4 h-4 mr-2.5 flex-shrink-0" style={{ color: 'var(--color-primary)' }} />
                <span>{bird.observationsCount.toLocaleString('es-CL')} observaciones de esta especie</span>
              </div>
              {bird.location.latitude !== 0 && bird.location.longitude !== 0 && (
                <div className="flex items-center text-sm text-gray-400">
                  <span className="ml-6.5">
                    {bird.location.latitude.toFixed(4)}, {bird.location.longitude.toFixed(4)}
                  </span>
                </div>
              )}
            </div>
            {bird.photos[0]?.attribution && (
              <p className="mt-4 pt-3 border-t border-gray-100 text-xs text-gray-400">
                Foto: {bird.photos[0].attribution}
              </p>
            )}
          </div>

          {/* Sounds if any */}
          {bird.sounds && bird.sounds.length > 0 && (
            <div className="bg-white rounded-2xl p-5" style={{ boxShadow: 'var(--card-shadow)' }}>
              <h3 className="text-base font-bold text-gray-900 mb-3">Sonidos</h3>
              <div className="space-y-3">
                {bird.sounds.map((sound, i) => (
                  <div key={i} className="audio-card">
                    <audio controls className="w-full h-9" src={sound.url}>
                      Tu navegador no soporta audio.
                    </audio>
                    {sound.attribution && (
                      <p className="mt-1 text-[10px] text-gray-400">{sound.attribution}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: link to species */}
        <div className="space-y-4">
          <button
            onClick={onViewSpecies}
            className="w-full btn-primary flex items-center justify-center gap-2"
          >
            <Feather className="w-4 h-4" />
            Ver ficha de la especie
          </button>

          <a
            href={`https://www.inaturalist.org/observations/${bird.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl text-sm font-semibold border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 transition-all"
            style={{ color: 'var(--color-primary)' }}
          >
            <ExternalLink className="w-4 h-4" />
            Ver en iNaturalist
          </a>

          {typeof navigator.share === 'function' && (
            <button
              onClick={() => navigator.share({
                title: `${bird.species.commonName} - Aves de Chile`,
                text: `Avistamiento de ${bird.species.commonName} (${bird.species.name}) en ${bird.location.placeGuess || bird.location.region}`,
                url: `https://www.inaturalist.org/observations/${bird.id}`
              }).catch(() => {})}
              className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl text-sm font-semibold border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 transition-all"
              style={{ color: 'var(--color-primary)' }}
            >
              <Share2 className="w-4 h-4" />
              Compartir
            </button>
          )}

          <button
            onClick={onBack}
            className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-50 transition-all lg:hidden"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al catálogo
          </button>
        </div>
      </div>
    </div>
  );
}
