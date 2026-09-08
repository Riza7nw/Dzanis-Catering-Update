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
    title: "Paket Hemat 20K",
    price: 20000,
    description:
      "Ayam goreng lengkuas/serundeng, oseng tempe kacang, sambal terasi, dan kerupuk.",
    badges: ["Nasi", "Mulai 20 Box"],
    imageUrl: "/images/menu/paket-20k.jpg",
    imageAlt: "Paket Hemat 20K Dzanis Catering",
  },
  {
    id: "paket-23k",
    title: "Paket 23K",
    price: 23000,
    description:
      "Ayam bakar madu, telur balado 1/2, bakmi goreng gurih, sambal, dan pisang.",
    badges: ["Nasi", "Pisang", "Kerupuk", "Favorit"],
    imageUrl: "/images/menu/paket-23k.jpg",
    imageAlt: "Paket Favorit 23K Dzanis Catering",
    isPopular: true,
  },
  {
    id: "paket-25k",
    title: "Paket Spesial 25K",
    price: 25000,
    description:
      "Ayam rica-rica / rolade daging, sambal goreng ati kentang, capcay bakso, dan kerupuk udang.",
    badges: ["Nasi", "Buah", "Kerupuk Udang", "Spesial"],
    imageUrl: "/images/menu/paket-25k.jpg",
    imageAlt: "Paket Spesial 25K Dzanis Catering",
  },
];
