/**
 * Service: Generator Pesan WhatsApp Form Order Modal
 * 100% identik dengan format produksi `OrderModal.astro`.
 */

import { buildWhatsAppUrl } from './waUrl';

export interface OrderModalMessageData {
  packageName: string;
  customDetails?: string;
  portionCount: number;
  eventDate: string;
  customerName: string;
  customerAddress?: string;
  deliveryLat?: string;
  deliveryLng?: string;
  notes?: string;
}

/**
 * Menghasilkan string pesan WhatsApp akhir dari submit form OrderModal.
 */
export function buildOrderModalWhatsAppMessage(data: OrderModalMessageData): string {
  const pkg = data.packageName || "Snack Box Dzanis";
  const details = (data.customDetails || "").trim();
  const count = data.portionCount || 20;
  const date = data.eventDate || "-";
  const name = data.customerName || "-";
  const address = (data.customerAddress || "").trim();
  const lat = (data.deliveryLat || "").trim();
  const lng = (data.deliveryLng || "").trim();
  const notes = (data.notes || "").trim();

  const lines = [
    "Halo Dzanis Catering, saya ingin memesan:",
    `- Paket: ${pkg}`,
  ];

  if (details) {
    lines.push(`- Pilihan Item / Kustomisasi:\n${details}`);
  }

  lines.push(
    `- Jumlah: ${count} box`,
    `- Tanggal Acara: ${date}`,
    `- Nama Pemesan: ${name}`,
    `- Alamat Pengantaran: ${address || "-"}`,
  );

  if (lat && lng) {
    lines.push(`- Titik Peta: https://www.google.com/maps?q=${lat},${lng}`);
  }

  lines.push(`- Catatan: ${notes || "-"}`);

  return lines.join("\n");
}

/**
 * Menghasilkan URL WhatsApp lengkap dari data form OrderModal.
 */
export function buildOrderModalWhatsAppUrl(phone: string, data: OrderModalMessageData): string {
  const message = buildOrderModalWhatsAppMessage(data);
  return buildWhatsAppUrl(phone, message);
}
