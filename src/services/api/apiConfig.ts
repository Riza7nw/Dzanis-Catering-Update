/**
 * Service: API Configuration & Base URL Resolver
 * Menangani resolusi URL API dinamis untuk lingkungan build SSG (Node)
 * maupun interaksi browser klien dengan aman.
 */

export const DEFAULT_NGROK_URL = 'https://alkalize-rewire-scruffy.ngrok-free.dev';
export const DEFAULT_TIMEOUT_MS = 2000;

/**
 * Mengambil base URL API backend yang aktif.
 */
export function getApiBaseUrl(): string {
  // 1. Variabel lingkungan PUBLIC_API_URL (prioritas utama pada mode build/hosting)
  if (typeof import.meta !== 'undefined' && import.meta.env?.PUBLIC_API_URL) {
    const envUrl = String(import.meta.env.PUBLIC_API_URL).trim();
    if (envUrl) return envUrl.replace(/\/+$/, '');
  }

  // 2. Lingkungan Klien Browser: Periksa parameter URL ?apiUrl= atau deteksi localhost
  if (typeof window !== 'undefined') {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const queryApi = urlParams.get('apiUrl');
      if (queryApi) return queryApi.trim().replace(/\/+$/, '');

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
    } catch {
      // Fallback diam jika URLSearchParams atau window tidak dapat diakses
    }
  }

  // 3. Fallback tunnel produksi/staging default
  return DEFAULT_NGROK_URL;
}

/**
 * Default header untuk bypass browser warning ngrok pada testing tunnel.
 */
export function getCommonApiHeaders(): HeadersInit {
  return {
    'Accept': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  };
}
