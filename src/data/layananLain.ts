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

export interface LayananPrasmananData {
  eyebrow: string;
  heading: string;
  deskripsi: string;
  harga: string;
  satuanHarga: string;
  minOrder: string;
  fasilitas: string[];
  menuPopuler: string[];
  catatanMenu?: string;
  gallery: {
    foto: string;
    alt: string;
    label: string;
    sublabel: string;
  }[];
  captionEditorial: string;
  waPreFilledMessage: string;
}

export const LAYANAN_PRASMANAN_SSOT: LayananPrasmananData = {
  eyebrow: "LAYANAN KHUSUS",
  heading: "Layanan Prasmanan Kantor & Acara",
  deskripsi:
    "Solusi jamuan prasmanan higienis siap saji untuk rapat kerja, seminar, syukuran, dan resepsi di Majalengka & sekitarnya.",
  harga: "Rp 45.000",
  satuanHarga: "/ pax",
  minOrder: "Min. 50 Pax",
  fasilitas: [
    "Meja & Pemanas (Chafing Dish)",
    "Piring Keramik & Sendok Garpu",
    "Tenaga Waiter / Setup",
  ],
  menuPopuler: [
    "Gurame Asam Manis",
    "Ayam Kampung Pilihan",
    "Sayuran & Tumisan",
    "Sambal & Lalapan Segar",
  ],
  catatanMenu: "Pilihan menu fleksibel & dapat dikustomisasi sesuai anggaran acara",
  gallery: [
    {
      foto: "/images/layanan/prasmanan-kantor.webp",
      alt: "Setup Rapat Kantor Dzanis Catering Majalengka",
      label: "Setup Rapat Kantor",
      sublabel: "Rapat & Corporate Gathering",
    },
    {
      foto: "/images/layanan/wedding-catering.webp",
      alt: "Setup Resepsi / Acara Dzanis Catering",
      label: "Setup Resepsi / Acara",
      sublabel: "Resepsi & Syukuran Keluarga",
    },
  ],
  captionEditorial: "Dokumentasi setup meja saji higienis & chafing dish Dzanis",
  waPreFilledMessage:
    "Halo Dzanis Catering, saya ingin konsultasi paket prasmanan (min. 50 pax) untuk acara...",
};

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
      "Solusi prasmanan siap saji higienis dan praktis untuk rapat kerja, pelatihan, seminar, dan syukuran kantor. Pilihan sayuran bebas pilih dan menu fleksibel dengan opsi tambahan sesuai permintaan klien.",
    fasilitas: [
      "Meja & Pemanas (Chafing Dish)",
      "Piring Keramik & Sendok Garpu",
    ],
    menuHighlight: [
      "Gurame Asam Manis",
      "Ayam Kampung (Opor / Goreng)",
      "Pilihan Sayuran (Capcay / Tumis)",
      "Sambal & Lalapan Segar",
      "+ Tambahan Menu Kustom Klien",
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
