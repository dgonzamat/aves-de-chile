import React from 'react';
import { RotateCcw } from 'lucide-react';
import type { Filters } from '../types';
import { REGIONES_CHILE, MESES, ORDER_OPTIONS } from '../constants';
import { CONSERVATION_STATUS } from '../types/index';

interface FilterPanelProps {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
}

const defaultFilters: Filters = {
  startDate: '2005-01-01',
  endDate: '2026-12-31',
  region: '',
  searchTerm: '',
  conservationStatus: '',
  endemic: '',
  threatened: '',
  native: '',
  qualityGrade: '',
  month: '',
  orderBy: 'votes',
};

export function FilterPanel({ filters, setFilters }: FilterPanelProps) {
  const hasActiveFilters =
    filters.region || filters.conservationStatus || filters.endemic ||
    filters.threatened || filters.native || filters.qualityGrade || filters.month ||
    filters.startDate !== defaultFilters.startDate || filters.endDate !== defaultFilters.endDate ||
    filters.orderBy !== 'votes';

  return (
    <div className="filter-panel animate-slide-down">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-gray-900">Filtros</h2>
        {hasActiveFilters && (
          <button
            onClick={() => setFilters(prev => ({ ...defaultFilters, searchTerm: prev.searchTerm }))}
            className="flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-gray-600 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            Limpiar
          </button>
        )}
      </div>

      {/* Row 1: Location & Conservation */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-3">
        <div>
          <label htmlFor="region" className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
            Región
          </label>
          <select
            id="region"
            value={filters.region}
            onChange={(e) => setFilters(prev => ({ ...prev, region: e.target.value }))}
            className="filter-select"
          >
            <option value="">Todas</option>
            {REGIONES_CHILE.map(region => (
              <option key={region.id} value={region.id}>{region.nombre}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="conservation" className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
            Conservación
          </label>
          <select
            id="conservation"
            value={filters.conservationStatus}
            onChange={(e) => setFilters(prev => ({ ...prev, conservationStatus: e.target.value }))}
            className="filter-select"
          >
            <option value="">Todos</option>
            {CONSERVATION_STATUS.map(status => (
              <option key={status.id} value={status.id}>{status.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="endemic" className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
            Endémica
          </label>
          <select
            id="endemic"
            value={filters.endemic}
            onChange={(e) => setFilters(prev => ({ ...prev, endemic: e.target.value }))}
            className="filter-select"
          >
            <option value="">Todas</option>
            <option value="true">Solo endémicas</option>
            <option value="false">No endémicas</option>
          </select>
        </div>

        <div>
          <label htmlFor="threatened" className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
            Amenazada
          </label>
          <select
            id="threatened"
            value={filters.threatened}
            onChange={(e) => setFilters(prev => ({ ...prev, threatened: e.target.value }))}
            className="filter-select"
          >
            <option value="">Todas</option>
            <option value="true">Solo amenazadas</option>
            <option value="false">No amenazadas</option>
          </select>
        </div>
      </div>

      {/* Row 2: Origin, Quality, Month, Order */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div>
          <label htmlFor="native" className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
            Origen
          </label>
          <select
            id="native"
            value={filters.native}
            onChange={(e) => setFilters(prev => ({ ...prev, native: e.target.value }))}
            className="filter-select"
          >
            <option value="">Todas</option>
            <option value="native">Nativas</option>
            <option value="introduced">Introducidas</option>
          </select>
        </div>

        <div>
          <label htmlFor="quality" className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
            Calidad
          </label>
          <select
            id="quality"
            value={filters.qualityGrade}
            onChange={(e) => setFilters(prev => ({ ...prev, qualityGrade: e.target.value }))}
            className="filter-select"
          >
            <option value="">Todas</option>
            <option value="research">Research grade</option>
            <option value="needs_id">Necesita ID</option>
          </select>
        </div>

        <div>
          <label htmlFor="month" className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
            Mes
          </label>
          <select
            id="month"
            value={filters.month}
            onChange={(e) => setFilters(prev => ({ ...prev, month: e.target.value }))}
            className="filter-select"
          >
            <option value="">Todos</option>
            {MESES.map(mes => (
              <option key={mes.id} value={mes.id}>{mes.nombre}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="startDate" className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
            Desde
          </label>
          <input
            type="date"
            id="startDate"
            value={filters.startDate}
            onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
            min="2005-01-01"
            max="2030-12-31"
            className="filter-input"
          />
        </div>

        <div>
          <label htmlFor="endDate" className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
            Hasta
          </label>
          <input
            type="date"
            id="endDate"
            value={filters.endDate}
            onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
            min="2005-01-01"
            max="2030-12-31"
            className="filter-input"
          />
        </div>
      </div>

      {/* Order row */}
      <div className="mt-3 pt-3 border-t border-gray-100">
        <div className="flex items-center gap-3">
          <label htmlFor="orderBy" className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
            Ordenar por
          </label>
          <select
            id="orderBy"
            value={filters.orderBy}
            onChange={(e) => setFilters(prev => ({ ...prev, orderBy: e.target.value }))}
            className="filter-select max-w-xs"
          >
            {ORDER_OPTIONS.map(opt => (
              <option key={opt.id} value={opt.id}>{opt.nombre}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
