/**
 * Service: Generator Pesan WhatsApp Paket Nasi Kotak
 * 100% identik dengan format produksi `[slug].astro`.
 */

import { formatIndonesianDate } from '../../utils/date.ts';
import { formatRupiahNumber } from '../../utils/currency.ts';

export interface NasiKotakOrderData {
  packageName: string;
  qty: number;
  total: number;
  hasMenuSelection?: boolean;
  orderMode?: 'default' | 'custom';
  defaultMainMenu?: string;
  defaultSideDishes?: string[] | string;
  selectedMainMenu?: string;
  selectedSideDishes?: string[];
  selectedEventDate?: string;
}

/**
 * Menghasilkan teks rincian kustomisasi menu untuk prefill modal pemesanan.
 */
export function buildNasiKotakCustomDetails(data: NasiKotakOrderData): string {
  if (!data.hasMenuSelection) return '';

  const defaultSidesText = Array.isArray(data.defaultSideDishes)
    ? data.defaultSideDishes.join(', ')
    : data.defaultSideDishes || '';

  if (data.orderMode === 'default') {
    return `• Pilihan Paket: Menu Standar (Default)\n• Menu Utama: ${data.defaultMainMenu || ''}\n• Lauk Pendamping: ${defaultSidesText}`;
  }

  const selectedSidesText = Array.isArray(data.selectedSideDishes)
    ? data.selectedSideDishes.join(', ')
    : '';

  return `• Pilihan Paket: Racik Sendiri\n• Menu Utama: ${data.selectedMainMenu || ''}\n• Lauk Pendamping: ${selectedSidesText}`;
}

/**
 * Menghasilkan teks pesan WhatsApp lengkap untuk pesanan Nasi Kotak.
 */
export function buildNasiKotakWhatsAppMessage(data: NasiKotakOrderData): string {
  const lines: string[] = [
    `Halo Dzanis Catering, saya ingin memesan *${data.packageName}* sebanyak *${data.qty} porsi*.`,
  ];

  if (data.hasMenuSelection) {
    const defaultSidesText = Array.isArray(data.defaultSideDishes)
      ? data.defaultSideDishes.join(', ')
      : data.defaultSideDishes || '';

    if (data.orderMode === 'default') {
      lines.push(`Pilihan Paket: Default (Menu Standar)`);
      lines.push(`Menu Utama: ${data.defaultMainMenu || ''}`);
      lines.push(`Lauk Pendamping: ${defaultSidesText}`);
    } else {
      lines.push(`Pilihan Paket: Racik Menu Sendiri`);
      if (data.selectedMainMenu) {
        lines.push(`Menu Utama: ${data.selectedMainMenu}`);
      }
      if (data.selectedSideDishes && data.selectedSideDishes.length > 0) {
        lines.push(`Lauk Pendamping: ${data.selectedSideDishes.join(', ')}`);
      }
    }
  }

  if (data.selectedEventDate) {
    const formattedDate = formatIndonesianDate(data.selectedEventDate);
    if (formattedDate) {
      lines.push(`Tanggal Acara: ${formattedDate}`);
    }
  }

  const totalStr = formatRupiahNumber(data.total);
  lines.push(
    `Total estimasi: Rp ${totalStr}.`,
    `Ketentuan: DP 25% saat konfirmasi pesanan, pelunasan sisa saat pesanan sampai di tempat pengantaran.`,
    `Mohon konfirmasi ketersediaan. Terima kasih!`
  );

  return lines.join('\n');
}
