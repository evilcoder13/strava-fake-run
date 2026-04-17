import { describe, it, expect, vi } from 'vitest';
import { fetchElevations } from '@/lib/elevation-simulator';

describe('fetchElevations', () => {
  it('returns an array with the same length as the input coords array', async () => {
    // Mock global fetch to return a canned Open-Meteo response
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ elevation: [38.0, 56.0, 53.0] }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const coords = [
      { lat: 52.52, lon: 13.41 },
      { lat: 52.51, lon: 13.40 },
      { lat: 52.50, lon: 13.39 },
    ];
    const elevations = await fetchElevations(coords);
    expect(elevations).toHaveLength(3);
    expect(elevations[0]).toBe(38.0);

    vi.restoreAllMocks();
  });

  it('batches requests in chunks of 100', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ elevation: new Array(100).fill(10) }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const coords = Array.from({ length: 150 }, (_, i) => ({ lat: 52 + i * 0.001, lon: 13 }));
    await fetchElevations(coords);
    // 150 coords → 2 batch calls (100 + 50)
    expect(mockFetch).toHaveBeenCalledTimes(2);

    vi.restoreAllMocks();
  });

  it('throws when API responds with ok=false', async () => {
    const mockFetch = vi.fn().mockResolvedValue({ ok: false, status: 429 });
    vi.stubGlobal('fetch', mockFetch);

    await expect(fetchElevations([{ lat: 52, lon: 13 }])).rejects.toThrow('429');

    vi.restoreAllMocks();
  });
});
