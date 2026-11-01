/**
 * Pure Utility: Tanggal & Waktu Acara
 * Formatting dan kalkulasi batasan tanggal acara tanpa dependensi DOM.
 */

/**
 * Format string tanggal ISO (YYYY-MM-DD) ke bahasa Indonesia lengkap.
 * Contoh: "2026-11-02" -> "Senin, 2 November 2026"
 */
export function formatIndonesianDate(dateString: string): string {
  if (!dateString) return '';
  // Menggunakan suffix T00:00:00 untuk menghindari pergeseran timezone UTC
  const safeDate = dateString.includes('T') ? new Date(dateString) : new Date(`${dateString}T00:00:00`);
  if (isNaN(safeDate.getTime())) return dateString;

  return safeDate.toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Menghasilkan string batas tanggal minimal pemesanan (format YYYY-MM-DD).
 * Default: H+1 (besok) dari tanggal saat ini.
 */
export function getMinEventDate(minDaysAhead = 1): string {
  const target = new Date();
  target.setDate(target.getDate() + minDaysAhead);
  const yyyy = target.getFullYear();
  const mm = String(target.getMonth() + 1).padStart(2, '0');
  const dd = String(target.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Memeriksa apakah tanggal acara yang dipilih memenuhi syarat batas minimal (H+1).
 */
export function isEventDateValid(selectedDateStr: string, minDaysAhead = 1): boolean {
  if (!selectedDateStr) return false;
  const selected = new Date(`${selectedDateStr}T00:00:00`);
  const minDateStr = getMinEventDate(minDaysAhead);
  const minDate = new Date(`${minDateStr}T00:00:00`);
  return selected >= minDate;
}
