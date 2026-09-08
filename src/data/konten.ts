/**
 * Isi seksi "Layanan lain" dan "Cara pesan".
 */

export type Layanan = {
  judul: string;
  deskripsi: string;
  foto: string;
  fotoAlt: string;
};

export const layanan: Layanan[] = [
  {
    judul: "Catering acara & pernikahan",
    deskripsi:
      "Paket lengkap untuk resepsi, syukuran, dan acara keluarga besar.",
    foto: "/images/menu/paket-23k.jpg",
    fotoAlt: "Hidangan Dzanis Catering untuk resepsi",
  },
  {
    judul: "Booth / food cart",
    deskripsi: "Gerai makanan untuk bazar, ulang tahun, dan acara kantor.",
    foto: "/images/menu/snack-jajan-pasar.jpg",
    fotoAlt: "Aneka jajanan Dzanis Catering untuk booth",
  },
  {
    judul: "Prasmanan kantor",
    deskripsi: "Menu prasmanan untuk rapat, pelatihan, dan syukuran kantor.",
    foto: "/images/menu/paket-20k.jpg",
    fotoAlt: "Nasi kotak Dzanis Catering untuk acara kantor",
  },
];

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
    judul: "Konfirmasi & DP 50%",
    judulRingkas: "Konfirmasi & DP",
    deskripsi:
      "Kami kirim rincian harga, pesanan terkunci setelah DP 50% masuk.",
  },
  {
    judul: "Diantar hari acara",
    judulRingkas: "Diantar",
    deskripsi:
      "Diantar sesuai jam yang disepakati, pelunasan saat serah terima.",
  },
];
