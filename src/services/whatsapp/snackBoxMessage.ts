/**
 * Service: Generator Pesan WhatsApp Snack Box
 * 100% identik dengan format produksi `RakitSnackBox.astro`.
 */

import { formatRupiahNumber } from '../../utils/currency.ts';

export interface SnackBoxSelectedItem {
  nama?: string;
  name?: string;
  harga?: number;
  price?: number;
}

export interface SnackBoxCustomDetailsOptions {
  subtotal?: number;
  total?: number;
  boxCount?: number;
  hargaPerBox?: number;
  estimasiTotal?: number;
}

export interface SnackBoxOrderData {
  packageName?: string;
  selectedItems: Array<string | SnackBoxSelectedItem>;
  boxCount: number;
  subtotal?: number;
  total?: number;
  eventDate?: string;
}

/**
 * Menghasilkan teks rincian kustomisasi item snack untuk prefill modal pemesanan.
 * Mendukung item berupa nama string atau objek { nama, harga }, serta ringkasan harga per box & estimasi total.
 * Format:
 * • Item 1: Lemper (Rp3.500)
 * • Item 2: Putu Ayu (Rp3.000)
 * • Harga per box: Rp6.500
 * • Estimasi total: Rp130.000 (20 box)
 */
export function buildSnackBoxCustomDetails(
  selectedItems: Array<string | SnackBoxSelectedItem>,
  options?: SnackBoxCustomDetailsOptions
): string {
  if (!selectedItems || selectedItems.length === 0) return '';

  const safeItems = selectedItems.filter((it): it is string | SnackBoxSelectedItem => Boolean(it));
  if (safeItems.length === 0) return '';

  const lines = safeItems.map((it, idx) => {
    if (typeof it === 'string') {
      return `• Item ${idx + 1}: ${it.trim()}`;
    }
    const name = (it.nama || it.name || '').trim();
    const price = it.harga ?? it.price;
    if (typeof price === 'number' && Number.isFinite(price) && price >= 0) {
      return `• Item ${idx + 1}: ${name} (Rp${price.toLocaleString('id-ID')})`;
    }
    return `• Item ${idx + 1}: ${name}`;
  });

  const opts = options || {};
  let subtotal = opts.subtotal ?? opts.hargaPerBox;
  if (typeof subtotal !== 'number' || !Number.isFinite(subtotal)) {
    const itemPrices = safeItems
      .filter((it): it is SnackBoxSelectedItem => typeof it === 'object')
      .map((it) => it.harga ?? it.price)
      .filter((p): p is number => typeof p === 'number' && Number.isFinite(p) && p >= 0);

    if (itemPrices.length === safeItems.length && itemPrices.length > 0) {
      subtotal = itemPrices.reduce((a, b) => a + b, 0);
    }
  }

  let total = opts.total ?? opts.estimasiTotal;
  const boxCount =
    typeof opts.boxCount === 'number' && Number.isFinite(opts.boxCount) && opts.boxCount > 0
      ? opts.boxCount
      : undefined;

  if (
    (typeof total !== 'number' || !Number.isFinite(total)) &&
    typeof subtotal === 'number' &&
    Number.isFinite(subtotal) &&
    boxCount
  ) {
    total = subtotal * boxCount;
  }

  if (typeof subtotal === 'number' && Number.isFinite(subtotal) && subtotal >= 0) {
    lines.push(`• Harga per box: Rp${subtotal.toLocaleString('id-ID')}`);
  }

  if (typeof total === 'number' && Number.isFinite(total) && total >= 0) {
    if (boxCount) {
      lines.push(`• Estimasi total: Rp${total.toLocaleString('id-ID')} (${boxCount} box)`);
    } else {
      lines.push(`• Estimasi total: Rp${total.toLocaleString('id-ID')}`);
    }
  }

  return lines.join('\n');
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
  const safeItems = (data.selectedItems || []).filter(Boolean);
  const pkgName = data.packageName || buildSnackBoxPackageName(safeItems.length);

  let subtotal = data.subtotal;
  if (typeof subtotal !== 'number' || !Number.isFinite(subtotal)) {
    const itemPrices = safeItems
      .filter((it): it is SnackBoxSelectedItem => typeof it === 'object')
      .map((it) => it.harga ?? it.price)
      .filter((p): p is number => typeof p === 'number' && Number.isFinite(p) && p >= 0);

    if (itemPrices.length === safeItems.length && itemPrices.length > 0) {
      subtotal = itemPrices.reduce((a, b) => a + b, 0);
    }
  }

  const boxCount =
    typeof data.boxCount === 'number' && Number.isFinite(data.boxCount) && data.boxCount > 0
      ? data.boxCount
      : 0;

  let total = data.total;
  if (
    (typeof total !== 'number' || !Number.isFinite(total)) &&
    typeof subtotal === 'number' &&
    Number.isFinite(subtotal) &&
    boxCount > 0
  ) {
    total = subtotal * boxCount;
  }

  const details = buildSnackBoxCustomDetails(safeItems, {
    subtotal: typeof subtotal === 'number' && Number.isFinite(subtotal) ? subtotal : undefined,
    total: typeof total === 'number' && Number.isFinite(total) ? total : undefined,
    boxCount: boxCount > 0 ? boxCount : undefined,
  });

  const lines: string[] = [
    `Halo Dzanis Catering, saya ingin memesan:`,
    `- Paket: ${pkgName}`,
  ];

  if (details) {
    lines.push(`- Pilihan Item / Kustomisasi:\n${details}`);
  }

  if (boxCount > 0) {
    lines.push(`- Jumlah: ${boxCount} box`);
  }

  if (data.eventDate) {
    lines.push(`- Tanggal Acara: ${data.eventDate}`);
  }

  if (typeof total === 'number' && Number.isFinite(total) && total > 0) {
    lines.push(`- Total Estimasi: Rp ${formatRupiahNumber(total)}`);
  }

  lines.push(`Mohon konfirmasi ketersediaan. Terima kasih!`);
  return lines.join('\n');
}
