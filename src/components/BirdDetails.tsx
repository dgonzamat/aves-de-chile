import React, { useState, useEffect } from 'react';
import DOMPurify from 'dompurify';
import { ArrowLeft, MapPin, Calendar, ExternalLink, Volume2, Music, Shield, Globe, Eye, Users, BarChart3 } from 'lucide-react';
import { INaturalistApi } from '../services/iNaturalistApi';
import { SeasonChart } from './SeasonChart';
import type { BirdDetails as BirdDetailsType } from '../types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const api = new INaturalistApi();

interface BirdDetailsProps {
  bird: BirdDetailsType;
  onBack: () => void;
  onSelectSpecies?: (taxonId: number) => void;
}

export function BirdDetails({ bird, onBack, onSelectSpecies }: BirdDetailsProps) {
  const [seasonData, setSeasonData] = useState<Record<number, number>>({});
  const [similarSpecies, setSimilarSpecies] = useState<Array<{ id: number; name: string; commonName: string; photoUrl?: string }>>([]);
  const [stats, setStats] = useState<{ totalObservations: number; totalObservers: number; firstObserved?: string; lastObserved?: string } | null>(null);

  useEffect(() => {
    api.getSeasonalData(bird.id).then(setSeasonData).catch(() => {});
    api.getSimilarSpecies(bird.id).then(setSimilarSpecies).catch(() => {});
    api.getSpeciesStats(bird.id).then(setStats).catch(() => {});
  }, [bird.id]);

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <div className="relative rounded-2xl overflow-hidden mb-6">
        <button
          onClick={onBack}
          className="absolute top-4 left-4 z-10 w-10 h-10 rounded-xl bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-all shadow-lg"
          aria-label="Volver"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        {bird.defaultPhoto ? (
          <img src={bird.defaultPhoto} alt={bird.commonName} className="w-full h-56 sm:h-72 md:h-96 object-cover" />
        ) : (
          <div className="w-full h-56 sm:h-72 bg-gradient-to-br from-emerald-100 to-emerald-50 flex items-center justify-center">
            <Globe className="w-16 h-16 text-emerald-300" />
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6 bg-gradient-to-t from-black/70 via-black/30 to-transparent">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">{bird.commonName}</h2>
          <p className="text-white/70 italic text-sm mt-1">{bird.name}</p>
          <div className="flex gap-2 mt-3">
            {bird.threatened && <span className="badge badge-danger">Amenazada</span>}
            {bird.endemic && <span className="badge badge-success">Endémica</span>}
            {bird.conservationStatus && (
              <span className="badge" style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>
                <Shield className="w-3 h-3 inline mr-1" />{bird.conservationStatus}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Stats cards */}
      {stats && stats.totalObservations > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-white rounded-xl p-3 text-center" style={{ boxShadow: 'var(--card-shadow)' }}>
            <Eye className="w-4 h-4 mx-auto mb-1" style={{ color: 'var(--color-primary)' }} />
            <div className="text-lg font-bold text-gray-900">{stats.totalObservations.toLocaleString('es-CL')}</div>
            <div className="text-[10px] text-gray-400 uppercase tracking-wider">Observaciones</div>
          </div>
          <div className="bg-white rounded-xl p-3 text-center" style={{ boxShadow: 'var(--card-shadow)' }}>
            <Users className="w-4 h-4 mx-auto mb-1" style={{ color: 'var(--color-primary)' }} />
            <div className="text-lg font-bold text-gray-900">{stats.totalObservers.toLocaleString('es-CL')}</div>
            <div className="text-[10px] text-gray-400 uppercase tracking-wider">Observadores</div>
          </div>
          {stats.firstObserved && (
            <div className="bg-white rounded-xl p-3 text-center" style={{ boxShadow: 'var(--card-shadow)' }}>
              <Calendar className="w-4 h-4 mx-auto mb-1" style={{ color: 'var(--color-primary)' }} />
              <div className="text-sm font-bold text-gray-900">{format(new Date(stats.firstObserved), 'MMM yyyy', { locale: es })}</div>
              <div className="text-[10px] text-gray-400 uppercase tracking-wider">Primera obs.</div>
            </div>
          )}
          {stats.lastObserved && (
            <div className="bg-white rounded-xl p-3 text-center" style={{ boxShadow: 'var(--card-shadow)' }}>
              <BarChart3 className="w-4 h-4 mx-auto mb-1" style={{ color: 'var(--color-primary)' }} />
              <div className="text-sm font-bold text-gray-900">{format(new Date(stats.lastObserved), 'MMM yyyy', { locale: es })}</div>
              <div className="text-[10px] text-gray-400 uppercase tracking-wider">Última obs.</div>
            </div>
          )}
        </div>
      )}

      {/* Photo gallery */}
      {bird.observations.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 mb-6">
          {bird.observations.flatMap(obs => obs.photos).slice(0, 12).map((photo, i) => (
            <div key={i} className="aspect-square rounded-xl overflow-hidden">
              <img src={photo.url} alt={bird.commonName} className="w-full h-full object-cover hover:scale-110 transition-transform duration-300" loading="lazy" />
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          {bird.wikipediaSummary && (
            <div className="bg-white rounded-2xl p-5 sm:p-6" style={{ boxShadow: 'var(--card-shadow)' }}>
              <h3 className="text-base font-bold text-gray-900 mb-3">Descripción</h3>
              <p className="text-sm text-gray-600 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(bird.wikipediaSummary) }}
              />
              {bird.wikipediaUrl && (
                <a href={bird.wikipediaUrl} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 mt-4 text-sm font-semibold hover:underline"
                  style={{ color: 'var(--color-primary)' }}>
                  Leer más en Wikipedia <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          )}

          {/* Season chart */}
          {Object.keys(seasonData).length > 0 && <SeasonChart data={seasonData} />}

          {/* Similar species */}
          {similarSpecies.length > 0 && (
            <div className="bg-white rounded-2xl p-5 sm:p-6" style={{ boxShadow: 'var(--card-shadow)' }}>
              <h3 className="text-base font-bold text-gray-900 mb-4">Especies similares</h3>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {similarSpecies.map(sp => (
                  <button
                    key={sp.id}
                    onClick={() => onSelectSpecies?.(sp.id)}
                    className="text-center group"
                  >
                    {sp.photoUrl ? (
                      <div className="aspect-square rounded-xl overflow-hidden mb-1.5">
                        <img src={sp.photoUrl} alt={sp.commonName} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" loading="lazy" />
                      </div>
                    ) : (
                      <div className="aspect-square rounded-xl bg-gray-100 flex items-center justify-center mb-1.5">
                        <Globe className="w-6 h-6 text-gray-300" />
                      </div>
                    )}
                    <p className="text-[11px] font-semibold text-gray-700 group-hover:text-emerald-700 leading-tight">{sp.commonName}</p>
                    <p className="text-[9px] text-gray-400 italic">{sp.name}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Observations */}
          {bird.observations.length > 0 && (
            <div className="bg-white rounded-2xl p-5 sm:p-6" style={{ boxShadow: 'var(--card-shadow)' }}>
              <h3 className="text-base font-bold text-gray-900 mb-4">
                Observaciones recientes <span className="ml-2 text-xs font-normal text-gray-400">({bird.observations.length})</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {bird.observations.map(obs => (
                  <div key={obs.id} className="rounded-xl overflow-hidden border border-gray-100 hover:border-gray-200 transition-colors">
                    {obs.photos[0] && (
                      <div className="relative aspect-[16/10] overflow-hidden">
                        <img src={obs.photos[0].url} alt={bird.commonName} className="w-full h-full object-cover" loading="lazy" />
                        {obs.photos[0].attribution && (
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent text-white text-[10px] px-3 py-2">
                            {obs.photos[0].attribution}
                          </div>
                        )}
                      </div>
                    )}
                    <div className="p-3 space-y-1.5">
                      <div className="flex items-center text-xs text-gray-600">
                        <MapPin className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" style={{ color: 'var(--color-primary)' }} />
                        <span className="truncate">{obs.location.placeGuess || obs.location.region}</span>
                      </div>
                      <div className="flex items-center text-xs text-gray-400">
                        <Calendar className="w-3.5 h-3.5 mr-1.5" />
                        <span>{format(new Date(obs.observedOn), "d 'de' MMMM yyyy", { locale: es })}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {bird.sounds && bird.sounds.length > 0 && (
            <div className="bg-white rounded-2xl p-5" style={{ boxShadow: 'var(--card-shadow)' }}>
              <h3 className="text-base font-bold text-gray-900 mb-4">Sonidos</h3>
              <div className="space-y-3">
                {bird.sounds.map((sound, index) => (
                  <div key={sound.id} className="audio-card">
                    <div className="flex items-center gap-2 mb-2">
                      {sound.type === 'song' ? <Music className="w-4 h-4" style={{ color: 'var(--color-primary)' }} /> : <Volume2 className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />}
                      <span className="text-xs font-semibold text-gray-700">{sound.type === 'song' ? 'Canto' : 'Llamada'} {index + 1}</span>
                    </div>
                    <audio controls className="w-full h-9" src={sound.url}>Tu navegador no soporta audio.</audio>
                    {sound.attribution && <p className="mt-2 text-[10px] text-gray-400 leading-tight">{sound.attribution}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          <button onClick={onBack} className="w-full btn-primary flex items-center justify-center gap-2 lg:hidden">
            <ArrowLeft className="w-4 h-4" /> Volver al catálogo
          </button>
        </div>
      </div>
    </div>
  );
}
