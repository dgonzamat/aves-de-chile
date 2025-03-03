import { REGIONES_CHILE } from '../constants';

export interface Bird {
  id: number;
  species: {
    id: number;
    name: string;
    commonName: string;
    conservationStatus?: string;
    endemic?: boolean;
    native?: boolean;
    introduced?: boolean;
    threatened?: boolean;
  };
  location: {
    latitude: number;
    longitude: number;
    placeGuess?: string;
    region: string;
  };
  photos: Array<{
    url: string;
    attribution?: string;
  }>;
  sounds?: Array<{
    url: string;
    attribution?: string;
    type?: string;
  }>;
  observedOn: string;
  quality: string;
  votes: number;
  observationsCount: number;
}

export interface BirdDetails {
  id: number;
  name: string;
  commonName: string;
  wikipediaSummary?: string;
  wikipediaUrl?: string;
  conservationStatus?: string;
  endemic?: boolean;
  native?: boolean;
  introduced?: boolean;
  threatened?: boolean;
  defaultPhoto?: string;
  sounds: Array<{
    id: number;
    url: string;
    attribution?: string;
    type?: string;
    description?: string;
  }>;
  observations: Array<{
    id: number;
    location: {
      latitude: number;
      longitude: number;
      placeGuess?: string;
      region: string;
    };
    photos: Array<{
      url: string;
      attribution?: string;
    }>;
    sounds?: Array<{
      url: string;
      attribution?: string;
      type?: string;
    }>;
    observedOn: string;
    quality: string;
  }>;
}

export interface Filters {
  startDate: string;
  endDate: string;
  region: string;
  searchTerm: string;
  habitat: string;
  observer: string;
  conservationStatus: string;
  seasonality: string;
}

export const HABITATS = [
  { id: 'forest', name: 'Bosque' },
  { id: 'wetland', name: 'Humedal' },
  { id: 'coast', name: 'Costa' },
  { id: 'mountain', name: 'Montaña' },
  { id: 'desert', name: 'Desierto' },
  { id: 'urban', name: 'Urbano' },
  { id: 'grassland', name: 'Pradera' },
  { id: 'scrubland', name: 'Matorral' }
] as const;

export const CONSERVATION_STATUS = [
  { id: 'LC', name: 'Preocupación menor' },
  { id: 'NT', name: 'Casi amenazada' },
  { id: 'VU', name: 'Vulnerable' },
  { id: 'EN', name: 'En peligro' },
  { id: 'CR', name: 'En peligro crítico' }
] as const;

export const SEASONALITY = [
  { id: 'resident', name: 'Residente' },
  { id: 'migratory', name: 'Migratoria' },
  { id: 'summer', name: 'Verano' },
  { id: 'winter', name: 'Invierno' }
] as const;