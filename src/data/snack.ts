/**
 * Katalog snack box — 51 pilihan dalam 6 kategori.
 * Harga dalam rupiah, per biji — bukan per box.
 */

export type SnackItem = {
  nama: string;
  harga: number;
};

export type SnackKategori = {
  label: string;
  items: SnackItem[];
};

export const snackKategori: SnackKategori[] = [
  {
    label: "Puff & Pastry",
    items: [
      { nama: "Kue Sus Vanilla", harga: 3000 },
      { nama: "Kue Sus Coklat", harga: 3000 },
      { nama: "Kue Sus Buah", harga: 3500 },
      { nama: "Pie Susu", harga: 3000 },
      { nama: "Pie Buah", harga: 3500 },
      { nama: "Bolen Pisang", harga: 4000 },
      { nama: "Roti Unyil", harga: 4000 },
      { nama: "Roti Goreng", harga: 4000 },
    ],
  },
  {
    label: "Aneka Cake",
    items: [
      { nama: "Putu Ayu", harga: 3000 },
      { nama: "Putu Ayu Gula Merah", harga: 3000 },
      { nama: "Bolu Jadul / Pandan", harga: 3500 },
      { nama: "Bolu Kukus Gula Merah", harga: 3000 },
      { nama: "Bolu Pisang", harga: 3500 },
      { nama: "Sarang Semut", harga: 3500 },
    ],
  },
  {
    label: "Kue Basah",
    items: [
      { nama: "Brownies", harga: 3500 },
      { nama: "Bolu Gulung", harga: 3500 },
      { nama: "Rainbow Keju", harga: 4000 },
      { nama: "Lapis Surabaya", harga: 4000 },
      { nama: "Banana Muffin", harga: 3500 },
      { nama: "Nona Manis", harga: 3000 },
      { nama: "Kue Lapis", harga: 3000 },
      { nama: "Talam", harga: 3000 },
      { nama: "Kue Lumpur", harga: 3000 },
      { nama: "Hunkwe Pisang", harga: 3000 },
      { nama: "Cantik Manis", harga: 3000 },
      { nama: "Dadar Gulung", harga: 3000 },
      { nama: "Kue Angku / Cikak", harga: 3000 },
      { nama: "Lumpur Surga", harga: 3000 },
      { nama: "Putri Mandi", harga: 3000 },
      { nama: "Sengkulun / Awug", harga: 3000 },
    ],
  },
  {
    label: "Aneka Puding",
    items: [
      { nama: "Puding Gula Merah", harga: 2500 },
      { nama: "Jelly", harga: 2500 },
      { nama: "Puding Lumut", harga: 3000 },
      { nama: "Puding Kelapa Muda", harga: 3000 },
      { nama: "Puding Rainbow", harga: 3000 },
      { nama: "Puding Coklat Vla", harga: 4000 },
      { nama: "Puding Cappuccino", harga: 3500 },
      { nama: "Puding Buah", harga: 4000 },
    ],
  },
  {
    label: "Menu Asin",
    items: [
      { nama: "Buras", harga: 3000 },
      { nama: "Gandos / Lobak", harga: 3000 },
      { nama: "Lemper", harga: 3500 },
      { nama: "Risoles Sayur", harga: 3500 },
      { nama: "Risoles Mayo", harga: 4000 },
      { nama: "Pastel", harga: 3500 },
      { nama: "Martabak", harga: 3500 },
      { nama: "Semar Mendem", harga: 3500 },
    ],
  },
  {
    label: "Pelengkap",
    items: [
      { nama: "Kemasan", harga: 1000 },
      { nama: "Air Mineral Cup", harga: 1000 },
      { nama: "Kacang Atom dsb", harga: 1500 },
      { nama: "Jeruk", harga: 2500 },
      { nama: "Pisang", harga: 1500 },
    ],
  },
];

export const snackRingkasan = {
  totalPilihan: snackKategori.reduce((n, k) => n + k.items.length, 0),
  totalKategori: snackKategori.length,
  hargaTermurah: Math.min(
    ...snackKategori.flatMap((k) => k.items.map((i) => i.harga)),
  ),
};

export const MIN_BOX = 20;
export const STEP_BOX = 5;

export function formatRupiah(n: number) {
  return "Rp" + n.toLocaleString("id-ID");
}

export type SnackSlotItem = {
  name: string;
  type?: string;
};

export type SnackSlot = {
  name: string;
  default_item: string;
  options: string;
  items?: SnackSlotItem[];
};

export type SnackTemplatePackage = {
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
};

export const defaultSnackTemplates: SnackTemplatePackage[] = [
  {
    id: "pkg-snack-premium",
    slug: "paket-snack-box-premium",
    name: "Paket Snack Box Premium",
    category: "Snack Box",
    price_per_pax: 18000,
    min_pax: 25,
    badge: "Paling Populer",
    description: "Snack box coffee break meeting kantor, seminar, dan acara formal.",
    image: "/images/menu/snack-puding-buah.webp",
    foto: "/images/menu/snack-puding-buah.webp",
    items: [
      "Pastel Tutup Ayam",
      "Kue Soes Vla Vanilla",
      "Lemper Ayam",
      "Air Mineral Cup"
    ],
    custom_slots: [
      {
        name: "Kue Asin / Savory",
        default_item: "Pastel Tutup Ayam",
        options: "Pastel Tutup Ayam, Lemper Ayam, Risoles Mayo, Semar Mendem"
      },
      {
        name: "Puff & Pastry / Choux",
        default_item: "Kue Soes Vla Vanilla",
        options: "Kue Soes Vla Vanilla, Pie Buah, Bolen Pisang, Pie Susu"
      },
      {
        name: "Kue Tradisional / Basah",
        default_item: "Lemper Ayam",
        options: "Lemper Ayam, Brownies, Bolu Gulung, Lapis Surabaya"
      },
      {
        name: "Minuman / Pelengkap",
        default_item: "Air Mineral Cup",
        options: "Air Mineral Cup, Teh Kotak, Jeruk Segar"
      }
    ]
  },
  {
    id: "pkg-snack-jajan-pasar",
    slug: "paket-snack-jajan-pasar",
    name: "Paket Snack Box Jajan Pasar Tradisional",
    category: "Snack Box",
    price_per_pax: 15000,
    min_pax: 25,
    badge: "Kue Tradisional",
    description: "Kombinasi aneka jajan pasar tradisional manis dan gurih pilihan favorit nusantara.",
    image: "/images/menu/snack-jajan-pasar.webp",
    foto: "/images/menu/snack-jajan-pasar.webp",
    items: [
      "Lemper Ayam / Abon",
      "Kue Lobak",
      "Putu Ayu",
      "Kue Lapis",
      "Kue Lapis Gula Merah",
      "Naga Sari",
      "Ketan Gurih",
      "Geblog / Getuk Singkong",
      "Risol Ayam / Sayur",
      "Buras Sayur / Oncom",
      "Bolu Kukus",
      "Air Mineral Cup 220ml"
    ],
    custom_slots: [
      {
        name: "Jajan Pasar",
        default_item: "Lemper Ayam / Abon",
        options: "Lemper Ayam / Abon"
      },
      {
        name: "Jajan Pasar",
        default_item: "Kue Lobak",
        options: "Kue Lobak"
      },
      {
        name: "Jajan Pasar",
        default_item: "Putu Ayu",
        options: "Putu Ayu"
      },
      {
        name: "Jajan Pasar",
        default_item: "Kue Lapis",
        options: "Kue Lapis"
      },
      {
        name: "Jajan Pasar",
        default_item: "Kue Lapis Gula Merah",
        options: "Kue Lapis Gula Merah"
      },
      {
        name: "Jajan Pasar",
        default_item: "Naga Sari",
        options: "Naga Sari"
      },
      {
        name: "Jajan Pasar",
        default_item: "Ketan Gurih",
        options: "Ketan Gurih"
      },
      {
        name: "Jajan Pasar",
        default_item: "Geblog / Getuk Singkong",
        options: "Geblog / Getuk Singkong"
      },
      {
        name: "Jajan Pasar",
        default_item: "Risol Ayam / Sayur",
        options: "Risol Ayam / Sayur"
      },
      {
        name: "Jajan Pasar",
        default_item: "Buras Sayur / Oncom",
        options: "Buras Sayur / Oncom"
      },
      {
        name: "Jajan Pasar",
        default_item: "Bolu Kukus",
        options: "Bolu Kukus"
      },
      {
        name: "Pelengkap",
        default_item: "Air Mineral Cup 220ml",
        options: "Air Mineral Cup 220ml"
      }
    ]
  },
  {
    id: "pkg-snack-kue-sus-pastry",
    slug: "paket-snack-kue-sus-pastry",
    name: "Paket Snack Box Kue Sus & Pastry",
    category: "Snack Box",
    price_per_pax: 17000,
    min_pax: 25,
    badge: "Pastry Modern",
    description: "Snack box modern kombinasi choux pastry vla lembut, bolu gulung, dan savory snack.",
    image: "/images/menu/snack-kue-sus.webp",
    foto: "/images/menu/snack-kue-sus.webp",
    items: [
      "Kue Soes Vla Vanilla Cream Lembut",
      "Bolu Gulung Pandan Keju",
      "Risoles Ragout Ayam Wortel Renyah",
      "Kacang Mete / Keripik Gurih",
      "Air Mineral Cup 220ml"
    ],
    custom_slots: [
      {
        name: "Pastry / Choux",
        default_item: "Kue Soes Vla Vanilla Cream Lembut",
        options: "Kue Soes Vla Vanilla Cream Lembut, Pie Buah, Bolen Pisang"
      },
      {
        name: "Cake / Bolu",
        default_item: "Bolu Gulung Pandan Keju",
        options: "Bolu Gulung Pandan Keju, Rainbow Keju, Brownies"
      },
      {
        name: "Savory Snack",
        default_item: "Risoles Ragout Ayam Wortel Renyah",
        options: "Risoles Ragout Ayam Wortel Renyah, Pastel, Lemper"
      },
      {
        name: "Camilan Renyah",
        default_item: "Kacang Mete / Keripik Gurih",
        options: "Kacang Mete / Keripik Gurih, Kacang Atom dsb"
      },
      {
        name: "Minuman",
        default_item: "Air Mineral Cup 220ml",
        options: "Air Mineral Cup 220ml"
      }
    ]
  }
];
