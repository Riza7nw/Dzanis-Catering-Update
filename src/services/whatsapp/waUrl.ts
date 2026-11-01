/**
 * Service: WhatsApp URL Builder
 * Menghasilkan tautan universal https://wa.me/{phone}?text={encoded}
 * dengan normalisasi nomor telepon format Indonesia.
 */

/**
 * Menormalkan nomor telepon ke format internasional standar tanpa karakter non-digit.
 * Contoh: "0857-2633-1579" -> "6285726331579", "+62 813..." -> "62813..."
 */
export function normalizePhoneNumber(rawPhone: string, fallbackPhone = "6285726331579"): string {
  if (!rawPhone) return fallbackPhone;
  let digits = String(rawPhone).replace(/\D/g, "");
  if (digits.startsWith("0")) {
    digits = "62" + digits.slice(1);
  }
  return digits || fallbackPhone;
}

/**
 * Membangun URL tautan WhatsApp resmi lengkap dengan pesan URL-encoded.
 */
export function buildWhatsAppUrl(rawPhone: string, messageText?: string): string {
  const phone = normalizePhoneNumber(rawPhone);
  const base = `https://wa.me/${phone}`;
  if (!messageText || !messageText.trim()) {
    return base;
  }
  return `${base}?text=${encodeURIComponent(messageText.trim())}`;
}
