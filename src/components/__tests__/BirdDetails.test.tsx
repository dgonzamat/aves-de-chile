import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BirdDetails } from '../BirdDetails';

describe('BirdDetails', () => {
  const mockBird = {
    id: 1,
    name: 'Columba livia',
    commonName: 'Paloma común',
    wikipediaSummary: 'La paloma común es una especie...',
    wikipediaUrl: 'https://es.wikipedia.org/wiki/Columba_livia',
    threatened: true,
    endemic: true,
    defaultPhoto: 'https://example.com/photo.jpg',
    observations: [
      {
        id: 1,
        location: {
          latitude: -33.4489,
          longitude: -70.6693,
          region: 'Metropolitana',
          placeGuess: 'Santiago'
        },
        photos: [{
          url: 'https://example.com/obs1.jpg',
          attribution: 'Foto por Juan Pérez'
        }],
        observedOn: '2024-02-29T00:00:00.000Z',
        quality: 'research'
      }
    ]
  };

  it('should render bird details correctly', () => {
    const onBack = vi.fn();
    render(<BirdDetails bird={mockBird} onBack={onBack} />);
    
    expect(screen.getByText('Paloma común')).toBeInTheDocument();
    expect(screen.getByText('Columba livia')).toBeInTheDocument();
    expect(screen.getByText('La paloma común es una especie...')).toBeInTheDocument();
    expect(screen.getByText('Amenazada')).toBeInTheDocument();
    expect(screen.getByText('Endémica')).toBeInTheDocument();
  });

  it('should call onBack when back button is clicked', () => {
    const onBack = vi.fn();
    render(<BirdDetails bird={mockBird} onBack={onBack} />);
    
    fireEvent.click(screen.getByRole('button', { name: /volver/i }));
    expect(onBack).toHaveBeenCalled();
  });

  it('should render observations correctly', () => {
    render(<BirdDetails bird={mockBird} onBack={vi.fn()} />);
    
    expect(screen.getByText('Metropolitana')).toBeInTheDocument();
    expect(screen.getByText('29 de febrero de 2024')).toBeInTheDocument();
  });
});