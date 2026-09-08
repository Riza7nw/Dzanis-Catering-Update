/**
 * Data Layer: Paket Nasi Kotak Dzanis Catering
 * Berisi definisi tipe eksplisit Paket dan dataset DAFTAR_PAKET.
 */

export interface Paket {
  id: string;
  slug: string;
  nama: string;
  harga: number;
  minOrder: number;
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
<<<<<<< HEAD
=======
  // Menu selection configuration
  canSelectMainMenu?: boolean;
  selectableMainMenus?: string[];
  selectableSideDishes?: string[];
  sideDishesSelectMin?: number;
  sideDishesSelectMax?: number;
>>>>>>> aafabf1 (feat: migrate project to Astro storefront)
  // Properti kompatibilitas tambahan
  ringkas?: string;
  populer?: boolean;
}

export const DAFTAR_PAKET: Paket[] = [
  {
    id: "paket-hemat-20k",
    slug: "paket-hemat-20k",
    nama: "Paket Hemat 20K",
    harga: 20000,
    minOrder: 20,
    badge: null,
    kemasan: "Box Kraft 18x18 cm",
    tags: ["Nasi Pulen", "Sambal Terasi", "Kerupuk"],
    deskripsiSingkat:
      "Pilihan hemat praktis untuk konsumsi pengajian, syukuran, atau rapat internal.",
    deskripsiLengkap:
      "Pilihan hemat dan praktis untuk berbagai kebutuhan acara seperti pengajian, syukuran, dan rapat internal. Setiap porsi dikemas higienis menggunakan box kraft ramah lingkungan, lengkap dengan alat makan steril dan lauk pauk berkualitas yang diolah secara higienis.",
    menuUtama: [
      "Ayam Goreng Serundeng Lengkuas",
      "Tahu & Tempe Goreng Gurih",
    ],
    laukPendamping: [
      "Oseng Kacang Panjang Tempe",
      "Bihun Goreng Sayur",
      "Tumis Buncis Jagung",
      "Capcay Gurih",
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
    foto: "/images/menu/paket-20k.jpg",
    fotoAlt: "Paket Hemat 20K Dzanis Catering",
<<<<<<< HEAD
=======
    // Menu selection
    canSelectMainMenu: true,
    selectableMainMenus: [
      "Ayam Goreng Serundeng Lengkuas",
      "Tahu & Tempe Goreng Gurih",
    ],
    selectableSideDishes: [
      "Oseng Kacang Panjang Tempe",
      "Bihun Goreng Sayur",
      "Tumis Buncis Jagung",
      "Capcay Gurih",
    ],
    sideDishesSelectMin: 2,
    sideDishesSelectMax: 3,
>>>>>>> aafabf1 (feat: migrate project to Astro storefront)
    ringkas:
      "Ayam goreng serundeng · tahu tempe · oseng kacang panjang · sambal terasi · kerupuk",
    populer: false,
  },
  {
    id: "paket-favorit-23k",
    slug: "paket-favorit-23k",
    nama: "Paket Favorit 23K",
    harga: 23000,
    minOrder: 20,
    badge: "PALING SERING DIPESAN",
    kemasan: "Box Bento Sekat 4",
    tags: ["Nasi Pulen", "Telur Balado 1/2", "Pisang", "Kerupuk"],
    deskripsiSingkat:
      "Kombinasi dua protein dengan buah pencuci mulut, menu terfavorit untuk seminar dan instansi.",
    deskripsiLengkap:
      "Pilihan terfavorit yang paling sering dipesan untuk kebutuhan seminar, workshop instansi, dan acara korporat. Mengombinasikan dua varian protein lezat dengan pelengkap buah pisang segar serta disajikan rapi dalam kemasan bento bersekat higienis.",
    menuUtama: [
      "Ayam Bakar Madu / Ayam Goreng Lengkuas",
      "Telur Balado 1/2 Butir",
    ],
    laukPendamping: [
      "Bakmi Goreng Gurih",
      "Capcay Bakso Sayur",
      "Sambal Goreng Kentang",
      "Tempe Orek Manis Gurih",
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
    foto: "/images/menu/paket-23k.jpg",
    fotoAlt: "Paket Favorit 23K Dzanis Catering",
<<<<<<< HEAD
=======
    // Menu selection
    canSelectMainMenu: true,
    selectableMainMenus: [
      "Ayam Bakar Madu",
      "Ayam Goreng Lengkuas",
      "Telur Balado 1/2 Butir",
    ],
    selectableSideDishes: [
      "Bakmi Goreng Gurih",
      "Capcay Bakso Sayur",
      "Sambal Goreng Kentang",
      "Tempe Orek Manis Gurih",
    ],
    sideDishesSelectMin: 2,
    sideDishesSelectMax: 3,
>>>>>>> aafabf1 (feat: migrate project to Astro storefront)
    ringkas:
      "Ayam bakar madu · telur balado 1/2 · bakmi goreng gurih · sambal · pisang",
    populer: true,
  },
  {
    id: "paket-spesial-25k",
    slug: "paket-spesial-25k",
    nama: "Paket Spesial 25K",
    harga: 25000,
    minOrder: 20,
    badge: null,
    kemasan: "Box Exclusive Laminasi 20x20 cm",
    tags: ["Nasi Pulen", "Sambal Goreng Ati", "Buah Segar", "Kerupuk Udang"],
    deskripsiSingkat:
      "Paket hidangan premium lengkap dengan variasi olahan hewani dan hidangan penutup acara resmi.",
    deskripsiLengkap:
      "Sajian istimewa kelas premium untuk acara resmi, jamuan tamu kehormatan, arisan besar, dan hajatan keluarga. Dikemas dalam box eksklusif laminasi berukuran 20x20 cm dengan lauk pauk olahan daging dan ayam rica, sambal goreng ati kentang, serta kerupuk udang renyah.",
    menuUtama: [
      "Rolade Daging Sapi Olahan / Ayam Rica Kemangi",
      "Telur Balado Bumbu Merah",
    ],
    laukPendamping: [
      "Sambal Goreng Ati Kentang",
      "Capcay Bakso Sosis",
      "Mie Goreng Spesial",
      "Tumis Buncis Jagung Manis",
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
    foto: "/images/menu/paket-25k.jpg",
    fotoAlt: "Paket Spesial 25K Dzanis Catering",
<<<<<<< HEAD
=======
    // Menu selection
    canSelectMainMenu: true,
    selectableMainMenus: [
      "Rolade Daging Sapi Olahan",
      "Ayam Rica Kemangi",
      "Telur Balado Bumbu Merah",
    ],
    selectableSideDishes: [
      "Sambal Goreng Ati Kentang",
      "Capcay Bakso Sosis",
      "Mie Goreng Spesial",
      "Tumis Buncis Jagung Manis",
    ],
    sideDishesSelectMin: 2,
    sideDishesSelectMax: 3,
>>>>>>> aafabf1 (feat: migrate project to Astro storefront)
    ringkas:
      "Ayam rica-rica / rolade daging · sambal goreng ati kentang · capcay bakso · kerupuk udang",
    populer: false,
  },
];

export const paket = DAFTAR_PAKET;
