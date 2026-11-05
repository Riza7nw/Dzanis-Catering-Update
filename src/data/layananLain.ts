/**
 * Data Layer: Layanan Prasmanan Kantor & Acara
 * Mendefinisikan interface LayananLain dan koleksi DAFTAR_LAYANAN_LAIN.
 */

export interface LayananLain {
  id: string;
  slug: string;
  nama: string;
  title?: string;
  badge?: string | null;

  headlineHarga: string;
  satuanHarga: string;
  minOrder: string;
  deskripsi: string;
  fasilitas: string[];
  menuHighlight: string[];
  foto: string;
  fotoAlt: string;
  galeri?: { src: string; alt: string }[];
}

export const DAFTAR_LAYANAN_LAIN: LayananLain[] = [
  {
    id: "prasmanan-kantor",
    slug: "prasmanan-kantor",
    nama: "Prasmanan Kantor",
    badge: "Layanan Acara & Rapat",
    headlineHarga: "Rp 45.000",
    satuanHarga: "/ pax",
    minOrder: "Min. 50 pax",
    deskripsi:
      "Solusi prasmanan siap saji higienis dan praktis untuk rapat kerja, pelatihan, seminar, gathering, dan syukuran kantor.",
    fasilitas: [
      "Meja & Pemanas (Chafing Dish)",
      "Piring Keramik & Sendok Garpu",
    ],
    menuHighlight: [
      "Nasi Putih & Nasi Goreng Mentega",
      "Daging Lada Hitam / Rolade",
      "Ayam Teriyaki / Rica",
      "Sup Kimlo Segar",
      "Puding Cup & Buah Potong",
    ],
    foto: "/images/layanan/prasmanan-kantor.webp",
    fotoAlt: "Layanan Prasmanan Kantor Dzanis Catering Majalengka",
    galeri: [
      {
        src: "/images/layanan/prasmanan-kantor.webp",
        alt: "Dokumentasi Menu Prasmanan Meja Rapat Dzanis Catering",
      },
      {
        src: "/images/layanan/prasmanan-kantor-2.webp",
        alt: "Dokumentasi Sajian Prasmanan Siap Saji Dzanis Catering",
      },
    ],
  },
];
