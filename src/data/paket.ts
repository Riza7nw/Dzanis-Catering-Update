/**
 * Data Layer: Paket Nasi Kotak Dzanis Catering
 * Berisi definisi tipe eksplisit Paket, master pool lauk, dan dataset DAFTAR_PAKET.
 */

import type { Paket } from '../types/catalog';
export type { Paket };

/**
 * Menghilangkan akhiran angka + K (misal " 20K", " 23K") dari nama paket untuk tampilan UI.
 * Contoh: "Paket Hemat 20K" -> "Paket Hemat"
 */
export function formatNamaPaket(nama: string): string {
  if (!nama) return '';
  return nama.replace(/\s*\d+K$/i, '').trim();
}

/**
 * Master Pool Lauk Pendamping Paket Favorit 23K (Pilih 3 Lauk)
 */
export const POOL_LAUK_23K: string[] = [
  "Bihun goreng",
  "Soun",
  "Mie goreng",
  "Capcay",
  "Buncis jagung manis",
  "Kacang panjang",
  "Kacang panjang toge",
  "Sambal goreng kentang",
  "Waluh jagung manis",
];

/**
 * Master Pool Lauk Pendamping Paket Spesial 25K & Paket Ayam Kampung 28K (Pilih 2-3 Lauk)
 */
export const POOL_LAUK_25K_28K: string[] = [
  "Buncis jagung muda",
  "Jagung muda (putren)",
  "Toge jambal roti",
  "Pokcoy bawang putih",
  "Sambal goreng ati / jando",
  "Sambal goreng kentang",
  "Capcay",
];

export const DAFTAR_PAKET: Paket[] = [
  {
    id: "paket-hemat-20k",
    slug: "paket-hemat-20k",
    nama: "Paket Hemat 20K",
    harga: 20000,
    minOrder: 20,
    minOrderWeekend: 40,
    maxOrder: 500,
    badge: null,
    kemasan: "Box Kraft 18x18 cm",
    tags: ["Nasi Pulen", "Ayam & Tahu Tempe", "Sambal Terasi"],
    deskripsiSingkat:
      "Pilihan hemat praktis untuk konsumsi pengajian, syukuran, atau rapat internal.",
    deskripsiLengkap:
      "Pilihan hemat dan praktis untuk berbagai kebutuhan acara seperti pengajian, syukuran, dan rapat internal. Setiap porsi dikemas higienis menggunakan box kraft ramah lingkungan, lengkap dengan alat makan steril dan komposisi menu komplit nasi putih pulen, olahan ayam gurih, tahu tempe, serta sambal terasi matang.",
    menuUtama: [
      "Ayam Goreng Serundeng Lengkuas",
      "Tahu & Tempe Goreng Gurih",
    ],
    laukPendamping: [
      "Tahu & Tempe Goreng Gurih",
    ],
    sambalLalapan: [
      "Sambal Terasi Matang",
      "Lalapan Timun Segar",
    ],
    pelengkap: [
      "Nasi Putih Pulen",
      "Kerupuk Bawang",
      "Air Mineral Cup",
      "Sendok & Tisu Steril",
    ],
    foto: "/images/menu/paket-20k.webp",
    fotoAlt: "Paket hemat nasi kotak Dzanis Katering Majalengka",
    // Fixed Bundling (Zero racik)
    canSelectMainMenu: false,
    selectableMainMenus: [],
    selectableSideDishes: [],
    sideDishesSelectMin: 0,
    sideDishesSelectMax: 0,
    ringkas:
      "Nasi putih · ayam goreng serundeng · tahu & tempe goreng · sambal terasi · kerupuk",
    populer: false,
  },
  {
    id: "paket-favorit-23k",
    slug: "paket-favorit-23k",
    nama: "Paket Favorit 23K",
    harga: 23000,
    minOrder: 20,
    minOrderWeekend: 40,
    maxOrder: 500,
    badge: "PALING SERING DIPESAN",
    kemasan: "Box Bento Sekat 4",
    tags: ["Nasi Pulen", "Olahan Ayam", "3 Lauk Pendamping", "Kerupuk"],
    deskripsiSingkat:
      "Kombinasi olahan ayam lezat dengan 3 lauk pendamping pilihan, menu terfavorit untuk seminar dan instansi.",
    deskripsiLengkap:
      "Pilihan terfavorit yang paling sering dipesan untuk kebutuhan seminar, workshop instansi, dan acara korporat. Mengombinasikan sajian olahan ayam lezat dengan keleluasaan memilih 3 lauk pendamping favorit dari 9 pilihan menu tradisional, disajikan rapi dalam kemasan bento higienis.",
    menuUtama: [
      "Ayam Bakar",
      "Ayam Goreng",
    ],
    laukPendamping: [
      "Bihun goreng",
      "Capcay",
      "Sambal goreng kentang",
    ],
    sambalLalapan: [
      "Sambal Bajak / Sambal Terasi",
      "Lalapan Segar",
    ],
    pelengkap: [
      "Nasi Putih Pulen",
      "Buah Pisang Segar",
      "Kerupuk Renyah",
      "Air Mineral Cup",
      "Sendok & Tisu Steril",
    ],
    foto: "/images/menu/paket-23k.webp",
    fotoAlt: "Layanan katering prasmanan dan nasi boks Dzanis Catering Ciayumajakuning",
    // Fixed Bundling (Zero racik karena harga < 25.000)
    canSelectMainMenu: false,
    selectableMainMenus: [],
    selectableSideDishes: [],
    sideDishesSelectMin: 0,
    sideDishesSelectMax: 0,
    ringkas:
      "Nasi putih · olahan ayam · 3 lauk pendamping pilihan · buah pisang · sambal · kerupuk",
    populer: true,
  },
  {
    id: "paket-spesial-25k",
    slug: "paket-spesial-25k",
    nama: "Paket Spesial 25K",
    harga: 25000,
    minOrder: 20,
    minOrderWeekend: 40,
    maxOrder: 500,
    badge: null,
    kemasan: "Box Exclusive Laminasi 20x20 cm",
    tags: ["Nasi Pulen", "Olahan Daging & Ayam", "Lauk Pilihan", "Kerupuk Udang"],
    deskripsiSingkat:
      "Paket hidangan premium lengkap dengan variasi olahan daging dan ayam untuk hidangan acara resmi.",
    deskripsiLengkap:
      "Sajian istimewa kelas premium untuk acara resmi, jamuan tamu kehormatan, arisan besar, dan hajatan keluarga. Dikemas dalam box eksklusif laminasi berukuran 20x20 cm dengan kombinasi olahan daging sapi dan ayam, dipadukan lauk pendamping istimewa serta kerupuk udang renyah.",
    menuUtama: [
      "Rolade Daging Sapi Olahan",
      "Ayam Rica Kemangi",
      "Ayam Goreng Serundeng Lengkuas",
    ],
    laukPendamping: [
      "Sambal goreng ati / jando",
      "Capcay",
      "Buncis jagung muda",
    ],
    sambalLalapan: [
      "Sambal Goreng Cabe Merah",
      "Lalapan Timun & Kemangi",
    ],
    pelengkap: [
      "Nasi Putih Pulen",
      "Kerupuk Udang",
      "Buah Segar / Puding Cup",
      "Air Mineral Cup",
      "Sendok, Tusuk Gigi & Tisu Steril",
    ],
    foto: "/images/menu/paket-25k.webp",
    fotoAlt: "Paket katering prasmanan dan nasi kotak spesial Dzanis Catering Majalengka",
    // Menu selection: 1 Main Menu, 2-3 Side Dishes dari POOL_LAUK_25K_28K
    canSelectMainMenu: true,
    selectableMainMenus: [
      "Rolade Daging Sapi Olahan",
      "Ayam Rica Kemangi",
      "Ayam Goreng Serundeng Lengkuas",
    ],
    selectableSideDishes: POOL_LAUK_25K_28K,
    sideDishesSelectMin: 2,
    sideDishesSelectMax: 3,
    ringkas:
      "Nasi putih · rolade daging sapi / ayam · 2-3 lauk pilihan · kerupuk udang · buah segar",
    populer: false,
  },
  {
    id: "paket-ayam-kampung-28k",
    slug: "paket-ayam-kampung-28k",
    nama: "Paket Ayam Kampung 28K",
    harga: 28000,
    minOrder: 20,
    minOrderWeekend: 40,
    maxOrder: 500,
    badge: "AYAM KAMPUNG ASLI",
    kemasan: "Box Exclusive Laminasi 20x20 cm",
    tags: ["Nasi Pulen", "Ayam Kampung Asli", "Lauk Pilihan", "Kerupuk Udang"],
    deskripsiSingkat:
      "Sajian istimewa dengan olahan ayam kampung asli pilihan, bumbu rempah tradisional, dan lauk pendamping kustom.",
    deskripsiLengkap:
      "Sajian hidangan istimewa menggunakan olahan ayam kampung asli pilihan yang dimasak empuk dengan racikan bumbu rempah tradisional khas Dzanis Catering. Dilengkapi dengan keleluasaan memilih 2 hingga 3 lauk pendamping, lalapan segar, sambal nikmat, dan disajikan higienis dalam box eksklusif laminasi 20x20 cm.",
    menuUtama: [
      "Ayam Kampung Goreng Serundeng Lengkuas",
      "Ayam Kampung Bakar Bumbu Rujak",
    ],
    laukPendamping: [
      "Sambal goreng ati / jando",
      "Capcay",
      "Buncis jagung muda",
    ],
    sambalLalapan: [
      "Sambal Terasi Matang",
      "Lalapan Timun & Kemangi",
    ],
    pelengkap: [
      "Nasi Putih Pulen",
      "Kerupuk Udang",
      "Buah Segar / Puding Cup",
      "Air Mineral Cup",
      "Sendok, Tusuk Gigi & Tisu Steril",
    ],
    foto: "/images/menu/paket-25k.webp",
    fotoAlt: "Paket katering nasi kotak ayam kampung Dzanis Catering Ciayumajakuning",
    // Menu selection: 1 Main Menu, 2-3 Side Dishes dari POOL_LAUK_25K_28K
    canSelectMainMenu: true,
    selectableMainMenus: [
      "Ayam Kampung Goreng Serundeng Lengkuas",
      "Ayam Kampung Bakar Bumbu Rujak",
    ],
    selectableSideDishes: POOL_LAUK_25K_28K,
    sideDishesSelectMin: 2,
    sideDishesSelectMax: 3,
    ringkas:
      "Nasi putih · olahan ayam kampung asli · 2-3 lauk pilihan · kerupuk udang · buah segar",
    populer: false,
  },
];

export const paket = DAFTAR_PAKET;
