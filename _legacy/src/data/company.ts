/**
 * Identitas & kontak Dzanis Catering.
 *
 * PENTING — data ini diganti total pada redesign "Organic".
 * Versi sebelumnya berisi profil Puncak/Bogor/Jabodetabek dengan nomor
 * 081286803447. Baik artboard Claude Design maupun poster harga resmi
 * (dzanis-paket-*.png, dzanis-snackbox-*.png) sama-sama menyebut
 * Majalengka dan 081 324 383858, jadi profil lama diperlakukan sebagai
 * data usang dan tidak dibawa ke sini.
 *
 * Field yang dulu ada tapi tidak bisa diverifikasi dari sumber mana pun
 * (badan hukum, nomor sertifikat halal, email, rating agregat) sengaja
 * dihapus, bukan ditebak — lihat catatan di StructuredData.tsx.
 */

const WA_NUMBER = "6281324383858";

export function waLink(pesan?: string) {
  const base = `https://wa.me/${WA_NUMBER}`;
  return pesan ? `${base}?text=${encodeURIComponent(pesan)}` : base;
}

export const company = {
  name: "Dzanis Catering",
  brandName: "Dzanis Catering",
  logo: "/images/brand/dzanis-logo.png",
  logoLight: "/images/brand/dzanis-logo-light.png",
  /** Logo bulat untuk navbar & footer, dipotong dari logo.jpeg. */
  mark: "/images/brand/dzanis-mark.png",
  tagline: "Katering rumahan Majalengka",
  description:
    "Katering rumahan dari Majalengka. Nasi kotak mulai Rp20.000 per box, snack box 51 pilihan, dan prasmanan untuk resepsi, syukuran, serta acara kantor. Mengantar ke Cirebon, Indramayu, Majalengka, dan Kuningan.",

  contact: {
    whatsapp: "081324383858",
    whatsappDisplay: "081 324 383858",
    whatsappLink: waLink(
      "Halo Dzanis Catering, saya mau tanya-tanya soal pesanan catering.",
    ),
    phoneHref: "tel:081324383858",
    /** Lokasi dapur, bukan batas pengantaran — lihat ketentuan.areaAntar. */
    address: "Majalengka, Jawa Barat",
    operatingHours: "Menerima pesanan setiap hari, pengantaran mulai pukul 06.00.",
  },

  /** Ketentuan pesanan — dipakai di tag hero, FAQ, dan builder snack box. */
  ketentuan: {
    minBox: 20,
    dpPersen: 50,
    tenggat: "H-3",
    tenggatBesar: "H-7 untuk pesanan di atas 200 box",
    /**
     * Dapur ada di Majalengka, tapi pengantaran mencakup seluruh
     * Ciayumajakuning. Keduanya jangan dicampur: alamat di contact.address
     * adalah tempat masak, ini cakupan antar.
     */
    areaAntar: "Cirebon, Indramayu, Majalengka, dan Kuningan",
    areaAntarRingkas: "Ciayumajakuning",
  },

  /**
   * Strip angka di homepage versi mobile. Nilai tahun & acara berasal dari
   * default prop artboard (`angkaTahun`, `angkaAcara`) dan memang dibuat
   * mudah diubah — konfirmasi ke pemilik sebelum dipublikasikan.
   */
  stats: {
    tahun: "8",
    tahunLabel: "tahun melayani acara di Ciayumajakuning",
    acara: "400+",
    acaraLabel: "acara sudah kami masak dan antar",
    pilihan: "51",
    pilihanLabel: "pilihan menu nasi kotak & jajanan",
  },

  /** Dipakai StructuredData sebagai areaServed. Urut sesuai singkatan
      Ciayumajakuning: Cirebon, Indramayu, Majalengka, Kuningan. */
  serviceAreas: [
    { name: "Cirebon" },
    { name: "Indramayu" },
    { name: "Majalengka" },
    { name: "Kuningan" },
  ],
};
