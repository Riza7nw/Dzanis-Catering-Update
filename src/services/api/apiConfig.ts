/**
 * Service: API Configuration & Base URL Resolver
 * Menangani resolusi URL API untuk build SSG (Node) maupun browser klien.
 *
 * Alamat backend hanya berasal dari PUBLIC_API_URL saat build (atau localhost saat pengembangan).
 * Tidak ada override lewat query string: link pihak ketiga tidak boleh bisa membelokkan
 * data pesanan pelanggan ke server lain.
 */

export const DEFAULT_TIMEOUT_MS = 2000;

/**
 * Mengambil base URL API backend yang aktif, atau string kosong bila backend tidak dikonfigurasi
 * (website lalu memakai data katalog lokal).
 */
export function getApiBaseUrl(): string {
  // 1. Variabel lingkungan PUBLIC_API_URL (prioritas utama pada mode build/hosting)
  if (typeof import.meta !== 'undefined' && import.meta.env?.PUBLIC_API_URL) {
    const envUrl = String(import.meta.env.PUBLIC_API_URL).trim();
    if (envUrl) return envUrl.replace(/\/+$/, '');
  }

  // 2. Pengembangan lokal: backend berjalan di port 8000 pada host yang sama
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const isLocal =
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname.startsWith('192.168.') ||
      hostname.startsWith('10.') ||
      hostname.endsWith('.local');

    if (isLocal) {
      return `${window.location.protocol}//${hostname || '127.0.0.1'}:8000`;
    }
  }

  // 3. Backend tidak dikonfigurasi: pemanggil memakai data lokal
  return '';
}

/**
 * Header standar untuk permintaan API backend.
 */
export function getCommonApiHeaders(): HeadersInit {
  return {
    'Accept': 'application/json',
  };
}
