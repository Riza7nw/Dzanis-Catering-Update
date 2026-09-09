import type { Metadata } from "next";
import { RakitSnackBox } from "@/components/organic/RakitSnackBox";
import { snackRingkasan } from "@/data/snack";

export const metadata: Metadata = {
  title: "Rakit Snack Box | Dzanis Catering Ciayumajakuning",
  description: `Susun sendiri isi snack box dari ${snackRingkasan.totalPilihan} pilihan jajanan mulai Rp${snackRingkasan.hargaTermurah}. Harga box langsung terhitung, pesanan dikirim lewat WhatsApp.`,
  alternates: { canonical: "/rakit-snack-box" },
};

export default function RakitSnackBoxPage() {
  return <RakitSnackBox />;
}
