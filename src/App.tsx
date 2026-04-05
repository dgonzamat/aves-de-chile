import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Bird as BirdIcon, Search, ChevronLeft, ChevronRight, SlidersHorizontal, X, Feather, Map as MapIcon, Grid3X3, MapPin } from 'lucide-react';
import { INaturalistApi } from './services/iNaturalistApi';
import { BirdCard } from './components/BirdCard';
import { BirdDetails } from './components/BirdDetails';
import { ObservationDetail } from './components/ObservationDetail';
import { FilterPanel } from './components/FilterPanel';
import { RegionView } from './components/RegionView';
import { FamilyView } from './components/FamilyView';
import { BirdMapView } from './components/BirdMapView';
import { REGIONES_CHILE } from './constants';
import type { Bird, BirdDetails as BirdDetailsType, Filters } from './types';

const api = new INaturalistApi();
const BIRDS_PER_PAGE = 50;

type ViewTab = 'catalog' | 'regions' | 'families' | 'map';

const TABS: { id: ViewTab; label: string; icon: React.ReactNode }[] = [
  { id: 'catalog', label: 'Catálogo', icon: <Grid3X3 className="w-4 h-4" /> },
  { id: 'regions', label: 'Regiones', icon: <MapPin className="w-4 h-4" /> },
  { id: 'families', label: 'Familias', icon: <Feather className="w-4 h-4" /> },
  { id: 'map', label: 'Mapa', icon: <MapIcon className="w-4 h-4" /> },
];

function SkeletonCard() {
  return (
    <div className="skeleton animate-fade-in">
      <div className="aspect-[4/3] bg-gray-200" />
      <div className="p-5 space-y-3">
        <div className="h-5 bg-gray-200 rounded-lg w-3/4" />
        <div className="h-3 bg-gray-200 rounded-lg w-1/2" />
        <div className="h-3 bg-gray-200 rounded-lg w-full mt-4" />
        <div className="h-3 bg-gray-200 rounded-lg w-2/3" />
      </div>
    </div>
  );
}

function App() {
  const [birds, setBirds] = useState<Bird[]>([]);
  const [selectedBird, setSelectedBird] = useState<BirdDetailsType | null>(null);
  const [selectedObservation, setSelectedObservation] = useState<Bird | null>(null);
  const [loadingBirds, setLoadingBirds] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [topSpecies, setTopSpecies] = useState<Array<{ id: number; name: string; commonName: string; count: number; photoUrl?: string }>>([]);
  const [suggestions, setSuggestions] = useState<Array<{ id: number; name: string; commonName: string; photoUrl?: string }>>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [activeTab, setActiveTab] = useState<ViewTab>('catalog');
  const detailsCache = useRef<Map<number, BirdDetailsType>>(new Map());
  const searchRef = useRef<HTMLInputElement>(null);
  const [filters, setFilters] = useState<Filters>({
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
  });

  const activeFilterCount = [
    filters.region,
    filters.conservationStatus,
    filters.endemic,
    filters.threatened,
    filters.native,
    filters.qualityGrade,
    filters.month,
    filters.startDate !== '2005-01-01' ? filters.startDate : '',
    filters.endDate !== '2026-12-31' ? filters.endDate : '',
  ].filter(Boolean).length;

  const getRegionName = (regionId: string): string => {
    const region = REGIONES_CHILE.find(r => r.id === regionId);
    return region ? region.nombre : '';
  };

  useEffect(() => {
    if (showSearch && searchRef.current) searchRef.current.focus();
  }, [showSearch]);

  useEffect(() => {
    const currentMonth = new Date().getMonth() + 1;
    api.getTopSpecies(currentMonth).then(setTopSpecies).catch(() => {});
  }, []);

  useEffect(() => {
    if (!filters.searchTerm || filters.searchTerm.length < 2) {
      setSuggestions([]);
      return;
    }
    const timeout = setTimeout(() => {
      api.searchSpecies(filters.searchTerm).then((results) => {
        setSuggestions(results);
        setShowSuggestions(results.length > 0);
      }).catch(() => {});
    }, 200);
    return () => clearTimeout(timeout);
  }, [filters.searchTerm]);

  useEffect(() => {
    if (selectedBird) {
      document.title = `${selectedBird.commonName} | Aves de Chile`;
    } else if (selectedObservation) {
      document.title = `${selectedObservation.species.commonName} - Avistamiento | Aves de Chile`;
    } else {
      document.title = 'Aves de Chile | iNaturalist';
    }
  }, [selectedBird, selectedObservation]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters.region, filters.conservationStatus, filters.endemic, filters.threatened, filters.native, filters.qualityGrade, filters.month, filters.startDate, filters.endDate, filters.orderBy]);

  useEffect(() => {
    async function fetchBirds() {
      try {
        setLoadingBirds(true);
        const regionCoords = filters.region
          ? REGIONES_CHILE.find(r => r.id === filters.region)
          : null;

        const apiParams: Parameters<typeof api.getBirds>[0] = {
          q: filters.searchTerm || undefined,
          per_page: BIRDS_PER_PAGE,
          page: currentPage,
          order: 'desc',
          order_by: filters.orderBy || 'votes',
          ...(regionCoords ? { lat: regionCoords.lat, lng: regionCoords.lng, radius: 150 } : {}),
          ...(filters.endemic ? { endemic: filters.endemic === 'true' } : {}),
          ...(filters.threatened ? { threatened: filters.threatened === 'true' } : {}),
          ...(filters.native === 'native' ? { native: true } : {}),
          ...(filters.native === 'introduced' ? { introduced: true } : {}),
          ...(filters.qualityGrade ? { quality_grade: filters.qualityGrade } : {}),
          ...(filters.month ? { month: Number(filters.month) } : {}),
          ...(filters.startDate !== '2005-01-01' ? { d1: filters.startDate } : {}),
          ...(filters.endDate !== '2026-12-31' ? { d2: filters.endDate } : {}),
        };

        const { birds: data, totalResults: apiTotal } = await api.getBirds(apiParams);

        // Conservation status is not a server-side param, filter client-side
        const filteredData = filters.conservationStatus
          ? data.filter(bird => bird.species.conservationStatus === filters.conservationStatus)
          : data;

        setBirds(filteredData);
        setTotalResults(filters.conservationStatus ? filteredData.length : apiTotal);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar los datos');
      } finally {
        setLoadingBirds(false);
      }
    }

    const debounceTimeout = setTimeout(fetchBirds, 300);
    return () => clearTimeout(debounceTimeout);
  }, [filters, currentPage]);

  const totalPages = Math.ceil(totalResults / BIRDS_PER_PAGE);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBirdSelect = useCallback((bird: Bird) => {
    setSelectedObservation(bird);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const navigateToSpecies = useCallback(async (taxonId: number) => {
    const cached = detailsCache.current.get(taxonId);
    if (cached) { setSelectedBird(cached); setSelectedObservation(null); window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    try {
      setLoadingDetails(true);
      const details = await api.getBirdDetails(taxonId);
      detailsCache.current.set(taxonId, details);
      setSelectedBird(details);
      setSelectedObservation(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar los detalles');
    } finally {
      setLoadingDetails(false);
    }
  }, []);

  const handleViewSpecies = useCallback(async (bird: Bird) => {
    navigateToSpecies(bird.species.id);
  }, [navigateToSpecies]);

  const handleTabChange = (tab: ViewTab) => {
    setActiveTab(tab);
    setSelectedBird(null);
    setSelectedObservation(null);
    if (tab !== 'catalog' && tab !== 'map') {
      setShowSearch(false);
    }
  };

  const showToolbar = activeTab === 'catalog' || activeTab === 'map';

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--color-bg)' }}>
      {/* Header */}
      <header className="header-nav">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => { setSelectedBird(null); setSelectedObservation(null); setActiveTab('catalog'); }}
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--color-primary)' }}>
                <Feather className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-base sm:text-lg font-bold text-gray-900">Aves de Chile</h1>
            </div>

            {showToolbar && (
              <div className="flex items-center gap-2">
                <button onClick={() => setShowSearch(!showSearch)} className="btn-icon md:hidden" aria-label="Buscar">
                  <Search className="w-4 h-4" />
                </button>
                <div className="hidden md:block relative w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Buscar especie..."
                    value={filters.searchTerm}
                    onChange={(e) => { setFilters(prev => ({ ...prev, searchTerm: e.target.value })); setCurrentPage(1); }}
                    onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    className="search-input"
                  />
                  {filters.searchTerm && (
                    <button onClick={() => { setFilters(prev => ({ ...prev, searchTerm: '' })); setSuggestions([]); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-50 animate-slide-down">
                      {suggestions.map(sp => (
                        <button
                          key={sp.id}
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            setFilters(prev => ({ ...prev, searchTerm: sp.commonName }));
                            setShowSuggestions(false);
                            setCurrentPage(1);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 hover:bg-emerald-50 transition-colors text-left"
                        >
                          {sp.photoUrl ? (
                            <img src={sp.photoUrl} alt={sp.commonName} className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-gray-100 flex-shrink-0" />
                          )}
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-800 truncate">{sp.commonName}</p>
                            <p className="text-[10px] text-gray-400 italic truncate">{sp.name}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`btn-icon ${showFilters ? 'active' : ''}`}
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  <span className="hidden sm:inline text-xs">Filtros</span>
                  {activeFilterCount > 0 && (
                    <span className="w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center text-white" style={{ background: 'var(--color-primary)' }}>
                      {activeFilterCount}
                    </span>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 -mb-px overflow-x-auto scrollbar-hide" role="tablist">
            {TABS.map(tab => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={activeTab === tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold whitespace-nowrap border-b-2 transition-all ${
                  activeTab === tab.id
                    ? 'border-current text-emerald-700'
                    : 'border-transparent text-gray-400 hover:text-gray-600'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Mobile search */}
          {showSearch && showToolbar && (
            <div className="md:hidden pb-3 animate-slide-down">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  ref={searchRef}
                  type="text"
                  placeholder="Buscar especie..."
                  value={filters.searchTerm}
                  onChange={(e) => { setFilters(prev => ({ ...prev, searchTerm: e.target.value })); setCurrentPage(1); }}
                  className="search-input"
                />
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        {/* Filters (catalog only) */}
        {showFilters && (
          <div className="animate-slide-down">
            <FilterPanel filters={filters} setFilters={setFilters} />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-between gap-4 animate-fade-in">
            <p className="text-red-700 text-sm font-medium">{error}</p>
            <button onClick={() => { setError(null); window.location.reload(); }} className="btn-primary whitespace-nowrap" style={{ background: 'var(--color-danger)' }}>
              Reintentar
            </button>
          </div>
        )}

        {/* Details overlay */}
        {loadingDetails && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center backdrop-blur-sm">
            <div className="bg-white p-8 rounded-2xl shadow-2xl text-center space-y-4 animate-fade-in">
              <div className="w-14 h-14 border-[3px] rounded-full animate-spin mx-auto" style={{ borderColor: 'var(--color-primary-light)', borderTopColor: 'var(--color-primary)' }} />
              <p className="text-gray-600 font-medium text-sm">Cargando detalles...</p>
            </div>
          </div>
        )}

        {/* Detail view (any tab) */}
        {selectedBird ? (
          <BirdDetails
            bird={selectedBird}
            onBack={() => setSelectedBird(null)}
            onSelectSpecies={navigateToSpecies}
          />
        ) : selectedObservation ? (
          <ObservationDetail
            bird={selectedObservation}
            onBack={() => setSelectedObservation(null)}
            onViewSpecies={() => handleViewSpecies(selectedObservation)}
          />
        ) : (
          <>
            {/* ===== CATALOG TAB ===== */}
            {activeTab === 'catalog' && (
              <>
                {/* Top species this month */}
                {topSpecies.length > 0 && currentPage === 1 && !filters.searchTerm && (
                  <div className="mb-6">
                    <h3 className="text-sm font-bold text-gray-900 mb-3">
                      Más observadas este mes
                    </h3>
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                      {topSpecies.map((sp, i) => (
                        <button
                          key={sp.id}
                          onClick={() => navigateToSpecies(sp.id)}
                          className="flex-shrink-0 w-20 text-center group"
                        >
                          <div className="relative w-16 h-16 mx-auto rounded-full overflow-hidden border-2 border-gray-100 group-hover:border-emerald-400 transition-colors">
                            {sp.photoUrl ? (
                              <img src={sp.photoUrl} alt={sp.commonName} className="w-full h-full object-cover" loading="lazy" />
                            ) : (
                              <div className="w-full h-full bg-emerald-50 flex items-center justify-center text-sm font-bold text-emerald-300">{i + 1}</div>
                            )}
                          </div>
                          <p className="mt-1 text-[10px] font-semibold text-gray-600 group-hover:text-emerald-700 leading-tight line-clamp-2">{sp.commonName}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {!loadingBirds && birds.length > 0 && (
                  <div className="flex items-center justify-between mb-5">
                    <div className="results-pill">
                      <BirdIcon className="w-3.5 h-3.5" />
                      <span>{totalResults} {totalResults === 1 ? 'especie' : 'especies'}</span>
                    </div>
                    <span className="text-xs text-gray-400">Pag. {currentPage} de {totalPages || 1}</span>
                  </div>
                )}

                {loadingBirds ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
                  </div>
                ) : birds.length === 0 ? (
                  <div className="text-center py-20 animate-fade-in">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ background: 'var(--color-primary-light)' }}>
                      <Search className="w-8 h-8" style={{ color: 'var(--color-primary)' }} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Sin resultados</h3>
                    <p className="text-gray-500 text-sm max-w-sm mx-auto">
                      No encontramos especies con estos criterios.
                    </p>
                    <button
                      onClick={() => setFilters({ startDate: '2005-01-01', endDate: '2026-12-31', region: '', searchTerm: '', conservationStatus: '', endemic: '', threatened: '', native: '', qualityGrade: '', month: '', orderBy: 'votes' })}
                      className="btn-primary mt-6"
                    >
                      Limpiar filtros
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                      {birds.map(bird => (
                        <BirdCard key={bird.id} bird={bird} onClick={() => handleBirdSelect(bird)} />
                      ))}
                    </div>
                    {totalPages > 1 && (
                      <div className="mt-8 flex items-center justify-center gap-3">
                        <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="pagination-btn" aria-label="Página anterior">
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                          let page: number;
                          if (totalPages <= 5) page = i + 1;
                          else if (currentPage <= 3) page = i + 1;
                          else if (currentPage >= totalPages - 2) page = totalPages - 4 + i;
                          else page = currentPage - 2 + i;
                          return (
                            <button
                              key={page}
                              onClick={() => handlePageChange(page)}
                              className={`w-10 h-10 rounded-xl text-sm font-semibold transition-all ${
                                page === currentPage ? 'text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'
                              }`}
                              style={page === currentPage ? { background: 'var(--color-primary)' } : {}}
                            >
                              {page}
                            </button>
                          );
                        })}
                        <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="pagination-btn" aria-label="Página siguiente">
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </>
                )}
              </>
            )}

            {/* ===== REGIONS TAB ===== */}
            {activeTab === 'regions' && (
              <>
                <RegionView
                  onSelectBird={handleBirdSelect}
                  birds={birds}
                  loading={loadingBirds}
                  filters={filters}
                  setFilters={setFilters}
                />
                {filters.region && !loadingBirds && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-4">
                    {birds.map(bird => (
                      <BirdCard key={bird.id} bird={bird} onClick={() => handleBirdSelect(bird)} />
                    ))}
                  </div>
                )}
                {filters.region && loadingBirds && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-4">
                    {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
                  </div>
                )}
              </>
            )}

            {/* ===== FAMILIES TAB ===== */}
            {activeTab === 'families' && (
              <FamilyView onSelectBird={handleBirdSelect} />
            )}

            {/* ===== MAP TAB ===== */}
            {activeTab === 'map' && (
              <BirdMapView birds={birds} onSelectBird={handleBirdSelect} loading={loadingBirds} />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200/60 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-400">
            <p>Desarrollado por Daniel González Amat</p>
            <p>Datos de <a href="https://www.inaturalist.org" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-600">iNaturalist</a></p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
