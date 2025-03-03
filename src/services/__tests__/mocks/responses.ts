import { REGIONES_CHILE } from '../../../constants';

export const mockBirdResponse = {
  total_results: 2,
  page: 1,
  per_page: 50,
  results: [
    {
      id: 1,
      taxon: {
        id: 1,
        name: 'Columba livia',
        preferred_common_name: 'Paloma común',
        conservation_status: { status: 'LC' },
        endemic: true,
        native: true,
        threatened: false
      },
      latitude: REGIONES_CHILE[0].lat,
      longitude: REGIONES_CHILE[0].lng,
      place_guess: 'Santiago',
      photos: [
        {
          url: 'https://example.com/photo1.jpg',
          attribution: 'Foto por Juan Pérez'
        }
      ],
      observed_on: '2024-02-29',
      quality_grade: 'research'
    },
    {
      id: 2,
      taxon: {
        id: 2,
        name: 'Spheniscus humboldti',
        preferred_common_name: 'Pingüino de Humboldt',
        conservation_status: { status: 'VU' },
        endemic: false,
        native: true,
        threatened: true
      },
      latitude: REGIONES_CHILE[1].lat,
      longitude: REGIONES_CHILE[1].lng,
      place_guess: 'Antofagasta',
      photos: [
        {
          url: 'https://example.com/photo2.jpg',
          attribution: 'Foto por María González'
        }
      ],
      observed_on: '2024-02-28',
      quality_grade: 'research'
    }
  ]
};

export const mockBirdDetailsResponse = {
  taxon: {
    results: [{
      id: 1234,
      name: 'Columba livia',
      preferred_common_name: 'Paloma común',
      wikipedia_summary: 'La paloma común...',
      wikipedia_url: 'https://es.wikipedia.org/wiki/Columba_livia',
      conservation_status: { status: 'LC' },
      endemic: false,
      native: true,
      threatened: false,
      default_photo: {
        url: 'https://example.com/default.jpg',
        attribution: 'Foto por Default'
      }
    }]
  },
  observations: {
    results: [
      {
        id: 1,
        latitude: REGIONES_CHILE[0].lat,
        longitude: REGIONES_CHILE[0].lng,
        place_guess: 'Santiago',
        photos: [
          {
            url: 'https://example.com/obs1.jpg',
            attribution: 'Foto por Observador 1'
          }
        ],
        observed_on: '2024-02-29',
        quality_grade: 'research'
      }
    ]
  }
};