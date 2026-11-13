/**
 * Identitas & kontak Dzanis Catering.
 */

export const waPhoneNumber = "6281324383858";
const WA_NUMBER = waPhoneNumber;

/**
 * Nomor kontak WhatsApp sekunder khusus untuk konsultasi menu dan porsi custom,
 * terpisah dari nomor order utama.
 */
export const waConsultationNumber = "6281324383858";

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
    minBoxWeekend?: number;
    maxBox?: number;
    dpPersen: number;
    tenggat: string;
    tenggatBesar: string;
    areaAntar: string;
    areaAntarRingkas: string;
    pelunasan?: string;
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
  tagline: "Jasa Catering & Katering Ciayumajakuning",
  description:
    "Jasa catering & katering Majalengka dan Ciayumajakuning. Sedia prasmanan acara kantor, nasi kotak, snack box, hingga tumpeng. Pesan menu lezat sekarang!",

  /**
   * Nomor kontak WhatsApp sekunder khusus untuk konsultasi menu dan porsi custom,
   * terpisah dari nomor order utama.
   */
  waConsultationNumber,

  contact: {
    whatsapp: "081324383858",
    whatsappDisplay: "0813-2438-3858",
    whatsappLink: waLink(
      "Halo Dzanis Catering, saya mau tanya paket yang ada di Dzanis Catering.",
    ),
    phoneHref: waLink("Halo Dzanis Catering, saya ingin bertanya mengenai layanan katering."),
    address: "Majalengka, Jawa Barat",
    operatingHours: "Menerima pesanan setiap hari, pengantaran mulai pukul 06.00.",
  },

  ketentuan: {
    minBox: 20,
    minBoxWeekend: 40,
    maxBox: 500,
    dpPersen: 25,
    tenggat: "H-3",
    tenggatBesar: "H-7 untuk pesanan di atas 200 box",
    areaAntar: "Cirebon, Indramayu, Majalengka, dan Kuningan",
    areaAntarRingkas: "Ciayumajakuning",
    pelunasan: "Pelunasan sisa tagihan dilakukan saat pesanan sampai di tempat pengantaran.",
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
