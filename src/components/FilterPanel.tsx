import React from 'react';
import type { Filters } from '../types';
import { REGIONES_CHILE } from '../constants';
import { HABITATS, CONSERVATION_STATUS, SEASONALITY } from '../types/index';

interface FilterPanelProps {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
}

export function FilterPanel({ filters, setFilters }: FilterPanelProps) {
  return (
    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-lg shadow-md mb-6 animate-fade-in">
      <h2 className="text-lg font-semibold mb-4">Filtros de búsqueda</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
            Nombre del ave
          </label>
          <input
            type="text"
            id="search"
            value={filters.searchTerm}
            onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
            placeholder="Nombre común o científico..."
            className="w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
          />
        </div>

        <div>
          <label htmlFor="observer" className="block text-sm font-medium text-gray-700 mb-1">
            Observador
          </label>
          <input
            type="text"
            id="observer"
            value={filters.observer}
            onChange={(e) => setFilters(prev => ({ ...prev, observer: e.target.value }))}
            placeholder="Nombre del observador..."
            className="w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
          />
        </div>
        
        <div>
          <label htmlFor="region" className="block text-sm font-medium text-gray-700 mb-1">
            Región
          </label>
          <select
            id="region"
            value={filters.region}
            onChange={(e) => setFilters(prev => ({ ...prev, region: e.target.value }))}
            className="w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
          >
            <option value="">Todas las regiones</option>
            {REGIONES_CHILE.map(region => (
              <option key={region.id} value={region.id}>
                {region.nombre}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="habitat" className="block text-sm font-medium text-gray-700 mb-1">
            Hábitat
          </label>
          <select
            id="habitat"
            value={filters.habitat}
            onChange={(e) => setFilters(prev => ({ ...prev, habitat: e.target.value }))}
            className="w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
          >
            <option value="">Todos los hábitats</option>
            {HABITATS.map(habitat => (
              <option key={habitat.id} value={habitat.id}>
                {habitat.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="conservation" className="block text-sm font-medium text-gray-700 mb-1">
            Estado de conservación
          </label>
          <select
            id="conservation"
            value={filters.conservationStatus}
            onChange={(e) => setFilters(prev => ({ ...prev, conservationStatus: e.target.value }))}
            className="w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
          >
            <option value="">Todos los estados</option>
            {CONSERVATION_STATUS.map(status => (
              <option key={status.id} value={status.id}>
                {status.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="seasonality" className="block text-sm font-medium text-gray-700 mb-1">
            Temporada
          </label>
          <select
            id="seasonality"
            value={filters.seasonality}
            onChange={(e) => setFilters(prev => ({ ...prev, seasonality: e.target.value }))}
            className="w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
          >
            <option value="">Todas las temporadas</option>
            {SEASONALITY.map(season => (
              <option key={season.id} value={season.id}>
                {season.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
            Fecha inicial
          </label>
          <input
            type="date"
            id="startDate"
            value={filters.startDate}
            onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
            min="2005-01-01"
            max="2030-12-31"
            className="w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
          />
        </div>

        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
            Fecha final
          </label>
          <input
            type="date"
            id="endDate"
            value={filters.endDate}
            onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
            min="2005-01-01"
            max="2030-12-31"
            className="w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
          />
        </div>
      </div>
    </div>
  );
}