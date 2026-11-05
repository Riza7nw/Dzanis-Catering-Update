/**
 * Data Layer: Langkah Cara Pesan Dzanis Catering
 */

export type Langkah = {
  judul: string;
  judulRingkas: string;
  deskripsi: string;
};

export const langkah: Langkah[] = [
  {
    judul: "Pilih paket",
    judulRingkas: "Pilih paket",
    deskripsi:
      "Tentukan paket nasi kotak atau rakit snack box sesuai anggaran.",
  },
  {
    judul: "Kirim detail via WhatsApp",
    judulRingkas: "Kirim detail",
    deskripsi:
      "Jumlah box, tanggal acara, jam antar, dan alamat lengkap via WhatsApp.",
  },
  {
    judul: "Konfirmasi & DP 25%",
    judulRingkas: "Konfirmasi & DP",
    deskripsi:
      "Kami kirim rincian harga, pesanan terkunci setelah DP 25% masuk.",
  },
  {
    judul: "Diantar hari acara",
    judulRingkas: "Diantar",
    deskripsi:
      "Diantar sesuai jam yang disepakati, pelunasan saat pesanan sampai di tempat pengantaran.",
  },
];
