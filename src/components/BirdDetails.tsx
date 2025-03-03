import React from 'react';
import { ArrowLeft, MapPin, Calendar, ExternalLink, Volume2, Music } from 'lucide-react';
import type { BirdDetails as BirdDetailsType } from '../types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface BirdDetailsProps {
  bird: BirdDetailsType;
  onBack: () => void;
}

export function BirdDetails({ bird, onBack }: BirdDetailsProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="relative">
        <button
          onClick={onBack}
          className="absolute top-4 left-4 z-10 bg-white/80 p-2 rounded-full hover:bg-white transition-colors"
          aria-label="Volver"
        >
          <ArrowLeft className="w-6 h-6 text-gray-700" />
        </button>
        {bird.defaultPhoto && (
          <img
            src={bird.defaultPhoto}
            alt={bird.commonName}
            className="w-full h-64 object-cover"
          />
        )}
      </div>

      <div className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{bird.commonName}</h2>
            <p className="text-gray-600 italic">{bird.name}</p>
          </div>
          <div className="flex gap-2">
            {bird.threatened && (
              <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                Amenazada
              </span>
            )}
            {bird.endemic && (
              <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                Endémica
              </span>
            )}
          </div>
        </div>

        {bird.wikipediaSummary && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Descripción</h3>
            <p className="text-gray-700">{bird.wikipediaSummary}</p>
            {bird.wikipediaUrl && (
              <a
                href={bird.wikipediaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center mt-2 text-blue-600 hover:text-blue-800"
              >
                Leer más en Wikipedia
                <ExternalLink className="w-4 h-4 ml-1" />
              </a>
            )}
          </div>
        )}

        {bird.sounds && bird.sounds.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Sonidos</h3>
            <div className="grid grid-cols-1 gap-4">
              {bird.sounds.map((sound, index) => (
                <div key={sound.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      {sound.type === 'song' ? (
                        <Music className="w-5 h-5 text-blue-600 mr-2" />
                      ) : (
                        <Volume2 className="w-5 h-5 text-blue-600 mr-2" />
                      )}
                      <span className="text-sm font-medium text-gray-900">
                        {sound.type === 'song' ? 'Canto' : 'Llamada'} {index + 1}
                      </span>
                    </div>
                  </div>
                  <audio
                    controls
                    className="w-full"
                    src={sound.url}
                  >
                    Tu navegador no soporta el elemento de audio.
                  </audio>
                  {sound.attribution && (
                    <p className="mt-2 text-xs text-gray-500">
                      {sound.attribution}
                    </p>
                  )}
                  {sound.description && (
                    <p className="mt-1 text-sm text-gray-600">
                      {sound.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Observaciones recientes</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bird.observations.map(obs => (
              <div key={obs.id} className="bg-gray-50 rounded-lg p-4">
                {obs.photos[0] && (
                  <div className="relative">
                    <img
                      src={obs.photos[0].url}
                      alt={bird.commonName}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    {obs.photos[0].attribution && (
                      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-2 rounded-b-lg">
                        {obs.photos[0].attribution}
                      </div>
                    )}
                  </div>
                )}
                <div className="mt-3">
                  <div className="flex items-center text-gray-600 mb-2">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>{obs.location.region}</span>
                  </div>
                  {obs.location.placeGuess && (
                    <p className="text-sm text-gray-600 ml-6 mb-2">
                      {obs.location.placeGuess}
                    </p>
                  )}
                  <div className="flex items-center text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>
                      {format(new Date(obs.observedOn), "d 'de' MMMM 'de' yyyy", { locale: es })}
                    </span>
                  </div>
                  {obs.sounds && obs.sounds.length > 0 && (
                    <div className="mt-2">
                      {obs.sounds.map((sound, index) => (
                        <div key={index} className="mt-2">
                          <audio
                            controls
                            className="w-full"
                            src={sound.url}
                          >
                            Tu navegador no soporta el elemento de audio.
                          </audio>
                          {sound.attribution && (
                            <p className="mt-1 text-xs text-gray-500">
                              {sound.attribution}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}