/**
 * Contact Synchronizer (FE <-> BE Dynamic WhatsApp Phone Sync)
 * Menyelaraskan nomor kontak WhatsApp & telp di seluruh Front-End secara dinamis
 * mengikuti sesi aktif WhatsApp di Back-End (Baileys), dengan fallback default ke nomor resmi.
 */

import { waPhoneNumber, company } from '../data/company.ts';
import { getApiBaseUrl } from '../services/api/apiConfig.ts';

export const DEFAULT_FALLBACK_PHONE = waPhoneNumber;
export const DEFAULT_FALLBACK_DISPLAY = company.contact.whatsappDisplay;

export const CACHE_KEY_PHONE = 'dzanis_active_phone';
export const CACHE_KEY_DISPLAY = 'dzanis_active_phone_display';

/**
 * Menormalkan nomor telepon ke format internasional standar (628xxx)
 */
export function normalizePhoneNumber(rawPhone: string, fallbackPhone = DEFAULT_FALLBACK_PHONE): string {
  if (!rawPhone) return fallbackPhone;
  let digits = String(rawPhone).replace(/\D/g, '');
  if (digits.startsWith('0')) {
    digits = '62' + digits.slice(1);
  }
  return digits || fallbackPhone;
}

/**
 * Menghasilkan tampilan nomor telepon Indonesia yang rapi (08xx-xxxx-xxxx)
 */
export function formatPhoneDisplay(rawPhone: string): string {
  if (!rawPhone) return DEFAULT_FALLBACK_DISPLAY;
  let digits = String(rawPhone).replace(/\D/g, '');
  if (digits.startsWith('62')) {
    digits = '0' + digits.slice(2);
  }
  if (digits.length >= 10) {
    return `${digits.slice(0, 4)}-${digits.slice(4, 8)}-${digits.slice(8)}`;
  }
  return digits;
}

/**
 * Mengganti nomor tujuan pada URL WhatsApp tanpa merusak parameter pesan (?text=...)
 */
export function replaceWaLinkPhone(url: string, newPhone: string): string {
  if (!url || typeof url !== 'string') return url;
  const cleanPhone = normalizePhoneNumber(newPhone);

  // Format 1: https://wa.me/{phone}?...
  if (url.includes('wa.me/')) {
    return url.replace(/wa\.me\/([0-9+]+)/, `wa.me/${cleanPhone}`);
  }

  // Format 2: https://api.whatsapp.com/send?...
  if (url.includes('api.whatsapp.com/send')) {
    try {
      const parsed = new URL(url, 'https://api.whatsapp.com');
      if (parsed.searchParams.has('phone')) {
        parsed.searchParams.set('phone', cleanPhone);
        return parsed.toString();
      }
    } catch {
      return url.replace(/phone=([0-9+]+)/, `phone=${cleanPhone}`);
    }
  }

  return url;
}

/**
 * Mengganti nomor tujuan pada tautan tel:
 */
export function replaceTelLinkPhone(url: string, newPhone: string): string {
  if (!url || !url.startsWith('tel:')) return url;
  const cleanPhone = normalizePhoneNumber(newPhone);
  const domesticPhone = cleanPhone.startsWith('62') ? '0' + cleanPhone.slice(2) : cleanPhone;
  return `tel:${domesticPhone}`;
}

/**
 * Mendeteksi base URL backend aman (mencegah pembajakan via origin tak sah)
 */
export function resolveApiBase(): string {
  return getApiBaseUrl();
}

/**
 * Menerapkan nomor telepon aktif ke seluruh elemen DOM terkait
 */
export function applyPhoneToDom(phone: string, display?: string): void {
  if (typeof document === 'undefined') return;

  const cleanPhone = normalizePhoneNumber(phone);
  const displayPhone = display || formatPhoneDisplay(cleanPhone);

  // 1. Perbarui seluruh tautan WhatsApp: a[href*="wa.me/"] & a[href*="api.whatsapp.com/send"]
  const waLinks = document.querySelectorAll<HTMLAnchorElement>('a[href*="wa.me/"], a[href*="api.whatsapp.com/send"]');
  waLinks.forEach((a) => {
    const originalHref = a.getAttribute('href');
    if (originalHref) {
      const updatedHref = replaceWaLinkPhone(originalHref, cleanPhone);
      if (updatedHref !== originalHref) {
        a.setAttribute('href', updatedHref);
      }
    }
  });

  // 2. Perbarui seluruh tautan tel:
  const telLinks = document.querySelectorAll<HTMLAnchorElement>('a[href^="tel:"]');
  telLinks.forEach((a) => {
    const originalHref = a.getAttribute('href');
    if (originalHref) {
      const updatedHref = replaceTelLinkPhone(originalHref, cleanPhone);
      if (updatedHref !== originalHref) {
        a.setAttribute('href', updatedHref);
      }
    }
  });

  // 3. Perbarui atribut data-phone pada kontainer/modal
  const phoneHolders = document.querySelectorAll<HTMLElement>('[data-phone]');
  phoneHolders.forEach((el) => {
    el.dataset.phone = cleanPhone;
  });

  // 4. Perbarui elemen teks tampilan nomor telepon
  const textDisplays = document.querySelectorAll<HTMLElement>('[data-contact-phone-display]');
  textDisplays.forEach((el) => {
    el.textContent = displayPhone;
  });

  const rawDisplays = document.querySelectorAll<HTMLElement>('[data-contact-phone]');
  rawDisplays.forEach((el) => {
    el.textContent = cleanPhone;
  });

  // 5. Kirim event custom agar modul JavaScript lain dapat bereaksi
  window.dispatchEvent(
    new CustomEvent('dzanis:contact-updated', {
      detail: { phone: cleanPhone, display: displayPhone },
    })
  );
}

let isSyncing = false;

/**
 * Memeriksa apakah fitur live backend sync diizinkan (default: false / Zero-Wake)
 */
export function isContactLiveSyncEnabled(): boolean {
  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('liveSync') === 'true' || urlParams.get('liveSync') === '1') {
      return true;
    }
    if ((window as any).__PUBLIC_ENABLE_LIVE_BACKEND_SYNC !== undefined) {
      return (window as any).__PUBLIC_ENABLE_LIVE_BACKEND_SYNC === 'true' || (window as any).__PUBLIC_ENABLE_LIVE_BACKEND_SYNC === true;
    }
  }
  return typeof import.meta !== 'undefined' && import.meta.env?.PUBLIC_ENABLE_LIVE_BACKEND_SYNC === 'true';
}

/**
 * Melakukan sinkronisasi nomor kontak dari cache & API backend
 */
export async function syncContact(forceNetwork = false): Promise<void> {
  if (typeof window === 'undefined') return;

  // Lapis 1: Muat dari localStorage (0ms load instant)
  try {
    const cachedPhone = localStorage.getItem(CACHE_KEY_PHONE);
    const cachedDisplay = localStorage.getItem(CACHE_KEY_DISPLAY);
    if (cachedPhone) {
      applyPhoneToDom(cachedPhone, cachedDisplay || undefined);
    }
  } catch {}

  // Zero-Wake Default: Jangan pernah memanggil backend via fetch jika live sync tidak aktif
  if (!forceNetwork && !isContactLiveSyncEnabled()) {
    return;
  }

  if (isSyncing) return;
  isSyncing = true;

  // Lapis 2: Background Revalidate ke backend API
  try {
    const apiBase = resolveApiBase();
    const headers: Record<string, string> = { Accept: 'application/json' };
    if (apiBase.includes('ngrok')) {
      headers['ngrok-skip-browser-warning'] = 'true';
    }

    const res = await fetch(`${apiBase}/api/contact?t=${Date.now()}`, {
      headers,
      cache: 'no-store',
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.success && data.phone) {
        const targetPhone = normalizePhoneNumber(data.phone);
        const targetDisplay = data.phone_display || formatPhoneDisplay(targetPhone);

        try {
          localStorage.setItem(CACHE_KEY_PHONE, targetPhone);
          localStorage.setItem(CACHE_KEY_DISPLAY, targetDisplay);
        } catch {}

        applyPhoneToDom(targetPhone, targetDisplay);
      }
    }
  } catch (err) {
    console.warn('[contactSync] Gagal menyelaraskan kontak dari backend, menggunakan nomor default/cache:', (err as Error)?.message || err);
  } finally {
    isSyncing = false;
  }
}

/**
 * Inisialisasi pengamat DOM & pendengar siklus hidup
 */
export function initContactSync(): void {
  if (typeof window === 'undefined') return;

  // Sinkronisasi awal (hanya dari cache lokal saat Zero-Wake mode)
  syncContact();

  // Sinkronisasi saat halaman selesai dimuat atau saat navigasi Astro View Transitions
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => syncContact(), { once: true });
  }

  document.addEventListener('astro:page-load', () => {
    // Terapkan nomor dari cache seketika pada halaman baru
    try {
      const cachedPhone = localStorage.getItem(CACHE_KEY_PHONE) || DEFAULT_FALLBACK_PHONE;
      const cachedDisplay = localStorage.getItem(CACHE_KEY_DISPLAY) || DEFAULT_FALLBACK_DISPLAY;
      applyPhoneToDom(cachedPhone, cachedDisplay);
    } catch {}
    if (isContactLiveSyncEnabled()) {
      syncContact();
    }
  });

  // Re-validasi saat tab kembali aktif (hanya saat live sync aktif)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && isContactLiveSyncEnabled()) {
      syncContact();
    }
  });

  window.addEventListener('focus', () => {
    if (isContactLiveSyncEnabled()) {
      syncContact();
    }
  });

  // Pengamat DOM untuk menangkap elemen/modal yang baru dirender secara dinamis
  try {
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;
    const observer = new MutationObserver(() => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        try {
          const cachedPhone = localStorage.getItem(CACHE_KEY_PHONE) || DEFAULT_FALLBACK_PHONE;
          const cachedDisplay = localStorage.getItem(CACHE_KEY_DISPLAY) || DEFAULT_FALLBACK_DISPLAY;
          applyPhoneToDom(cachedPhone, cachedDisplay);
        } catch {}
      }, 100);
    });

    if (document.body) {
      observer.observe(document.body, { childList: true, subtree: true });
    } else {
      document.addEventListener('DOMContentLoaded', () => {
        if (document.body) {
          observer.observe(document.body, { childList: true, subtree: true });
        }
      });
    }
  } catch {}
}

// Jalankan inisialisasi otomatis jika berjalan di browser
if (typeof window !== 'undefined') {
  initContactSync();
}
