/**
 * Data Layer: Layanan Lain (Prasmanan, Food Cart, Acara & Pernikahan)
 * Mendefinisikan interface LayananLain dan koleksi DAFTAR_LAYANAN_LAIN.
 */

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

export const DAFTAR_LAYANAN_LAIN: LayananLain[] = [
  {
    id: "prasmanan-kantor",
    slug: "prasmanan-kantor",
    nama: "Prasmanan Kantor",
    badge: null,
    headlineHarga: "Rp 45.000",
    satuanHarga: "/ pax",
    minOrder: "Min. 50 pax",
    deskripsi:
      "Menu prasmanan lengkap untuk rapat kerja, pelatihan, seminar, dan syukuran kantor.",
    fasilitas: [
      "Meja & Pemanas (Chafing Dish)",
      "Piring Keramik & Sendok Garpu",
      "1 Staff Waiter Stand-by",
    ],
    menuHighlight: [
      "Nasi Putih & Nasi Goreng Mentega",
      "Daging Lada Hitam / Rolade",
      "Ayam Teriyaki / Rica",
      "Sup Kimlo Segar",
      "Puding Cup & Buah Potong",
    ],
    foto: "/images/layanan/prasmanan-kantor.webp",
    fotoAlt: "Layanan Prasmanan Kantor Dzanis Catering",
  },
  {
    id: "booth-food-cart",
    slug: "booth-food-cart",
    nama: "Booth / Food Cart",
    badge: "POPULER UNTUK BAZAR",
    headlineHarga: "Rp 3.500.000",
    satuanHarga: "/ stall (200 porsi)",
    minOrder: "Min. 1 Booth",
    deskripsi:
      "Gerai makanan live-serving untuk memeriahkan festival, bazar, ulang tahun, dan gathering komunitas.",
    fasilitas: [
      "1 Unit Gerobak Kayu Tematik",
      "1 Staff Operator Siap Saji (3-4 Jam)",
      "Mangkok / Paper Bowl Ramah Lingkungan",
    ],
    menuHighlight: [
      "Bakso Sapi Malang Komplit",
      "Siomay Bandung Bumbu Kacang",
      "Zuppa Soup Hangat Puff Pastry",
      "Dimsum Kukus 4 Varian",
    ],
    foto: "/images/layanan/food-cart.webp",
    fotoAlt: "Booth dan Food Cart Live Serving Dzanis Catering",
  },
  {
    id: "catering-acara-pernikahan",
    slug: "catering-acara-pernikahan",
    nama: "Catering Acara & Pernikahan",
    badge: null,
    headlineHarga: "Rp 75.000",
    satuanHarga: "/ pax",
    minOrder: "Min. 200 pax",
    deskripsi:
      "Layanan boga komprehensif untuk resepsi pernikahan, akad nikah, lamaran, dan syukuran keluarga besar.",
    fasilitas: [
      "Setup Dekorasi Meja Buffet",
      "Peralatan Makan Lengkap & Steril",
      "Tim Waiter & Runner Berseragam",
      "Gratis Food Tasting (4 Pax)",
    ],
    menuHighlight: [
      "Nasi Liwet Wangi / Biryani",
      "Daging Rendang Empuk / Bistik Sapi",
      "Ayam Suwir Bali / Kodok",
      "Kakap Asam Manis Segar",
      "Dessert Bar & Es Tradisional",
    ],
    foto: "/images/layanan/wedding-catering.webp",
    fotoAlt: "Catering Acara dan Resepsi Pernikahan Dzanis Catering",
  },
];
