import type { Metadata } from "next";
import { Bricolage_Grotesque, Instrument_Sans } from "next/font/google";
import "./globals.css";
import { StructuredData } from "@/components/seo/StructuredData";
import { company } from "@/data/company";

const SITE_URL = "https://dzaniskatering.com";

// Judul: grotesque variabel dengan karakter sedikit organik — kuat saat
// uppercase besar (82px di hero web) tapi masih terbaca di 15px pada
// judul kolom footer. Punya axes, jadi `weight` tidak boleh ditulis eksplisit.
const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  display: "swap",
});

// Isi: grotesque ramping yang muat kalimat Indonesia panjang, dan punya
// italic sungguhan — dipakai untuk kata beraksen "cerita" / "isi sendiri".
const instrument = Instrument_Sans({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: `${company.name} | Nasi Kotak & Snack Box Ciayumajakuning`,
  description: company.description,
  keywords: [
    // Dapur di Majalengka, antar ke seluruh Ciayumajakuning — keempat
    // kabupaten/kota disebut supaya pencarian lokal di luar Majalengka
    // juga menemukan situs ini.
    "catering ciayumajakuning",
    "catering majalengka",
    "catering cirebon",
    "catering indramayu",
    "catering kuningan",
    "nasi kotak majalengka",
    "snack box majalengka",
    "nasi box murah",
    "katering rumahan",
    "prasmanan majalengka",
    "dzanis catering",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    title: `${company.name} | Nasi Kotak & Snack Box Ciayumajakuning`,
    description: company.description,
    url: SITE_URL,
    siteName: company.name,
    locale: "id_ID",
    type: "website",
    images: [
      {
        url: "/images/menu/hero-nasi-kotak.jpg",
        width: 610,
        height: 458,
        alt: "Nasi kotak Dzanis Catering",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${company.name} | Nasi Kotak & Snack Box Ciayumajakuning`,
    description: company.description,
    images: ["/images/menu/hero-nasi-kotak.jpg"],
  },
  icons: {
    icon: "/favicon.png",
    apple: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // suppressHydrationWarning: skrip di <head> menulis data-js pada <html>
    // sebelum React menghidrasi, sehingga atribut klien berbeda dari hasil
    // server. Ini disengaja, dan hanya berlaku satu tingkat pada <html>.
    <html
      lang="id"
      suppressHydrationWarning
      className={`${bricolage.variable} ${instrument.variable} scroll-smooth`}
    >
      <head>
        {/*
          Menandai dokumen sebelum paint pertama. Seluruh aturan yang
          menyembunyikan elemen untuk animasi masuk diberi awalan [data-js],
          jadi tanpa JavaScript atribut ini tidak pernah ada dan konten
          tampil apa adanya — bukan tersangkut transparan. Dijalankan
          inline supaya tidak ada kedipan tampil → hilang → muncul lagi.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              `document.documentElement.dataset.js="1";` +
              // Penjaga waktu: bila setelah 4 detik tidak ada satu pun Reveal
              // yang terhidrasi (bundle gagal dimuat, parse error, jaringan
              // putus), cabut penandanya supaya aturan penyembunyi mati dan
              // konten tetap terbaca. Tanpa ini, isi di bawah hero bisa
              // hilang permanen pada halaman yang JS-nya gagal — bukan hanya
              // pada JS yang sengaja dimatikan.
              `setTimeout(function(){var d=document.documentElement;` +
              `if(!d.dataset.hidrasi){delete d.dataset.js}},4000)`,
          }}
        />
      </head>
      <body className="min-h-screen bg-bg text-text antialiased">
        <a
          href="#konten"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[400] focus:rounded-full focus:bg-accent focus:px-5 focus:py-3 focus:text-sm focus:font-semibold focus:text-bg"
        >
          Lompat ke konten utama
        </a>
        {children}
        <StructuredData />
      </body>
    </html>
  );
}
