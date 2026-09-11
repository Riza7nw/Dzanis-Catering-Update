/**
 * Schema.org JSON-LD Structured Data Generators for Dzanis Catering
 * Sesuai pedoman Google Rich Results untuk FoodEstablishment dan Product.
 */

import { company, waPhoneNumber } from '../data/company';
import { DAFTAR_PAKET, type Paket } from '../data/paket';
import { DAFTAR_LAYANAN_LAIN } from '../data/layananLain';
import { snackRingkasan } from '../data/snack';

export const DEFAULT_SITE_URL = "https://dzanis-catering-update.vercel.app";

/**
 * Menghasilkan JSON-LD schema FoodEstablishment dengan nested Menu (hasMenu)
 * untuk halaman utama (index.astro).
 */
export function generateFoodEstablishmentSchema(siteUrl: string = DEFAULT_SITE_URL) {
  const site = siteUrl.replace(/\/$/, '');
  const cleanPhone = waPhoneNumber.replace(/\D/g, '');
  const formattedPhone = cleanPhone.startsWith('62') ? `+${cleanPhone}` : `+62${cleanPhone}`;

  return {
    "@context": "https://schema.org",
    "@type": "FoodEstablishment",
    "@id": `${site}/#organization`,
    name: company.name,
    legalName: company.name,
    description: company.description,
    url: site,
    telephone: formattedPhone,
    priceRange: "Rp20.000 - Rp75.000",
    servesCuisine: "Indonesian",
    image: [
      `${site}${company.logo}`,
      `${site}/images/menu/hero-nasi-kotak.jpg`,
      `${site}/images/menu/paket-23k.jpg`
    ],
    logo: `${site}${company.logo}`,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Majalengka",
      addressRegion: "Jawa Barat",
      addressCountry: "ID"
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: -6.8361,
      longitude: 108.2277
    },
    areaServed: [
      { "@type": "AdministrativeArea", name: "Majalengka" },
      { "@type": "AdministrativeArea", name: "Cirebon" },
      { "@type": "AdministrativeArea", name: "Indramayu" },
      { "@type": "AdministrativeArea", name: "Kuningan" }
    ],
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday"
        ],
        opens: "06:00",
        closes: "21:00"
      }
    ],
    hasMenu: {
      "@type": "Menu",
      name: "Daftar Menu & Layanan Dzanis Catering",
      url: `${site}/#paket`,
      hasMenuSection: [
        {
          "@type": "MenuSection",
          name: "Paket Nasi Kotak",
          description: "Pilihan paket nasi kotak higienis lengkap dengan alat makan steril untuk berbagai acara di Ciayumajakuning.",
          hasMenuItem: DAFTAR_PAKET.map((item) => ({
            "@type": "MenuItem",
            name: item.nama,
            description: item.deskripsiSingkat,
            image: `${site}${item.foto}`,
            url: `${site}/paket/${item.slug}`,
            offers: {
              "@type": "Offer",
              price: item.harga,
              priceCurrency: "IDR",
              availability: "https://schema.org/InStock",
              priceValidUntil: "2026-12-31",
              eligibleQuantity: {
                "@type": "QuantitativeValue",
                minValue: item.minOrder,
                unitText: "Box"
              }
            }
          }))
        },
        {
          "@type": "MenuSection",
          name: "Snack Box Custom",
          description: `Pilihan ${snackRingkasan.totalPilihan} aneka kue basah, jajanan pasar, puff & pastry, puding, dan menu asin. Harga mulai Rp${snackRingkasan.hargaTermurah.toLocaleString('id-ID')}/biji.`,
          url: `${site}/rakit-snack-box`,
          hasMenuItem: [
            {
              "@type": "MenuItem",
              name: "Snack Box Rakit Sendiri",
              description: `Susun sendiri snack box dari ${snackRingkasan.totalPilihan} pilihan jajanan dengan minimal ${snackRingkasan.totalPilihan > 0 ? 20 : 20} box.`,
              url: `${site}/rakit-snack-box`,
              offers: {
                "@type": "Offer",
                price: snackRingkasan.hargaTermurah,
                priceCurrency: "IDR",
                availability: "https://schema.org/InStock",
                eligibleQuantity: {
                  "@type": "QuantitativeValue",
                  minValue: 20,
                  unitText: "Box"
                }
              }
            }
          ]
        },
        {
          "@type": "MenuSection",
          name: "Layanan Prasmanan & Acara",
          description: "Layanan prasmanan kantor, booth food cart live-serving, dan catering acara & pernikahan.",
          url: `${site}/#layanan`,
          hasMenuItem: DAFTAR_LAYANAN_LAIN.map((item) => ({
            "@type": "MenuItem",
            name: item.nama,
            description: `${item.deskripsi} Fasilitas: ${item.fasilitas.join(', ')}.`,
            image: `${site}${item.foto}`
          }))
        }
      ]
    }
  };
}

/**
 * Menghasilkan JSON-LD schema Product + Offer spesifik untuk halaman detail paket (/paket/[slug].astro).
 * Mematuhi Google Rich Results (tanpa fake aggregateRating).
 */
export function generateProductSchema(paket: Paket, siteUrl: string = DEFAULT_SITE_URL) {
  const site = siteUrl.replace(/\/$/, '');

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${site}/paket/${paket.slug}#product`,
    name: `${paket.nama} — Dzanis Catering`,
    image: [`${site}${paket.foto}`],
    description: paket.deskripsiLengkap || paket.deskripsiSingkat,
    sku: paket.id,
    brand: {
      "@type": "Brand",
      name: company.name
    },
    category: "Food & Catering",
    offers: {
      "@type": "Offer",
      url: `${site}/paket/${paket.slug}`,
      price: paket.harga,
      priceCurrency: "IDR",
      priceValidUntil: "2026-12-31",
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
      eligibleQuantity: {
        "@type": "QuantitativeValue",
        minValue: paket.minOrder,
        unitText: "Box"
      },
      seller: {
        "@type": "Organization",
        name: company.name,
        url: site
      }
    }
  };
}
