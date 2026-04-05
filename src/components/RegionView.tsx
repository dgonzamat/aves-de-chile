import React, { useState } from 'react';
import { MapPin, ChevronRight, ArrowLeft } from 'lucide-react';
import { REGIONES_CHILE } from '../constants';
import type { Bird, Filters } from '../types';

interface RegionViewProps {
  onSelectBird: (bird: Bird) => void;
  birds: Bird[];
  loading: boolean;
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
}

const REGION_DESCRIPTIONS: Record<string, string> = {
  'XV': 'Altiplano, flamencos, cóndores',
  'I': 'Desierto costero, aves marinas',
  'II': 'Desierto de Atacama, rapaces',
  'III': 'Zona semiárida, aves endémicas',
  'IV': 'Valles transversales, colibríes',
  'V': 'Costa central, aves pelágicas',
  'RM': 'Zona urbana y precordillera',
  'VI': 'Valles agrícolas, rapaces',
  'VII': 'Zona central, bosque esclerófilo',
  'XVI': 'Transición, humedales',
  'VIII': 'Bosques y costa, diversidad alta',
  'IX': 'Bosque templado, carpinteros',
  'XIV': 'Selva valdiviana, chucao',
  'X': 'Lagos y fiordos, cisnes',
  'XI': 'Patagonia norte, huemul',
  'XII': 'Patagonia austral, pingüinos',
};

export const RegionView = React.memo(function RegionView({ onSelectBird, birds, loading, filters, setFilters }: RegionViewProps) {
  const selectedRegion = filters.region;

  if (!selectedRegion) {
    return (
      <div className="animate-fade-in">
        <h2 className="text-lg font-bold text-gray-900 mb-1">Regiones de Chile</h2>
        <p className="text-sm text-gray-500 mb-5">Explora las aves por región, de norte a sur</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {REGIONES_CHILE.map((region) => (
            <button
              key={region.id}
              onClick={() => setFilters(prev => ({ ...prev, region: region.id }))}
              className="text-left p-4 rounded-2xl bg-white border border-gray-100 hover:border-emerald-200 hover:shadow-md transition-all group"
              style={{ boxShadow: 'var(--card-shadow)' }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--color-primary)' }} />
                    <span className="text-sm font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">
                      {region.nombre}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 ml-6">
                    {REGION_DESCRIPTIONS[region.id] || ''}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-emerald-500 transition-colors mt-0.5" />
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const regionName = REGIONES_CHILE.find(r => r.id === selectedRegion)?.nombre || '';

  return (
    <div className="animate-fade-in">
      <button
        onClick={() => setFilters(prev => ({ ...prev, region: '' }))}
        className="flex items-center gap-2 text-sm font-medium mb-4 hover:underline"
        style={{ color: 'var(--color-primary)' }}
      >
        <ArrowLeft className="w-4 h-4" />
        Volver a regiones
      </button>
      <div className="flex items-center gap-3 mb-5">
        <MapPin className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
        <div>
          <h2 className="text-lg font-bold text-gray-900">{regionName}</h2>
          <p className="text-xs text-gray-400">{REGION_DESCRIPTIONS[selectedRegion] || ''}</p>
        </div>
        {!loading && (
          <span className="results-pill ml-auto">
            {birds.length} {birds.length === 1 ? 'especie' : 'especies'}
          </span>
        )}
      </div>
    </div>
  );
});
