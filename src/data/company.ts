/**
 * Identitas & kontak Dzanis Catering.
 */

export const waPhoneNumber = "6281324383858";
const WA_NUMBER = waPhoneNumber;

/**
 * Nomor kontak WhatsApp sekunder khusus untuk konsultasi menu dan porsi custom,
 * terpisah dari nomor order utama.
 */
export const waConsultationNumber = "6285726331579";

export function waLink(pesan?: string) {
  const base = `https://wa.me/${WA_NUMBER}`;
  return pesan ? `${base}?text=${encodeURIComponent(pesan)}` : base;
}

export interface Company {
  name: string;
  brandName: string;
  logo: string;
  logoLight: string;
  mark: string;
  tagline: string;
  description: string;
  /** Nomor kontak khusus untuk konsultasi menu & porsi custom, terpisah dari order utama */
  waConsultationNumber: string;
  contact: {
    whatsapp: string;
    whatsappDisplay: string;
    whatsappLink: string;
    phoneHref: string;
    address: string;
    operatingHours: string;
  };
  ketentuan: {
    minBox: number;
    dpPersen: number;
    tenggat: string;
    tenggatBesar: string;
    areaAntar: string;
    areaAntarRingkas: string;
  };
  stats: {
    tahun: string;
    tahunLabel: string;
    acara: string;
    acaraLabel: string;
    pilihan: string;
    pilihanLabel: string;
  };
}

export const company: Company = {
  name: "Dzanis Catering",
  brandName: "Dzanis Catering",
  logo: "/images/brand/dzanis-logo.png",
  logoLight: "/images/brand/dzanis-logo-light.png",
  mark: "/images/brand/dzanis-mark.png",
  tagline: "Katering rumahan Majalengka",
  description:
    "Katering rumahan dari Majalengka. Nasi kotak mulai Rp20.000 per box, snack box 51 pilihan, dan prasmanan untuk resepsi, syukuran, serta acara kantor. Mengantar ke Cirebon, Indramayu, Majalengka, dan Kuningan.",

  /**
   * Nomor kontak WhatsApp sekunder khusus untuk konsultasi menu dan porsi custom,
   * terpisah dari nomor order utama.
   */
  waConsultationNumber,

  contact: {
    whatsapp: "081324383858",
    whatsappDisplay: "081 324 383858",
    whatsappLink: waLink(
      "Halo Dzanis Catering, saya mau tanya-tanya soal pesanan catering.",
    ),
    phoneHref: "tel:081324383858",
    address: "Majalengka, Jawa Barat",
    operatingHours: "Menerima pesanan setiap hari, pengantaran mulai pukul 06.00.",
  },

  ketentuan: {
    minBox: 20,
    dpPersen: 50,
    tenggat: "H-3",
    tenggatBesar: "H-7 untuk pesanan di atas 200 box",
    areaAntar: "Cirebon, Indramayu, Majalengka, dan Kuningan",
    areaAntarRingkas: "Ciayumajakuning",
  },

  stats: {
    tahun: "8",
    tahunLabel: "tahun melayani acara di Ciayumajakuning",
    acara: "400+",
    acaraLabel: "acara sudah kami masak dan antar",
    pilihan: "51",
    pilihanLabel: "pilihan menu nasi kotak & jajanan",
  },
};
