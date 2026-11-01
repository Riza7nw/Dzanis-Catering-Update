/**
 * Service: OpenStreetMap Nominatim Geocoding
 * Menangani reverse geocoding (koordinat -> alamat) dan forward location search
 * dengan pembatasan area fokus wilayah Ciayumajakuning & Jawa Barat.
 */

import type { NominatimReverseResult, NominatimSearchResult } from '../../types/geo';

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';
// Batas koordinat Jawa Barat / Ciayumajakuning (left, top, right, bottom)
const CIAYUMAJAKUNING_VIEWBOX = '107.75,-6.20,109.05,-7.45';
const NOMINATIM_USER_AGENT = 'DzanisCateringWeb/1.0 (contact: info@dzaniscatering.com)';

/**
 * Reverse Geocoding: Mengubah titik koordinat (lat, lng) menjadi nama alamat/jalan.
 */
export async function reverseGeocode(
  lat: number,
  lng: number,
  signal?: AbortSignal
): Promise<string> {
  if (typeof lat !== 'number' || typeof lng !== 'number' || isNaN(lat) || isNaN(lng)) {
    return '';
  }

  const url = `${NOMINATIM_BASE_URL}/reverse?format=jsonv2&lat=${lat.toFixed(6)}&lon=${lng.toFixed(6)}&accept-language=id`;

  try {
    const res = await fetch(url, {
      signal,
      headers: {
        Accept: 'application/json',
        'User-Agent': NOMINATIM_USER_AGENT,
      },
    });

    if (!res.ok) {
      throw new Error(`Nominatim HTTP ${res.status}`);
    }

    const data: NominatimReverseResult = await res.json();
    return (data.display_name || '').trim();
  } catch (err: unknown) {
    if ((err as Error)?.name === 'AbortError') throw err;
    console.warn('[geocodingService] Reverse geocode warning:', err);
    return '';
  }
}

export interface GeocodingSearchResultItem {
  displayName: string;
  name: string;
  lat: number;
  lng: number;
}

/**
 * Forward Geocoding: Mencari koordinat berdasarkan teks kata kunci alamat.
 */
export async function searchAddress(
  query: string,
  signal?: AbortSignal
): Promise<GeocodingSearchResultItem[]> {
  const trimmed = (query || '').trim();
  if (!trimmed) return [];

  const url = `${NOMINATIM_BASE_URL}/search?format=jsonv2&q=${encodeURIComponent(
    trimmed
  )}&countrycodes=id&viewbox=${CIAYUMAJAKUNING_VIEWBOX}&limit=5&accept-language=id`;

  try {
    const res = await fetch(url, {
      signal,
      headers: {
        Accept: 'application/json',
        'User-Agent': NOMINATIM_USER_AGENT,
      },
    });

    if (!res.ok) {
      throw new Error(`Nominatim HTTP ${res.status}`);
    }

    const items: (NominatimSearchResult & { name?: string })[] = await res.json();
    if (!Array.isArray(items)) return [];

    return items
      .map((item) => {
        const displayName = item.display_name || '';
        return {
          displayName,
          name: item.name || displayName.split(',')[0].trim(),
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
        };
      })
      .filter((item) => !isNaN(item.lat) && !isNaN(item.lng));
  } catch (err: unknown) {
    if ((err as Error)?.name === 'AbortError') throw err;
    console.warn('[geocodingService] Search location warning:', err);
    return [];
  }
}
