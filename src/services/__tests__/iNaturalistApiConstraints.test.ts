import { describe, it, expect, beforeEach, vi } from 'vitest';
import { INaturalistApi } from '../iNaturalistApi';
import { CHILE_PLACE_ID } from '../../constants';

describe('INaturalistApi Constraints', () => {
  let api: INaturalistApi;

  beforeEach(() => {
    api = new INaturalistApi();
    vi.clearAllMocks();
  });

  describe('Place ID Constraint', () => {
    it('should include place_id in API request', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ results: [] })
      });

      await api.getBirds();

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining(`place_id=${CHILE_PLACE_ID}`),
        expect.any(Object)
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      global.fetch = vi.fn().mockRejectedValueOnce(new Error('API Error'));

      await expect(api.getBirds()).rejects.toThrow('API Error');
    });

    it('should handle rate limiting', async () => {
      global.fetch = vi.fn()
        .mockResolvedValueOnce({
          ok: false,
          status: 429,
          headers: new Headers({ 'Retry-After': '1' })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ results: [] })
        });

      await api.getBirds();
      expect(fetch).toHaveBeenCalledTimes(2);
    });
  });
});