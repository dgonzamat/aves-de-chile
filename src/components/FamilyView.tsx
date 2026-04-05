import React, { useState, useEffect } from 'react';
import { ArrowLeft, Feather, ChevronRight } from 'lucide-react';
import { INaturalistApi } from '../services/iNaturalistApi';
import { BirdCard } from './BirdCard';
import type { Bird } from '../types';

const api = new INaturalistApi();

interface TaxonInfo {
  id: number;
  name: string;
  commonName: string;
  count: number;
  photoUrl?: string;
}

interface FamilyViewProps {
  onSelectBird: (bird: Bird) => void;
}

type Level = 'orders' | 'families' | 'species';

export const FamilyView = React.memo(function FamilyView({ onSelectBird }: FamilyViewProps) {
  const [orders, setOrders] = useState<TaxonInfo[]>([]);
  const [families, setFamilies] = useState<TaxonInfo[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<TaxonInfo | null>(null);
  const [selectedFamily, setSelectedFamily] = useState<TaxonInfo | null>(null);
  const [familyBirds, setFamilyBirds] = useState<Bird[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingFamilies, setLoadingFamilies] = useState(false);
  const [loadingBirds, setLoadingBirds] = useState(false);
  const [level, setLevel] = useState<Level>('orders');

  useEffect(() => {
    async function fetchOrders() {
      try {
        setLoading(true);
        const data = await api.getBirdOrders();
        setOrders(data);
      } catch {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  const handleSelectOrder = async (order: TaxonInfo) => {
    setSelectedOrder(order);
    setLevel('families');
    setLoadingFamilies(true);
    try {
      const data = await api.getBirdFamilies(order.id);
      setFamilies(data);
    } catch {
      setFamilies([]);
    } finally {
      setLoadingFamilies(false);
    }
  };

  const handleSelectFamily = async (family: TaxonInfo) => {
    setSelectedFamily(family);
    setLevel('species');
    setLoadingBirds(true);
    try {
      const { birds } = await api.getBirdsByTaxon(family.id, { per_page: 50 });
      setFamilyBirds(birds);
    } catch {
      setFamilyBirds([]);
    } finally {
      setLoadingBirds(false);
    }
  };

  const goBack = () => {
    if (level === 'species') {
      setLevel('families');
      setSelectedFamily(null);
      setFamilyBirds([]);
    } else if (level === 'families') {
      setLevel('orders');
      setSelectedOrder(null);
      setFamilies([]);
    }
  };

  const renderTaxonGrid = (items: TaxonInfo[], onSelect: (item: TaxonInfo) => void) => (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {items.map(item => (
        <button
          key={item.id}
          onClick={() => onSelect(item)}
          className="text-left rounded-2xl bg-white border border-gray-100 hover:border-emerald-200 hover:shadow-md transition-all overflow-hidden group"
          style={{ boxShadow: 'var(--card-shadow)' }}
        >
          {item.photoUrl ? (
            <div className="aspect-[3/2] overflow-hidden bg-gray-100">
              <img src={item.photoUrl} alt={item.commonName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
            </div>
          ) : (
            <div className="aspect-[3/2] bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center">
              <Feather className="w-8 h-8 text-emerald-300" />
            </div>
          )}
          <div className="p-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900 group-hover:text-emerald-700 transition-colors leading-snug flex-1">
                {item.commonName}
              </h3>
              <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-emerald-500 flex-shrink-0" />
            </div>
            <p className="text-[11px] text-gray-400 italic">{item.name}</p>
            <p className="text-[11px] text-gray-400 mt-1">{item.count.toLocaleString('es-CL')} obs.</p>
          </div>
        </button>
      ))}
    </div>
  );

  const renderSkeleton = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="skeleton rounded-2xl">
          <div className="aspect-[3/2] bg-gray-200" />
          <div className="p-3 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-3 bg-gray-200 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );

  // Breadcrumb
  const breadcrumb = (
    <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-4">
      <button onClick={() => { setLevel('orders'); setSelectedOrder(null); setSelectedFamily(null); }} className="hover:text-emerald-600 font-medium">
        Órdenes
      </button>
      {selectedOrder && (
        <>
          <ChevronRight className="w-3 h-3" />
          <button onClick={() => { setLevel('families'); setSelectedFamily(null); }} className="hover:text-emerald-600 font-medium">
            {selectedOrder.commonName}
          </button>
        </>
      )}
      {selectedFamily && (
        <>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-600 font-medium">{selectedFamily.commonName}</span>
        </>
      )}
    </div>
  );

  if (loading) return renderSkeleton();

  return (
    <div className="animate-fade-in">
      {level !== 'orders' && (
        <>
          <button onClick={goBack} className="flex items-center gap-2 text-sm font-medium mb-2 hover:underline" style={{ color: 'var(--color-primary)' }}>
            <ArrowLeft className="w-4 h-4" /> Volver
          </button>
          {breadcrumb}
        </>
      )}

      {level === 'orders' && (
        <>
          <h2 className="text-lg font-bold text-gray-900 mb-1">Taxonomía de Aves</h2>
          <p className="text-sm text-gray-500 mb-5">{orders.length} órdenes observados en Chile</p>
          {renderTaxonGrid(orders, handleSelectOrder)}
        </>
      )}

      {level === 'families' && (
        <>
          <div className="flex items-center gap-3 mb-5">
            <Feather className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
            <div>
              <h2 className="text-lg font-bold text-gray-900">{selectedOrder?.commonName}</h2>
              <p className="text-xs text-gray-400 italic">{selectedOrder?.name}</p>
            </div>
          </div>
          {loadingFamilies ? renderSkeleton() : families.length === 0 ? (
            <p className="text-center text-gray-500 py-12">No se encontraron familias.</p>
          ) : renderTaxonGrid(families, handleSelectFamily)}
        </>
      )}

      {level === 'species' && (
        <>
          <div className="flex items-center gap-3 mb-5">
            <Feather className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
            <div>
              <h2 className="text-lg font-bold text-gray-900">{selectedFamily?.commonName}</h2>
              <p className="text-xs text-gray-400 italic">{selectedFamily?.name}</p>
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
        </>
      )}
    </div>
  );
});
