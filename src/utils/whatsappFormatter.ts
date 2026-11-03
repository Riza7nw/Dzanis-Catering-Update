/**
 * WhatsApp Message Generator
 * Format pesan dinamis, kontekstual, data-driven tanpa placeholder kaku.
 */

/**
 * Menormalkan nomor telepon ke format internasional standar tanpa karakter non-digit.
 * Contoh: "0813-2438-3858" -> "6281324383858", "+62 813..." -> "62813..."
 */
export function normalizePhoneNumber(rawPhone: string, fallbackPhone = '6281324383858'): string {
  if (!rawPhone) return fallbackPhone;
  let digits = String(rawPhone).replace(/\D/g, '');
  if (digits.startsWith('0')) {
    digits = '62' + digits.slice(1);
  }
  return digits || fallbackPhone;
}

/**
 * Helper untuk Layanan Lain: Menghasilkan URL WhatsApp konsultasi layanan.
 */
export function buildServiceInquiryUrl(serviceName: string, phone: string = '6281324383858'): string {
  const cleanPhone = normalizePhoneNumber(phone);
  const pesan = `Halo Dzanis Catering, saya ingin konsultasi mengenai layanan *${serviceName}* untuk rencana acara saya. Boleh minta info katalog paket dan pricelist lengkapnya? Terima kasih.`;
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(pesan)}`;
}

export interface SnackTemplateItem {
  kategori?: string;
  nama: string;
}

export interface SnackTemplateData {
  nama: string;
  harga: number;
  items: SnackTemplateItem[];
}

/**
 * Helper untuk Template Snack Box: Dinamis membaca array isian backend.
 */
export function buildSnackTemplateWaUrl(template: SnackTemplateData, phone: string = '6281324383858'): string {
  const cleanPhone = normalizePhoneNumber(phone);
  const daftarIsian = template.items
    .map((item, idx) => `${idx + 1}. ${item.kategori ? item.kategori + ': ' : ''}${item.nama}`)
    .join('\n');

  const pesan = [
    `Halo Dzanis Catering, saya ingin pesan *${template.nama}* (Rp${template.harga.toLocaleString('id-ID')}/box) dengan isian:`,
    daftarIsian,
    '',
    'Boleh info ketersediaan slot tanggal dan minimal ordernya? Terima kasih.'
  ].join('\n');

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(pesan)}`;
}

