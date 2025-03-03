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

export interface Habitat {
  id: string;
  name: string;
  description: string;
}

export interface BirdSpecies {
  id: number;
  name: string;
  preferred_common_name: string;
  photos: Array<{
    url: string;
    attribution: string;
  }>;
  conservation_status?: {
    status: string;
    description: string;
  };
  establishment_means?: string;
  threatened?: boolean;
  endemic?: boolean;
  native?: boolean;
  introduced?: boolean;
  default_photo?: {
    url: string;
    attribution: string;
  };
  taxon_photos?: Array<{
    photo: {
      url: string;
      attribution: string;
    };
  }>;
}

export interface BirdDetails extends BirdSpecies {
  observations: Array<{
    id: number;
    photos: Array<{
      url: string;
      attribution: string;
    }>;
    sounds: Array<{
      file_url: string;
      attribution: string;
    }>;
  }>;
  observations_count: number;
  photos_count: number;
  wikipedia_summary?: string;
  wikipedia_url?: string;
}

export const CONSERVATION_STATUS = [
  { id: 'LC', name: 'Preocupación menor' },
  { id: 'NT', name: 'Casi amenazada' },
  { id: 'VU', name: 'Vulnerable' },
  { id: 'EN', name: 'En peligro' },
  { id: 'CR', name: 'En peligro crítico' }
];

export const SEASONALITY = [
  { id: 'resident', name: 'Residente' },
  { id: 'migratory', name: 'Migratoria' }
];