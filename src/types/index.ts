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
  conservationStatus: string;
  endemic: string;
  threatened: string;
  native: string;
  qualityGrade: string;
  month: string;
  orderBy: string;
}

export const CONSERVATION_STATUS = [
  { id: 'LC', name: 'Preocupación menor' },
  { id: 'NT', name: 'Casi amenazada' },
  { id: 'VU', name: 'Vulnerable' },
  { id: 'EN', name: 'En peligro' },
  { id: 'CR', name: 'En peligro crítico' }
] as const;