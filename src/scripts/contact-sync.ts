/**
 * Contact Synchronizer (FE <-> BE Dynamic WhatsApp Phone Sync)
 * Menyelaraskan nomor kontak WhatsApp & telp di seluruh Front-End secara dinamis
 * mengikuti sesi aktif WhatsApp di Back-End (Baileys), dengan fallback default ke nomor resmi.
 */

export const DEFAULT_FALLBACK_PHONE = '6281324383858';
export const DEFAULT_FALLBACK_DISPLAY = '0813-2438-3858';

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
 * Mendeteksi base URL backend
 */
export function resolveApiBase(): string {
  if (typeof window === 'undefined') return 'https://dzaniez-back.ethiodeploy.app';
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const queryApi = urlParams.get('apiUrl');
    if (queryApi) return queryApi.replace(/\/+$/, '');

    const h = window.location.hostname;
    const isLocal =
      h === 'localhost' ||
      h === '127.0.0.1' ||
      h.startsWith('192.168.') ||
      h.startsWith('10.') ||
      h.endsWith('.local');
    if (isLocal) {
      return `${window.location.protocol}//${h || '127.0.0.1'}:8000`;
    }
  } catch {}
  return 'https://dzaniez-back.ethiodeploy.app';
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
 * Melakukan sinkronisasi nomor kontak dari cache & API backend
 */
export async function syncContact(): Promise<void> {
  if (typeof window === 'undefined') return;

  // Lapis 1: Muat dari localStorage (0ms load instant)
  try {
    const cachedPhone = localStorage.getItem(CACHE_KEY_PHONE);
    const cachedDisplay = localStorage.getItem(CACHE_KEY_DISPLAY);
    if (cachedPhone) {
      applyPhoneToDom(cachedPhone, cachedDisplay || undefined);
    }
  } catch {}

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

  // Sinkronisasi awal
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
    syncContact();
  });

  // Re-validasi saat tab kembali aktif
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      syncContact();
    }
  });

  window.addEventListener('focus', () => {
    syncContact();
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
