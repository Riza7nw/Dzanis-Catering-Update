/**
 * Modul Jembatan Keamanan Kriptografis Front-End (Dzanis Security Bridge)
 * - Menghasilkan signature HMAC-SHA256 untuk setiap payload transaksi / order (Anti-Tampering)
 * - Mengirim nonce acak 128-bit dan epoch timestamp (Anti-Replay)
 * - Kompatibel dengan Web Crypto API (Browser & Node.js 18+)
 */

const BRIDGE_SECRET =
  (typeof import.meta !== 'undefined' && import.meta.env?.PUBLIC_BRIDGE_SECRET) ||
  'dzanis-catering-secure-bridge-secret-2026';

/**
 * Menghasilkan string acak hexadecimal 32 karakter untuk nonce
 */
export function generateNonce(): string {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const arr = new Uint8Array(16);
    crypto.getRandomValues(arr);
    return Array.from(arr, (b) => b.toString(16).padStart(2, '0')).join('');
  }
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

/**
 * Menghitung HMAC-SHA256 menggunakan Web Crypto API
 */
async function hmacSha256Hex(keyStr: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const keyData = enc.encode(keyStr);
  const msgData = enc.encode(message);

  const cryptoObj = typeof window !== 'undefined' ? window.crypto : crypto;

  if (!cryptoObj?.subtle) {
    // Fallback jika crypto.subtle tidak tersedia di environment sangat terbatas
    return 'fallback-sig-' + Date.now();
  }

  const cryptoKey = await cryptoObj.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signatureBuffer = await cryptoObj.subtle.sign('HMAC', cryptoKey, msgData);
  const hashArray = Array.from(new Uint8Array(signatureBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Menghasilkan set header keamanan kriptografis lengkap untuk pengiriman data ke backend
 */
export async function createBridgeSecurityHeaders(
  payload: Record<string, unknown> | string
): Promise<Record<string, string>> {
  const timestamp = Date.now().toString();
  const nonce = generateNonce();
  const payloadStr = typeof payload === 'object' ? JSON.stringify(payload) : String(payload || '');

  const canonical = `${timestamp}:${nonce}:${payloadStr}`;
  const signature = await hmacSha256Hex(BRIDGE_SECRET, canonical);

  return {
    'X-Dzanis-Timestamp': timestamp,
    'X-Dzanis-Nonce': nonce,
    'X-Dzanis-Signature': signature,
    'X-Dzanis-Client': 'dzanis-web-astro',
  };
}
