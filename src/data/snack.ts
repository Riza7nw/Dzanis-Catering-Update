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
      { nama: "Putu Ayu", harga: 2000 },
      { nama: "Putu Ayu Gula Merah", harga: 2500 },
      { nama: "Bolu Jadul / Pandan", harga: 3000 },
      { nama: "Bolu Kukus Gula Merah", harga: 2500 },
      { nama: "Bolu Pisang", harga: 3000 },
      { nama: "Sarang Semut", harga: 3000 },
    ],
  },
  {
    label: "Kue Basah",
    items: [
      { nama: "Brownies", harga: 3000 },
      { nama: "Bolu Gulung", harga: 3000 },
      { nama: "Rainbow Keju", harga: 3500 },
      { nama: "Lapis Surabaya", harga: 3500 },
      { nama: "Banana Muffin", harga: 3000 },
      { nama: "Nona Manis", harga: 2000 },
      { nama: "Kue Lapis", harga: 2000 },
      { nama: "Talam", harga: 2000 },
      { nama: "Kue Lumpur", harga: 2000 },
      { nama: "Hunkwe Pisang", harga: 2000 },
      { nama: "Cantik Manis", harga: 2000 },
      { nama: "Dadar Gulung", harga: 3000 },
      { nama: "Kue Angku / Cikak", harga: 2500 },
      { nama: "Lumpur Surga", harga: 3000 },
      { nama: "Putri Mandi", harga: 2500 },
      { nama: "Sengkulun / Awug", harga: 2500 },
    ],
  },
  {
    label: "Aneka Puding",
    items: [
      { nama: "Puding Gula Merah", harga: 1500 },
      { nama: "Jelly", harga: 1500 },
      { nama: "Puding Lumut", harga: 2000 },
      { nama: "Puding Kelapa Muda", harga: 2000 },
      { nama: "Puding Rainbow", harga: 2000 },
      { nama: "Puding Coklat Vla", harga: 3000 },
      { nama: "Puding Cappuccino", harga: 2500 },
      { nama: "Puding Buah", harga: 3000 },
    ],
  },
  {
    label: "Menu Asin",
    items: [
      { nama: "Buras", harga: 2000 },
      { nama: "Gandos / Lobak", harga: 2000 },
      { nama: "Lemper", harga: 2500 },
      { nama: "Risoles Sayur", harga: 2500 },
      { nama: "Risoles Mayo", harga: 4000 },
      { nama: "Pastel", harga: 2500 },
      { nama: "Martabak", harga: 2500 },
      { nama: "Semar Mendem", harga: 3500 },
    ],
  },
  {
    label: "Pelengkap",
    items: [
      { nama: "Kemasan", harga: 1000 },
      { nama: "Air Mineral Cup", harga: 500 },
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

export type SnackSlot = {
  name: string;
  default_item: string;
  options: string;
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
      "Lemper Bakar Ayam",
      "Air Mineral Cup"
    ],
    custom_slots: [
      {
        name: "Kue Asin / Savory",
        default_item: "Pastel Tutup Ayam",
        options: "Pastel Tutup Ayam, Lemper Bakar Ayam, Risoles Mayo, Semar Mendem"
      },
      {
        name: "Puff & Pastry / Choux",
        default_item: "Kue Soes Vla Vanilla",
        options: "Kue Soes Vla Vanilla, Pie Buah, Bolen Pisang, Pie Susu"
      },
      {
        name: "Kue Tradisional / Basah",
        default_item: "Lemper Bakar Ayam",
        options: "Lemper Bakar Ayam, Brownies, Bolu Gulung, Lapis Surabaya"
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
    badge: "Kue Basah",
    description: "Kombinasi kue tradisional manis dan gurih istimewa berbalut daun pisang higienis.",
    image: "/images/menu/snack-jajan-pasar.webp",
    foto: "/images/menu/snack-jajan-pasar.webp",
    items: [
      "Lemper Ayam Bakar Gurih",
      "Kue Putu Ayu Kelapa Parut Manis",
      "Pastel Sayur Telur Gurih Krispi",
      "Kue Lapis Legit Tradisional",
      "Air Mineral Cup 220ml"
    ],
    custom_slots: [
      {
        name: "Kue Asin / Tradisional",
        default_item: "Lemper Ayam Bakar Gurih",
        options: "Lemper Ayam Bakar Gurih, Buras, Semar Mendem"
      },
      {
        name: "Kue Manis Kukus",
        default_item: "Kue Putu Ayu Kelapa Parut Manis",
        options: "Kue Putu Ayu Kelapa Parut Manis, Bolu Kukus Gula Merah, Nona Manis"
      },
      {
        name: "Gorengan / Pastel",
        default_item: "Pastel Sayur Telur Gurih Krispi",
        options: "Pastel Sayur Telur Gurih Krispi, Risoles Sayur, Martabak"
      },
      {
        name: "Kue Basah Lapis",
        default_item: "Kue Lapis Legit Tradisional",
        options: "Kue Lapis Legit Tradisional, Kue Talam, Cantik Manis"
      },
      {
        name: "Minuman",
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
