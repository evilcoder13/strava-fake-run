// lib/elevation-simulator.ts
// Fetches real-world elevation from the Open-Meteo Elevation API (free, no auth required).
// Batch endpoint confirmed working 2026-04-17: https://api.open-meteo.com/v1/elevation
// Response format: { "elevation": [number, ...] }

const CHUNK_SIZE = 100;

export async function fetchElevations(
  coords: { lat: number; lon: number }[]
): Promise<number[]> {
  const results: number[] = [];

  for (let i = 0; i < coords.length; i += CHUNK_SIZE) {
    const chunk = coords.slice(i, i + CHUNK_SIZE);
    const lats = chunk.map(c => c.lat).join(',');
    const lons = chunk.map(c => c.lon).join(',');
    const url = `https://api.open-meteo.com/v1/elevation?latitude=${lats}&longitude=${lons}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Open-Meteo elevation API error: ${response.status}`);
    }

    const json = (await response.json()) as { elevation?: number[]; error?: boolean };

    if (json.error || !json.elevation) {
      throw new Error('Open-Meteo returned an error response');
    }

    results.push(...json.elevation);
  }

  return results;
}
