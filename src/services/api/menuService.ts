/**
 * Service: Menu & Catalog Service (Anti-Corruption Layer)
 * Bertanggung jawab mengambil data paket dari backend /api/menu dengan
 * normalisasi skema DTO ke domain Paket dan fallback offline penuh ke DAFTAR_PAKET.
 */

import type { Paket, SnackTemplatePackage, SnackSlot } from '../../types/catalog';
import type { BackendPackageDto } from '../../types/api';
import { DAFTAR_PAKET } from '../../data/paket';
import { defaultSnackTemplates } from '../../data/snack';
import { getApiBaseUrl, getCommonApiHeaders, DEFAULT_TIMEOUT_MS } from './apiConfig';

/**
 * Normalizer Adapter (Anti-Corruption Layer):
 * Memetakan BackendPackageDto mentah (snake_case, flat items, English keys)
 * ke Domain Model Paket terstruktur TypeScript.
 */
export function normalizePackage(dto: BackendPackageDto, fallbackList: Paket[] = DAFTAR_PAKET): Paket {
  // Normalisasi slug untuk menyelaraskan slug backend "paket-bento-spesial-25k" dengan SSG frontend "paket-spesial-25k"
  let slug = dto.slug || dto.id || 'paket';
  if (slug === 'paket-bento-spesial-25k' || slug === 'pkg-bento-spesial-25k') {
    slug = 'paket-spesial-25k';
  }

  // Cari referensi paket lokal untuk melengkapi metadata yang tidak disimpan di backend (kemasan, tags, pilihan menu)
  const matchedLocal = fallbackList.find(
    (p) => p.slug === slug || p.id === dto.id || (dto.slug && p.slug === dto.slug)
  );

  const rawNama = dto.name || dto.nama || matchedLocal?.nama || 'Paket Nasi Kotak';
  const harga = Number(dto.price_per_pax || dto.harga || matchedLocal?.harga || 0);
  const minOrder = Number(dto.min_pax || dto.minOrder || matchedLocal?.minOrder || 20);

  // Normalisasi URL foto
  let foto = dto.image || dto.foto || dto.gambar || matchedLocal?.foto || '/images/menu/paket-20k.webp';
  if (foto.startsWith('uploads/')) {
    foto = '/' + foto;
  }
  if (foto.startsWith('/uploads/')) {
    const apiBase = getApiBaseUrl();
    foto = `${apiBase}${foto}`;
  }

  // Parse items jika bertipe string atau array
  let flatItems: string[] = [];
  if (Array.isArray(dto.items)) {
    flatItems = dto.items;
  } else if (typeof dto.items === 'string') {
    try {
      const parsed = JSON.parse(dto.items);
      flatItems = Array.isArray(parsed) ? parsed : [dto.items];
    } catch {
      flatItems = dto.items.split(/[\n,]+/).map((s) => s.trim()).filter(Boolean);
    }
  }

  const menuUtama = matchedLocal?.menuUtama || (flatItems.length > 0 ? flatItems.slice(0, 2) : ['Menu Utama Pilihan']);
  const laukPendamping = matchedLocal?.laukPendamping || (flatItems.length > 2 ? flatItems.slice(2) : []);
  const sambalLalapan = matchedLocal?.sambalLalapan || ['Sambal Terasi Matang', 'Lalapan Timun Segar'];
  const pelengkap = matchedLocal?.pelengkap || ['Nasi Putih Pulen', 'Kerupuk Renyah'];
  const tags = matchedLocal?.tags || (flatItems.length > 0 ? flatItems.slice(0, 3) : ['Nasi Pulen', 'Higienis']);

  return {
    id: dto.id || matchedLocal?.id || `paket-${slug}`,
    slug,
    nama: rawNama,
    harga,
    minOrder,
    badge: dto.badge !== undefined ? dto.badge : (matchedLocal?.badge ?? null),
    kemasan: matchedLocal?.kemasan || 'Box Bento Sekat',
    tags,
    deskripsiSingkat: dto.description || dto.deskripsiSingkat || dto.deskripsi || matchedLocal?.deskripsiSingkat || '',
    deskripsiLengkap: matchedLocal?.deskripsiLengkap || dto.description || '',
    menuUtama,
    laukPendamping,
    sambalLalapan,
    pelengkap,
    foto,
    fotoAlt: matchedLocal?.fotoAlt || rawNama,
    canSelectMainMenu: matchedLocal?.canSelectMainMenu ?? false,
    selectableMainMenus: matchedLocal?.selectableMainMenus || menuUtama,
    selectableSideDishes: matchedLocal?.selectableSideDishes || laukPendamping,
    sideDishesSelectMin: matchedLocal?.sideDishesSelectMin ?? 2,
    sideDishesSelectMax: matchedLocal?.sideDishesSelectMax ?? 3,
    ringkas: matchedLocal?.ringkas,
    populer: matchedLocal?.populer ?? Boolean(dto.badge?.toLowerCase().includes('favorit')),
  };
}

/**
 * Mengambil katalog paket Nasi Kotak aktif.
 * Mencoba memanggil backend API, jika offline/gagal akan otomatis fallback ke DAFTAR_PAKET.
 */
export async function getMenuCatalog(): Promise<Paket[]> {
  try {
    const apiBase = getApiBaseUrl();
    const res = await fetch(`${apiBase}/api/menu`, {
      headers: getCommonApiHeaders(),
      signal: AbortSignal.timeout(DEFAULT_TIMEOUT_MS),
    });

    if (res.ok) {
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await res.json();
        const rawPackages: BackendPackageDto[] = Array.isArray(data)
          ? data
          : Array.isArray(data?.packages)
          ? data.packages
          : Array.isArray(data?.data)
          ? data.data
          : [];

        // Filter paket khusus kategori Nasi Kotak
        const nasiKotakDtos = rawPackages.filter((p) => {
          if (!p.category) return true; // jika kategori tidak ditentukan, anggap nasi kotak
          const cat = p.category.toLowerCase();
          return cat.includes('nasi') || cat.includes('kotak') || cat.includes('box');
        });

        if (nasiKotakDtos.length > 0) {
          return nasiKotakDtos.map((dto) => normalizePackage(dto, DAFTAR_PAKET));
        }
      }
    }
  } catch (err) {
    // Fallback cadangan senyap saat build/client offline agar Astro build tidak pernah gagal
    if (import.meta.env?.DEV) {
      console.warn('[menuService] Backend offline, menggunakan fallback SSOT DAFTAR_PAKET:', (err as Error)?.message || err);
    }
  }

  return DAFTAR_PAKET;
}

/**
 * Mengambil satu paket berdasarkan slug rute statis.
 */
export async function getPackageBySlug(slug: string): Promise<Paket | undefined> {
  const catalog = await getMenuCatalog();
  const found = catalog.find((p) => p.slug === slug);
  if (found) return found;

  // Fallback sekunder langsung ke DAFTAR_PAKET
  return DAFTAR_PAKET.find((p) => p.slug === slug);
}

/**
 * Mengambil template paket Snack Box dari API backend atau fallback lokal.
 */
export async function getSnackTemplates(): Promise<SnackTemplatePackage[]> {
  try {
    const apiBase = getApiBaseUrl();
    const res = await fetch(`${apiBase}/api/menu`, {
      headers: getCommonApiHeaders(),
      signal: AbortSignal.timeout(DEFAULT_TIMEOUT_MS),
    });

    if (res.ok) {
      const data = await res.json();
      const rawPackages: BackendPackageDto[] = Array.isArray(data)
        ? data
        : Array.isArray(data?.packages)
        ? data.packages
        : Array.isArray(data?.data)
        ? data.data
        : [];

      const snackDtos = rawPackages.filter((p) =>
        String(p.category || '').toLowerCase().includes('snack')
      );

      if (snackDtos.length > 0) {
        return snackDtos.map((p) => {
          let slots: SnackSlot[] = [];
          if (p.custom_slots) {
            slots = typeof p.custom_slots === 'string' ? JSON.parse(p.custom_slots) : p.custom_slots;
          } else if (Array.isArray(p.items)) {
            slots = p.items.map((it: string, idx: number) => ({
              name: `Slot ${idx + 1}`,
              default_item: it,
              options: it,
            }));
          }

          return {
            id: p.id || p.slug || 'snack-pkg',
            slug: p.slug || p.id || 'snack-pkg',
            name: p.name || 'Paket Snack Box',
            category: p.category || 'Snack Box',
            price_per_pax: Number(p.price_per_pax || p.harga || 15000),
            min_pax: Number(p.min_pax || p.minOrder || 20),
            badge: p.badge || 'Snack',
            description: p.description || p.deskripsi || '',
            image: p.image || p.foto || '/images/menu/snack-puding.webp',
            foto: p.foto || p.image || '/images/menu/snack-puding.webp',
            items: Array.isArray(p.items) ? p.items : [],
            custom_slots: slots,
          };
        });
      }
    }
  } catch {
    // Fallback ke defaultSnackTemplates
  }

  return defaultSnackTemplates;
}
