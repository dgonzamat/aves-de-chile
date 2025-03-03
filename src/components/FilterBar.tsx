import React from 'react';
import { Filter } from 'lucide-react';
import { REGIONES_CHILE } from '../constants';

interface FilterBarProps {
  region: string;
  onRegionChange: (region: string) => void;
}

export function FilterBar({ region, onRegionChange }: FilterBarProps) {
  return (
    <div className="bg-white shadow-sm rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-gray-500" />
          <span className="text-gray-700 font-medium">Filtros</span>
        </div>
        <select
          value={region}
          onChange={(e) => onRegionChange(e.target.value)}
          className="rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Todas las regiones</option>
          {REGIONES_CHILE.map(region => (
            <option key={region.id} value={region.id}>
              {region.nombre}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}