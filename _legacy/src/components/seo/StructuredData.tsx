import { company } from "@/data/company";
import { faqs } from "@/data/faq";
import { paket } from "@/data/paket";
import { snackRingkasan } from "@/data/snack";

const SITE_URL = "https://dzaniskatering.com";

/**
 * JSON-LD untuk hasil pencarian Google: profil bisnis lokal, katalog paket,
 * dan FAQ.
 *
 * CATATAN: versi sebelumnya menerbitkan `aggregateRating` 4.9 dari 200 ulasan
 * yang di-hardcode di komponen ini — angka itu tidak berasal dari sumber ulasan
 * mana pun. Menerbitkan rating karangan melanggar kebijakan structured data
 * Google dan bisa membuat rich result dicabut, jadi blok itu dihapus.
 * Pasang kembali hanya bila datanya benar-benar ditarik dari Google Business
 * Profile. Nomor sertifikat halal, badan hukum, dan email juga dihapus karena
 * tidak bisa diverifikasi dari artboard maupun poster resmi.
 */
export function StructuredData() {
  const bisnis = {
    "@context": "https://schema.org",
    "@type": "FoodEstablishment",
    "@id": `${SITE_URL}/#bisnis`,
    name: company.name,
    description: company.description,
    url: SITE_URL,
    logo: `${SITE_URL}${company.logo}`,
    image: `${SITE_URL}/images/menu/hero-nasi-kotak.jpg`,
    telephone: company.contact.whatsapp,
    servesCuisine: ["Indonesian", "Sundanese"],
    priceRange: "Rp500 - Rp25.000",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Majalengka",
      addressRegion: "Jawa Barat",
      addressCountry: "ID",
    },
    areaServed: company.serviceAreas.map((area) => ({
      "@type": "Place",
      name: area.name,
    })),
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Paket Catering",
      itemListElement: [
        ...paket.map((p) => ({
          "@type": "Offer",
          name: p.nama,
          description: p.ringkas,
          price: String(p.harga),
          priceCurrency: "IDR",
        })),
        {
          "@type": "Offer",
          name: "Snack Box",
          description: `${snackRingkasan.totalPilihan} pilihan jajanan, dirakit sendiri sesuai anggaran.`,
          priceCurrency: "IDR",
        },
      ],
    },
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(bisnis) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </>
  );
}
