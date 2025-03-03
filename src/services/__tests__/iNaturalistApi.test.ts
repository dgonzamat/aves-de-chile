import { describe, it, expect, beforeEach, vi } from 'vitest';
import { INaturalistApi } from '../iNaturalistApi';
import { mockBirdResponse, mockBirdDetailsResponse } from './mocks/responses';
import { REGIONES_CHILE } from '../../constants';

describe('INaturalistApi', () => {
  let api: INaturalistApi;

  beforeEach(() => {
    api = new INaturalistApi();
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  describe('getBirds', () => {
    it('should fetch and transform birds data correctly', async () => {
      const mockFetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockBirdResponse)
      });
      
      global.fetch = mockFetch;

      const birds = await api.getBirds();
      
      expect(birds).toHaveLength(mockBirdResponse.results.length);
      expect(birds[0]).toHaveProperty('species');
      expect(birds[0]).toHaveProperty('location');
      expect(birds[0]).toHaveProperty('photos');
      expect(birds[0].location.region).toBe(REGIONES_CHILE[0].nombre);
    });

    it('should filter out observations without photos', async () => {
      const responseWithoutPhotos = {
        ...mockBirdResponse,
        results: [
          {
            ...mockBirdResponse.results[0],
            photos: []
          }
        ]
      };

      const mockFetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(responseWithoutPhotos)
      });
      
      global.fetch = mockFetch;

      const birds = await api.getBirds();
      expect(birds).toHaveLength(0);
    });

    it('should handle API errors gracefully', async () => {
      const mockFetch = vi.fn().mockRejectedValueOnce(new Error('Network error'));
      global.fetch = mockFetch;

      await expect(api.getBirds()).rejects.toThrow();
    });

    it('should retry on rate limit', async () => {
      const mockFetch = vi.fn()
        .mockResolvedValueOnce({
          ok: false,
          status: 429,
          headers: new Headers({ 'Retry-After': '1' })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockBirdResponse)
        });

      global.fetch = mockFetch;

      const birds = await api.getBirds();
      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(birds).toBeDefined();
    });

    it('should assign regions correctly based on coordinates', async () => {
      const mockResponse = {
        ...mockBirdResponse,
        results: [{
          ...mockBirdResponse.results[0],
          latitude: REGIONES_CHILE[0].lat,
          longitude: REGIONES_CHILE[0].lng
        }]
      };

      const mockFetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });
      
      global.fetch = mockFetch;

      const birds = await api.getBirds();
      expect(birds[0].location.region).toBe(REGIONES_CHILE[0].nombre);
    });
  });

  describe('getBirdDetails', () => {
    it('should fetch and transform bird details correctly', async () => {
      const mockFetch = vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ results: [mockBirdDetailsResponse.taxon.results[0]] })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ results: mockBirdDetailsResponse.observations.results })
        });

      global.fetch = mockFetch;

      const details = await api.getBirdDetails(1234);
      
      expect(details).toHaveProperty('name');
      expect(details).toHaveProperty('commonName');
      expect(details).toHaveProperty('observations');
      expect(details.observations[0].location.region).toBeDefined();
    });

    it('should handle missing taxon data', async () => {
      const mockFetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ results: [] })
      });

      global.fetch = mockFetch;

      await expect(api.getBirdDetails(1234)).rejects.toThrow('Especie no encontrada');
    });
  });
});