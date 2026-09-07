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
