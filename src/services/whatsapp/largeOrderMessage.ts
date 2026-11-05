/**
 * Service: Generator Pesan WhatsApp Konsultasi Pesanan Skala Besar (>500 Box)
 * Digunakan saat pelanggan ingin memesan porsi di atas kapasitas standar sistem (500 box)
 * untuk diarahkan langsung konsultasi ke admin katering.
 */

import { waPhoneNumber } from '../../data/company.ts';
import { formatIndonesianDate } from '../../utils/date.ts';
import { buildWhatsAppUrl } from './waUrl.ts';

export interface LargeOrderConsultationData {
  packageName?: string;
  portionCount?: number;
  eventDate?: string;
  customerName?: string;
}

/**
 * Membangun pesan WhatsApp untuk konsultasi pesanan skala besar (>500 box).
 */
export function buildLargeOrderWhatsAppMessage(data?: LargeOrderConsultationData): string {
  const lines = [
    'Halo Dzanis Catering, saya ingin konsultasi pesanan katering skala besar (>500 box) untuk acara.',
  ];

  if (data?.packageName && data.packageName.trim()) {
    lines.push(`- Paket: ${data.packageName.trim()}`);
  }

  const portion = data?.portionCount;
  if (portion && portion > 500) {
    lines.push(`- Rencana Jumlah: ${portion} box`);
  } else {
    lines.push(`- Rencana Jumlah: >500 box`);
  }

  if (data?.eventDate && data.eventDate.trim()) {
    const formattedDate = formatIndonesianDate(data.eventDate.trim()) || data.eventDate.trim();
    lines.push(`- Tanggal Acara: ${formattedDate}`);
  }

  if (data?.customerName && data.customerName.trim()) {
    lines.push(`- Nama Pemesan: ${data.customerName.trim()}`);
  }

  lines.push('Mohon informasi ketersediaan jadwal, penawaran harga khusus, dan prosedur pemesanannya. Terima kasih!');

  return lines.join('\n');
}

/**
 * Membangun tautan WhatsApp resmi lengkap dengan pesan konsultasi pesanan besar (>500 box).
 */
export function buildLargeOrderWhatsAppUrl(
  phone: string = waPhoneNumber,
  data?: LargeOrderConsultationData
): string {
  const message = buildLargeOrderWhatsAppMessage(data);
  return buildWhatsAppUrl(phone, message);
}
