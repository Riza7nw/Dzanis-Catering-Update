/**
 * Service: Generator Pesan WhatsApp Snack Box
 * 100% identik dengan format produksi `RakitSnackBox.astro`.
 */

import { formatRupiahNumber } from '../../utils/currency';

export interface SnackBoxOrderData {
  packageName?: string;
  selectedItems: string[];
  boxCount: number;
  total?: number;
  eventDate?: string;
}

/**
 * Menghasilkan teks rincian kustomisasi item snack untuk prefill modal pemesanan.
 * Format:
 * • Item 1: Kue Sus Vanilla
 * • Item 2: Lemper Ayam
 */
export function buildSnackBoxCustomDetails(selectedItems: string[]): string {
  if (!selectedItems || selectedItems.length === 0) return '';
  return selectedItems.map((it, idx) => `• Item ${idx + 1}: ${it}`).join('\n');
}

/**
 * Menghasilkan nama paket otomatis berdasarkan jumlah item.
 * Contoh: "Custom Snack Box (4 item)"
 */
export function buildSnackBoxPackageName(itemCount: number): string {
  return `Custom Snack Box (${itemCount} item)`;
}

/**
 * Menghasilkan teks pesan WhatsApp lengkap untuk pesanan Snack Box langsung.
 */
export function buildSnackBoxWhatsAppMessage(data: SnackBoxOrderData): string {
  const pkgName = data.packageName || buildSnackBoxPackageName(data.selectedItems.length);
  const details = buildSnackBoxCustomDetails(data.selectedItems);

  const lines: string[] = [
    `Halo Dzanis Catering, saya ingin memesan:`,
    `- Paket: ${pkgName}`,
  ];

  if (details) {
    lines.push(`- Pilihan Item / Kustomisasi:\n${details}`);
  }

  lines.push(`- Jumlah: ${data.boxCount} box`);

  if (data.eventDate) {
    lines.push(`- Tanggal Acara: ${data.eventDate}`);
  }

  if (typeof data.total === 'number' && data.total > 0) {
    lines.push(`- Total Estimasi: Rp ${formatRupiahNumber(data.total)}`);
  }

  lines.push(`Mohon konfirmasi ketersediaan. Terima kasih!`);
  return lines.join('\n');
}
