/**
 * Domain Type Definitions: Geolocation & OpenStreetMap Nominatim
 * Mendefinisikan tipe koordinat peta, respon reverse geocoding, dan pencarian alamat.
 */

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface NominatimAddress {
  road?: string;
  suburb?: string;
  city_district?: string;
  city?: string;
  regency?: string;
  county?: string;
  state?: string;
  postcode?: string;
  country?: string;
  [key: string]: string | undefined;
}

export interface NominatimReverseResult {
  place_id?: number | string;
  licence?: string;
  lat: string;
  lon: string;
  display_name: string;
  address?: NominatimAddress;
}

export interface NominatimSearchResult {
  place_id: number | string;
  display_name: string;
  lat: string;
  lon: string;
  type?: string;
  importance?: number;
}

export interface MapPickerCoordinatesEvent {
  lat: number;
  lng: number;
  address: string;
}
