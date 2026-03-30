import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BirdCard } from '../BirdCard';

describe('BirdCard', () => {
  const mockBird = {
    id: 1,
    species: {
      id: 1,
      name: 'Columba livia',
      commonName: 'Paloma común',
      threatened: true,
      endemic: true
    },
    location: {
      latitude: -33.4489,
      longitude: -70.6693,
      region: 'Metropolitana',
      placeGuess: 'Santiago'
    },
    photos: [{
      url: 'https://example.com/photo.jpg',
      attribution: 'Foto por Juan Pérez'
    }],
    observedOn: '2024-02-29',
    quality: 'research',
    votes: 10,
    observationsCount: 5
  };

  it('should render bird information correctly', () => {
    render(<BirdCard bird={mockBird} />);

    expect(screen.getByText('Paloma común')).toBeInTheDocument();
    expect(screen.getByText('Columba livia')).toBeInTheDocument();
    // placeGuess is shown when available (instead of region)
    expect(screen.getByText('Santiago')).toBeInTheDocument();
  });

  it('should show conservation status badges when applicable', () => {
    render(<BirdCard bird={mockBird} />);

    expect(screen.getByText('Amenazada')).toBeInTheDocument();
    expect(screen.getByText('Endémica')).toBeInTheDocument();
  });

  it('should render photo attribution when available', () => {
    render(<BirdCard bird={mockBird} />);
    expect(screen.getByText('Foto por Juan Pérez')).toBeInTheDocument();
  });
});
