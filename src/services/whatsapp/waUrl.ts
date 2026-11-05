/**
 * Service: WhatsApp URL Builder
 * Menghasilkan tautan universal https://wa.me/{phone}?text={encoded}
 * dengan normalisasi nomor telepon format Indonesia.
 */

import { normalizePhoneNumber } from '../../utils/whatsappFormatter.ts';

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

export {
  normalizePhoneNumber,
  buildServiceInquiryUrl,
  buildSnackTemplateWaUrl,
  type SnackTemplateItem,
  type SnackTemplateData,
} from '../../utils/whatsappFormatter.ts';


