/**
 * Service: API Configuration & Base URL Resolver
 * Menangani resolusi URL API dinamis untuk lingkungan build SSG (Node)
 * maupun interaksi browser klien dengan aman.
 * Menegakkan enkripsi HTTPS (SSL/TLS) untuk seluruh komunikasi remote produksi.
 */

export const DEFAULT_BACKEND_URL = 'https://dzaniez-back.ethiodeploy.app';
export const DEFAULT_TIMEOUT_MS = 3000;

/**
 * Memastikan URL non-lokal selalu terenkripsi protokol HTTPS aman.
 */
export function enforceSecureUrl(url: string): string {
  if (!url) return '';
  const trimmed = url.trim().replace(/\/+$/, '');
  const isLocal =
    trimmed.includes('localhost') ||
    trimmed.includes('127.0.0.1') ||
    trimmed.startsWith('http://192.168.') ||
    trimmed.startsWith('http://10.') ||
    trimmed.includes('.local');

  // Enkripsi paksa ke HTTPS jika bukan localhost
  if (!isLocal && trimmed.startsWith('http://')) {
    return trimmed.replace(/^http:\/\//i, 'https://');
  }
  return trimmed;
}

/**
 * Mengambil base URL API backend yang aktif (terenkripsi HTTPS pada production).
 */
export function getApiBaseUrl(): string {
  // 1. Variabel lingkungan PUBLIC_API_URL (prioritas utama pada mode build/hosting)
  if (typeof import.meta !== 'undefined' && import.meta.env?.PUBLIC_API_URL) {
    const envUrl = String(import.meta.env.PUBLIC_API_URL).trim();
    if (envUrl) return enforceSecureUrl(envUrl);
  }

  // 2. Lingkungan Klien Browser: Periksa parameter URL ?apiUrl= atau deteksi localhost
  if (typeof window !== 'undefined') {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const queryApi = urlParams.get('apiUrl');
      if (queryApi) return enforceSecureUrl(queryApi);

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

  // 3. Fallback produksi cloud terenkripsi HTTPS
  return DEFAULT_BACKEND_URL;
}

/**
 * Default header untuk API request:
 * Menghindari header kustom non-standar pada produksi agar tidak memicu CORS Preflight (OPTIONS) ganda.
 * Header ngrok hanya disematkan jika URL target terdeteksi domain ngrok.
 */
export function getCommonApiHeaders(targetUrl?: string): HeadersInit {
  const headers: Record<string, string> = {
    'Accept': 'application/json',
  };
  if (targetUrl && targetUrl.includes('ngrok')) {
    headers['ngrok-skip-browser-warning'] = 'true';
  }
  return headers;
}
