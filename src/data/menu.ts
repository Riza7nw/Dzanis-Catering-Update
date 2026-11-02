/**
 * Data Layer: Snack Teaser Photos
 * Digunakan untuk pratinjau galeri foto Snack Box di halaman utama.
 */

export interface SnackTeaserPhoto {
  src: string;
  alt: string;
}

export const snackTeaserPhotos: SnackTeaserPhoto[] = [
  { src: "/images/menu/snack-kue-sus.webp", alt: "Kue sus vanila lembut Dzanis Catering" },
  { src: "/images/menu/snack-bolu.webp", alt: "Bolu kukus gulung mini Dzanis Catering" },
  { src: "/images/menu/snack-putu-ayu.webp", alt: "Kue putu ayu pandan kelapa Dzanis Catering" },
  { src: "/images/menu/snack-jajan-pasar.webp", alt: "Aneka jajan pasar tradisional Dzanis Catering" },
  { src: "/images/menu/snack-puding.webp", alt: "Puding manis segar Dzanis Catering" },
  { src: "/images/menu/snack-puding-buah.webp", alt: "Puding buah potong higienis Dzanis Catering" },
];
