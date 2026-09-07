/**
 * Data Layer: Menu Items & Packages
 * Berisi definisi tipe eksplisit untuk seluruh item menu dan paket catering.
 */

export interface MenuItem {
  id: string;
  title: string;
  price: number;
  description: string;
  badges: string[];
  imageUrl: string;
  imageAlt: string;
  isPopular?: boolean;
}

export interface SnackTeaserPhoto {
  src: string;
  alt: string;
}

export const snackTeaserPhotos: SnackTeaserPhoto[] = [
  { src: "/images/menu/snack-kue-sus.jpg", alt: "Kue sus" },
  { src: "/images/menu/snack-bolu.jpg", alt: "Bolu" },
  { src: "/images/menu/snack-putu-ayu.jpg", alt: "Putu ayu" },
  { src: "/images/menu/snack-jajan-pasar.jpg", alt: "Jajan pasar" },
  { src: "/images/menu/snack-puding.jpg", alt: "Puding" },
  { src: "/images/menu/snack-puding-buah.jpg", alt: "Puding buah" },
];

export const paketMenu: MenuItem[] = [
  {
    id: "paket-20k",
    title: "Paket 20K",
    price: 20000,
    description: "Ayam goreng, olahan ayam, atau lele goreng dengan tahu, tempe, lalap, dan sambal.",
    badges: ["Nasi", "Mulai 20 Box"],
    imageUrl: "/images/menu/paket-20k.jpg",
    imageAlt: "Ayam goreng paket 20K",
  },
  {
    id: "paket-23k",
    title: "Paket 23K",
    price: 23000,
    description: "Nasi, buah, kerupuk dengan 4 pilihan lauk utama (ayam, nila/mas, olahan daging).",
    badges: ["Nasi", "Buah", "Kerupuk", "Favorit"],
    imageUrl: "/images/menu/paket-23k.jpg",
    imageAlt: "Nasi kotak paket 23K",
    isPopular: true,
  },
  {
    id: "paket-25k",
    title: "Paket 25K",
    price: 25000,
    description: "Ayam kampung / negeri, bistik, rolade, rendang lengkap dengan 3 lauk pendamping.",
    badges: ["Nasi", "Buah", "Kerupuk", "Komplit"],
    imageUrl: "/images/menu/paket-25k.jpg",
    imageAlt: "Ikan nila paket 25K",
  },
];
