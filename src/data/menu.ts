/**
 * Data Layer: Snack Teaser Photos
 * Digunakan untuk pratinjau galeri foto Snack Box di halaman utama.
 */

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
