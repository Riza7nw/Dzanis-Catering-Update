/**
 * Tiga paket nasi kotak.
 *
 * Sumber: artboard "Homepage Mobile Organic.dc.html" (kartu paket, lengkap
 * dengan daftar lauk pendamping) dan "Homepage Web.dc.html" (baris harga).
 * Dicocokkan dengan poster dzanis-paket-20k.png / -23k.png.
 *
 * Foto tiap paket dipotong dari lembar poster memakai rasio crop yang sama
 * persis dengan artboard — lihat public/images/menu/.
 */

export type Paket = {
  id: string;
  nama: string;
  harga: number;
  /** Ringkasan satu baris, dipakai di baris harga versi web. */
  ringkas: string;
  /** Yang sudah termasuk dalam harga — tampil sebagai tag centang. */
  sudahTermasuk: string[];
  /** Pilihan lauk utama; keterangan tampil lebih redup di sebelah nama. */
  lauk: { nama: string; ket: string }[];
  /** Daftar lauk pendamping yang bisa dibuka-tutup. */
  pendamping: string[];
  foto: string;
  fotoAlt: string;
  populer?: boolean;
};

const PENDAMPING_8 = [
  "Tumis labu",
  "Mie goreng",
  "Bihun goreng",
  "Soun",
  "Capcay",
  "Tempe kering",
  "Tempe basah",
  "Acar kuning",
];

const PENDAMPING_14 = [
  ...PENDAMPING_8,
  "Tumis buncis baso",
  "Sambal goreng cabe",
  "Sambal goreng kentang",
  "Bakwan jagung",
  "Tahu isi",
  "Sayur asem",
];

export const paket: Paket[] = [
  {
    id: "20k",
    nama: "Paket 20K",
    harga: 20000,
    ringkas: "Ayam goreng · olahan ayam · lele goreng",
    sudahTermasuk: ["Nasi"],
    lauk: [
      { nama: "Ayam Goreng", ket: "tahu & tempe, sambal, lalapan" },
      { nama: "Olahan Ayam", ket: "2 lauk pendamping" },
      { nama: "Ikan Lele Goreng", ket: "tahu & tempe, sambal, lalapan" },
    ],
    pendamping: PENDAMPING_8,
    foto: "/images/menu/paket-20k.jpg",
    fotoAlt: "Ayam goreng paket 20K",
  },
  {
    id: "23k",
    nama: "Paket 23K",
    harga: 23000,
    ringkas: "Nasi, buah & kerupuk · 4 pilihan lauk utama",
    sudahTermasuk: ["Nasi", "Buah", "Kerupuk"],
    lauk: [
      { nama: "Ayam Goreng", ket: "tahu & tempe, sambal, lalapan" },
      { nama: "Ikan Nila / Mas", ket: "tahu & tempe, sambal, lalapan" },
      { nama: "Olahan Ayam", ket: "2 lauk pendamping" },
      { nama: "Olahan Daging / Rolade", ket: "2 lauk pendamping" },
    ],
    pendamping: PENDAMPING_14,
    foto: "/images/menu/paket-23k.jpg",
    fotoAlt: "Nasi kotak paket 23K",
    populer: true,
  },
  {
    id: "25k",
    nama: "Paket 25K",
    harga: 25000,
    ringkas: "Ayam kampung · rolade, bistik, rendang · 3 lauk",
    sudahTermasuk: ["Nasi", "Buah", "Kerupuk"],
    lauk: [
      {
        nama: "Ayam Goreng",
        ket: "pilihan kampung / negeri, tahu & tempe, sambal, lalapan",
      },
      { nama: "Ikan Mas / Nila", ket: "tahu & tempe, sambal, lalapan" },
      {
        nama: "Olahan Ayam / Daging",
        ket: "rolade, bistik, rendang, 3 lauk pendamping",
      },
    ],
    pendamping: PENDAMPING_14,
    foto: "/images/menu/paket-25k.jpg",
    fotoAlt: "Ikan nila paket 25K",
  },
];
