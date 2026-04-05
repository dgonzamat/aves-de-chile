import React, { useState, useEffect } from 'react';
import { ArrowLeft, Feather } from 'lucide-react';
import { INaturalistApi } from '../services/iNaturalistApi';
import { BirdCard } from './BirdCard';
import type { Bird } from '../types';

const api = new INaturalistApi();

interface FamilyInfo {
  id: number;
  name: string;
  commonName: string;
  count: number;
  photoUrl?: string;
}

interface FamilyViewProps {
  onSelectBird: (bird: Bird) => void;
}

export function FamilyView({ onSelectBird }: FamilyViewProps) {
  const [families, setFamilies] = useState<FamilyInfo[]>([]);
  const [selectedFamily, setSelectedFamily] = useState<FamilyInfo | null>(null);
  const [familyBirds, setFamilyBirds] = useState<Bird[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingBirds, setLoadingBirds] = useState(false);

  useEffect(() => {
    async function fetchFamilies() {
      try {
        setLoading(true);
        const data = await api.getBirdFamilies();
        setFamilies(data);
      } catch (err) {
        console.error('Error fetching families:', err);
        setFamilies([]);
      } finally {
        setLoading(false);
      }
    }
    fetchFamilies();
  }, []);

  const handleSelectFamily = async (family: FamilyInfo) => {
    setSelectedFamily(family);
    setLoadingBirds(true);
    try {
      const birds = await api.getBirdsByTaxon(family.id, { per_page: 50 });
      setFamilyBirds(birds);
    } catch {
      setFamilyBirds([]);
    } finally {
      setLoadingBirds(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="skeleton h-24 rounded-2xl" />
        ))}
      </div>
    );
  }

  if (selectedFamily) {
    return (
      <div className="animate-fade-in">
        <button
          onClick={() => { setSelectedFamily(null); setFamilyBirds([]); }}
          className="flex items-center gap-2 text-sm font-medium mb-4 hover:underline"
          style={{ color: 'var(--color-primary)' }}
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a familias
        </button>
        <div className="flex items-center gap-3 mb-5">
          <Feather className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
          <div>
            <h2 className="text-lg font-bold text-gray-900">{selectedFamily.commonName}</h2>
            <p className="text-xs text-gray-400 italic">{selectedFamily.name}</p>
          </div>
          {!loadingBirds && (
            <span className="results-pill ml-auto">
              {familyBirds.length} {familyBirds.length === 1 ? 'especie' : 'especies'}
            </span>
          )}
        </div>

        {loadingBirds ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton rounded-2xl">
                <div className="aspect-[4/3] bg-gray-200" />
                <div className="p-5 space-y-3">
                  <div className="h-5 bg-gray-200 rounded-lg w-3/4" />
                  <div className="h-3 bg-gray-200 rounded-lg w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : familyBirds.length === 0 ? (
          <p className="text-center text-gray-500 py-12">No se encontraron observaciones para esta familia.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {familyBirds.map(bird => (
              <BirdCard key={bird.id} bird={bird} onClick={() => onSelectBird(bird)} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <h2 className="text-lg font-bold text-gray-900 mb-1">Familias de Aves</h2>
      <p className="text-sm text-gray-500 mb-5">
        {families.length} familias observadas en Chile
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {families.map(family => (
          <button
            key={family.id}
            onClick={() => handleSelectFamily(family)}
            className="text-left rounded-2xl bg-white border border-gray-100 hover:border-emerald-200 hover:shadow-md transition-all overflow-hidden group"
            style={{ boxShadow: 'var(--card-shadow)' }}
          >
            {family.photoUrl ? (
              <div className="aspect-[3/2] overflow-hidden bg-gray-100">
                <img
                  src={family.photoUrl}
                  alt={family.commonName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              </div>
            ) : (
              <div className="aspect-[3/2] bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center">
                <Feather className="w-8 h-8 text-emerald-300" />
              </div>
            )}
            <div className="p-3">
              <h3 className="text-sm font-bold text-gray-900 group-hover:text-emerald-700 transition-colors leading-snug">
                {family.commonName}
              </h3>
              <p className="text-[11px] text-gray-400 italic">{family.name}</p>
              <p className="text-[11px] text-gray-400 mt-1">{family.count.toLocaleString('es-CL')} obs.</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
