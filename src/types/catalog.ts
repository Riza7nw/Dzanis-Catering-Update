/**
 * Domain Type Definitions: Catalog Entities
 * Mencakup domain Paket Nasi Kotak, Snack Box, dan Layanan Lain.
 * Bersifat murni tanpa runtime JS dan aman di lingkungan SSR/SSG.
 */

export interface Paket {
  id: string;
  slug: string;
  nama: string;
  harga: number;
  minOrder: number;
  minOrderWeekend?: number;
  maxOrder?: number;
  badge?: string | null;
  kemasan: string;
  tags: string[];
  deskripsiSingkat: string;
  deskripsiLengkap: string;
  menuUtama: string[];
  laukPendamping: string[];
  sambalLalapan: string[];
  pelengkap: string[];
  foto: string;
  fotoAlt?: string;
  // Menu selection configuration
  canSelectMainMenu?: boolean;
  selectableMainMenus?: string[];
  selectableSideDishes?: string[];
  sideDishesSelectMin?: number;
  sideDishesSelectMax?: number;
  // Properti kompatibilitas tambahan
  ringkas?: string;
  populer?: boolean;
}

export interface SnackItem {
  nama: string;
  harga: number;
}

export interface SnackKategori {
  label: string;
  items: SnackItem[];
}

export interface SnackSlotItem {
  id: string;
  name: string;
  price: number;
}

export interface SnackSlot {
  name: string;
  default_item: string;
  options: string;
}

export interface SnackTemplatePackage {
  id: string;
  slug: string;
  name: string;
  category: string;
  price_per_pax: number;
  min_pax: number;
  badge?: string | null;
  description: string;
  image: string;
  foto?: string;
  items: string[];
  custom_slots?: SnackSlot[];
}

export interface LayananLain {
  id: string;
  slug: string;
  nama: string;
  badge?: string | null;
  headlineHarga: string;
  satuanHarga: string;
  minOrder: string;
  deskripsi: string;
  fasilitas: string[];
  menuHighlight: string[];
  foto: string;
  fotoAlt: string;
}
