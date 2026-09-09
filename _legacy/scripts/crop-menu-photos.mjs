/**
 * Membuat ulang public/images/menu/*.jpg dari lembar poster harga Dzanis.
 *
 *   node scripts/crop-menu-photos.mjs
 *
 * Artboard Claude Design tidak memakai foto lepas: ia memasang lembar poster
 * (1080x1350) ke dalam bingkai kecil lalu menggesernya dengan persentase,
 * misalnya `left:-126.23%; top:-207.86%; width:354.1%; height:589.52%`.
 * Artinya jendela yang terlihat, dalam pecahan ukuran asli, adalah:
 *
 *     x = -left / w        lebar  = 100 / w
 *     y = -top  / h        tinggi = 100 / h
 *
 * Angka di bawah disalin apa adanya dari artboard, jadi hasil potongannya
 * identik dengan yang dilihat perancang.
 *
 * CATATAN RESOLUSI: tiap foto di dalam poster hanya berukuran ~305x229 px.
 * Itu batas detail yang benar-benar ada. Versi awal skrip ini memperbesar 2x
 * sebelum menyimpan — hasilnya file lebih besar tanpa tambahan detail, dan
 * next/image jadi mengira sumbernya lebih tajam daripada kenyataannya.
 * Sekarang disimpan pada resolusi asli saja. Untuk hero yang tajam di layar
 * retina, foto asli dari pemilik tetap dibutuhkan.
 */

import sharp from "sharp";
import { mkdir } from "node:fs/promises";

const SRC = "C:/Users/Legion/OneDrive/Pictures/dzaniz catering/";
const OUT = "public/images/menu/";

/** Potongan persentase, disalin langsung dari inline style artboard. */
const CROPS = [
  { out: "hero-nasi-kotak", src: "dzanis-paket-20k.png", left: -126.23, top: -207.86, w: 354.1, h: 589.52 },
  { out: "paket-20k", src: "dzanis-paket-20k.png", left: -18.03, top: -207.86, w: 354.1, h: 589.52 },
  { out: "paket-23k", src: "dzanis-paket-23k.png", left: -347.16, top: -293.02, w: 471.62, h: 784.88 },
  { out: "paket-25k", src: "dzanis-paket-23k.png", left: -132.46, top: -294.74, w: 473.68, h: 789.47 },
  { out: "snack-bolu", src: "dzanis-snackbox-1.png", left: -95.54, top: -178.98, w: 687.9, h: 859.87 },
  { out: "snack-putu-ayu", src: "dzanis-snackbox-1.png", left: -407.64, top: -178.98, w: 687.9, h: 859.87 },
  { out: "snack-jajan-pasar", src: "dzanis-snackbox-2.png", left: -108.28, top: -178.98, w: 687.9, h: 859.87 },
  { out: "snack-puding", src: "dzanis-snackbox-2.png", left: -382.17, top: -178.98, w: 687.9, h: 859.87 },
];

/**
 * Dua foto bulat di poster dikelilingi cincin biru tebal. Artboard ikut
 * memotongnya, tapi biru itu bentrok dengan palet organic — jadi dipotong
 * 8,5% lebih rapat di tiap sisi.
 */
const ROUND = [
  { out: "snack-kue-sus", src: "dzanis-snackbox-1.png", left: 830, top: 67, size: 190 },
  { out: "snack-puding-buah", src: "dzanis-snackbox-2.png", left: 843, top: 67, size: 190 },
];

await mkdir(OUT, { recursive: true });

for (const c of CROPS) {
  const { width: W, height: H } = await sharp(SRC + c.src).metadata();
  const left = Math.round((-c.left / c.w) * W);
  const top = Math.round((-c.top / c.h) * H);
  const width = Math.round((100 / c.w) * W);
  const height = Math.round((100 / c.h) * H);
  await sharp(SRC + c.src)
    .extract({ left, top, width, height })
    .sharpen({ sigma: 0.6 })
    .jpeg({ quality: 92, mozjpeg: true })
    .toFile(OUT + c.out + ".jpg");
  console.log(`${c.out.padEnd(20)} ${width}x${height}`);
}

for (const c of ROUND) {
  const inset = Math.round(c.size * 0.085);
  const size = c.size - inset * 2;
  await sharp(SRC + c.src)
    .extract({ left: c.left + inset, top: c.top + inset, width: size, height: size })
    .sharpen({ sigma: 0.6 })
    .jpeg({ quality: 92, mozjpeg: true })
    .toFile(OUT + c.out + ".jpg");
  console.log(`${c.out.padEnd(20)} ${size}x${size}`);
}
