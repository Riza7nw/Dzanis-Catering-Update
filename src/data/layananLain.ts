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
    "Solusi jamuan prasmanan dan catering acara higienis siap saji untuk rapat kerja, seminar, syukuran, hingga resepsi pernikahan di Majalengka & seluruh Ciayumajakuning.",
  harga: "Rp 45.000",
  satuanHarga: "/ porsi",
  minOrder: "Min. 50 Pax",
  fasilitas: [
    "Meja & Pemanas (Chafing Dish)",
    "Piring Keramik & Sendok Garpu",
    "Tenaga Waiter & Setup Standby",
  ],
  menuPopuler: [
    "Gurame Asam Manis",
    "Ayam Kampung (Opor / Goreng)",
    "Sayuran & Tumisan Segar",
    "Sambal & Lalapan Tradisional",
  ],
  catatanMenu: "Menu fleksibel dapat dikustomisasi",
  gallery: [
    {
      foto: "/images/layanan/prasmanan-kantor.webp",
      alt: "Setup Meja Prasmanan Kantor Dzanis Catering Majalengka",
      label: "Setup Meja Kantor & Rapat",
      sublabel: "Rapat & Corporate Gathering",
    },
    {
      foto: "/images/layanan/wedding-catering.webp",
      alt: "Setup Buffet Acara Dzanis Catering Ciayumajakuning",
      label: "Setup Meja Resepsi & Acara",
      sublabel: "Resepsi & Syukuran Keluarga",
    },
  ],
  captionEditorial: "Peralatan steril & pemanas siap saji di lokasi",
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
      "Solusi jamuan prasmanan dan katering acara higienis siap saji untuk rapat kerja, pelatihan, seminar, dan syukuran kantor di Majalengka & sekitarnya. Pilihan sayuran bebas pilih dan menu fleksibel dengan opsi tambahan sesuai permintaan klien.",
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
    fotoAlt: "Layanan Prasmanan dan Catering Kantor Dzanis Catering Majalengka & Ciayumajakuning",
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
