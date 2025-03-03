import React, { useState, useEffect } from 'react';
import { BirdIcon, Search, ChevronLeft, ChevronRight, SortAsc, Calendar, ListFilter, Filter, X } from 'lucide-react';
import { INaturalistApi } from './services/iNaturalistApi';
import { BirdCard } from './components/BirdCard';
import { BirdDetails } from './components/BirdDetails';
import { FilterPanel } from './components/FilterPanel';
import type { Bird, BirdDetails as BirdDetailsType, Filters } from './types';

const api = new INaturalistApi();
const BIRDS_PER_PAGE = 50;

type SortOrder = 'asc' | 'desc';
type SortType = 'alphabetical' | 'taxonomic';

function App() {
  const [birds, setBirds] = useState<Bird[]>([]);
  const [selectedBird, setSelectedBird] = useState<BirdDetailsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [sortType, setSortType] = useState<SortType>('alphabetical');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    startDate: '2005-01-01',
    endDate: '2026-12-31',
    region: '',
    searchTerm: '',
    habitat: '',
    observer: '',
    conservationStatus: '',
    seasonality: ''
  });

  useEffect(() => {
    async function fetchBirds() {
      try {
        setLoading(true);
        const data = await api.getBirds({ 
          q: filters.searchTerm,
          per_page: BIRDS_PER_PAGE,
          page: currentPage,
          order: sortOrder,
          order_by: sortType === 'taxonomic' ? 'species' : 'views'
        });

        // Filter by date range and other criteria
        const filteredData = data.filter(bird => {
          const observationDate = new Date(bird.observedOn);
          const meetsDateRange = observationDate >= new Date(filters.startDate) && 
                               observationDate <= new Date(filters.endDate);
          
          const meetsConservationStatus = !filters.conservationStatus || 
                                        bird.species.conservationStatus === filters.conservationStatus;
          
          const meetsRegion = !filters.region || 
                             bird.location.region.toLowerCase().includes(filters.region.toLowerCase());

          return meetsDateRange && meetsConservationStatus && meetsRegion;
        });

        // Sort based on selected criteria
        const sortedData = [...filteredData].sort((a, b) => {
          if (sortType === 'taxonomic') {
            return sortOrder === 'asc'
              ? a.species.name.localeCompare(b.species.name)
              : b.species.name.localeCompare(a.species.name);
          } else {
            const nameA = a.species.commonName.toLowerCase();
            const nameB = b.species.commonName.toLowerCase();
            return sortOrder === 'asc'
              ? nameA.localeCompare(nameB)
              : nameB.localeCompare(nameA);
          }
        });

        setBirds(sortedData);
        setTotalResults(sortedData.length);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar los datos');
      } finally {
        setLoading(false);
      }
    }

    const debounceTimeout = setTimeout(fetchBirds, 300);
    return () => clearTimeout(debounceTimeout);
  }, [filters, currentPage, sortOrder, sortType]);

  const totalPages = Math.ceil(totalResults / BIRDS_PER_PAGE);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBirdSelect = async (bird: Bird) => {
    try {
      setLoading(true);
      const details = await api.getBirdDetails(bird.species.id);
      setSelectedBird(details);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar los detalles');
    } finally {
      setLoading(false);
    }
  };

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  const toggleSortType = () => {
    setSortType(prev => prev === 'alphabetical' ? 'taxonomic' : 'alphabetical');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-radial from-blue-50 to-gray-50">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600 font-medium">Cargando catálogo de aves...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-radial from-red-50 to-gray-50">
        <div className="text-center space-y-4 p-8 rounded-xl bg-white/80 backdrop-blur-sm shadow-lg">
          <p className="text-red-600 font-medium">Error: {error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md hover:shadow-lg"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-50">
      <header className="header-nav">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <BirdIcon className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                Aves de Chile By iNaturalist
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2 rounded-lg transition-colors duration-200 flex items-center space-x-2 ${
                  showFilters ? 'bg-blue-100 text-blue-700' : 'bg-white hover:bg-gray-50'
                }`}
                title="Mostrar/ocultar filtros"
              >
                {showFilters ? (
                  <>
                    <X className="w-5 h-5" />
                    <span className="text-sm hidden sm:inline">Cerrar filtros</span>
                  </>
                ) : (
                  <>
                    <Filter className="w-5 h-5" />
                    <span className="text-sm hidden sm:inline">Filtros</span>
                  </>
                )}
              </button>
              <div className="flex items-center space-x-2">
                <button
                  onClick={toggleSortType}
                  className="p-2 rounded-lg bg-white shadow-sm hover:bg-gray-50 transition-colors duration-200 flex items-center space-x-2"
                  title={sortType === 'alphabetical' ? 'Cambiar a orden taxonómico' : 'Cambiar a orden alfabético'}
                >
                  <ListFilter className="w-5 h-5" />
                  <span className="text-sm hidden sm:inline">
                    {sortType === 'alphabetical' ? 'Alfabético' : 'Taxonómico'}
                  </span>
                </button>
                <button
                  onClick={toggleSortOrder}
                  className="p-2 rounded-lg bg-white shadow-sm hover:bg-gray-50 transition-colors duration-200 flex items-center"
                  title={sortOrder === 'asc' ? 'Ordenar Z-A' : 'Ordenar A-Z'}
                >
                  <SortAsc className={`w-5 h-5 ${sortOrder === 'desc' ? 'transform rotate-180' : ''}`} />
                </button>
              </div>
              <div className="relative w-72">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Buscar por género o especie..."
                  value={filters.searchTerm}
                  onChange={(e) => {
                    setFilters(prev => ({ ...prev, searchTerm: e.target.value }));
                    setCurrentPage(1);
                  }}
                  className="search-input"
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showFilters && (
          <div className="mb-6 animate-fade-in">
            <FilterPanel filters={filters} setFilters={setFilters} />
          </div>
        )}

        {selectedBird ? (
          <BirdDetails 
            bird={selectedBird} 
            onBack={() => setSelectedBird(null)} 
          />
        ) : birds.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">
              No se encontraron especies que coincidan con tu búsqueda.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {birds.map((bird, index) => (
                <div key={bird.id} style={{ animationDelay: `${index * 100}ms` }}>
                  <BirdCard
                    bird={bird}
                    onClick={() => handleBirdSelect(bird)}
                  />
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center space-x-4">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg bg-white shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-sm text-gray-600">
                  Página {currentPage} de {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg bg-white shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        )}
      </main>

      <footer className="bg-white/80 backdrop-blur-sm border-t border-gray-200/50 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-600">
            Desarrollado por Daniel González Amat
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;