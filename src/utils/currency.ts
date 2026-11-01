/**
 * Pure Utility: Mata Uang & Angka Rupiah
 * Format dan parsing angka mata uang Indonesia (IDR) tanpa dependensi DOM.
 */

/**
 * Format angka ke representasi Rupiah resmi Indonesia (misal: "Rp 25.000").
 */
export function formatRupiah(amount: number): string {
  const safeAmount = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(safeAmount);
}

/**
 * Format angka dengan separator ribuan titik (misal: "25.000").
 */
export function formatRupiahNumber(amount: number): string {
  const safeAmount = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
  return safeAmount.toLocaleString('id-ID');
}

/**
 * Parsing string teks berisi format Rupiah menjadi integer murni.
 * Contoh: "Rp 25.000" -> 25000, "20.000" -> 20000
 */
export function parseRupiah(str: string): number {
  if (!str) return 0;
  const clean = String(str).replace(/[^\d]/g, '');
  return parseInt(clean, 10) || 0;
}
