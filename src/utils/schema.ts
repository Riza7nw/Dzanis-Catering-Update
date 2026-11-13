/**
 * Schema.org JSON-LD Structured Data Generators for Dzanis Catering
 * Sesuai pedoman Google Rich Results untuk FoodEstablishment dan Product.
 */

import { company, waPhoneNumber } from '../data/company.ts';
import { DAFTAR_PAKET, type Paket, formatNamaPaket } from '../data/paket.ts';
import { DAFTAR_LAYANAN_LAIN } from '../data/layananLain.ts';
import { snackRingkasan } from '../data/snack.ts';

export const DEFAULT_SITE_URL = "https://dzanis-catering-update.vercel.app";

/**
 * Menghasilkan JSON-LD schema WebSite sesuai standar Google Search Site Name.
 * Memastikan Google menampilkan "Dzanis Catering" di baris nama situs pada SERP.
 */
export function generateWebSiteSchema(siteUrl: string = DEFAULT_SITE_URL) {
  const site = siteUrl.replace(/\/$/, '');
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Dzanis Catering",
    alternateName: ["Dzanis Katering", "Dzanis Catering Ciayumajakuning"],
    url: `${site}/`,
  };
}

export const webSiteSchema = generateWebSiteSchema();

/**
 * Menghasilkan JSON-LD schema FoodEstablishment dengan nested Menu (hasMenu)
 * dan OfferCatalog lengkap untuk seluruh lini layanan di halaman utama (index.astro).
 */
export function generateFoodEstablishmentSchema(siteUrl: string = DEFAULT_SITE_URL, menuItems?: Paket[]) {
  const site = siteUrl.replace(/\/$/, '');
  const cleanPhone = waPhoneNumber.replace(/\D/g, '');
  const formattedPhone = cleanPhone.startsWith('62') ? `+${cleanPhone}` : `+62${cleanPhone}`;
  const nasiKotakItems = menuItems !== undefined ? menuItems : DAFTAR_PAKET;

  return {
    "@context": "https://schema.org",
    "@type": ["FoodEstablishment", "CateringService"],
    "@id": `${site}/#organization`,
    name: company.name,
    legalName: company.name,
    description: "Dzanis Catering adalah penyedia jasa catering & katering terpercaya di Ciayumajakuning (Kabupaten Majalengka, Cirebon, Indramayu, Kuningan). Melayani prasmanan kantor & acara, paket nasi box (nasi kotak), snack box custom, nasi tumpeng, hingga paket konsumsi syukuran dan harian dengan sajian higienis serta cita rasa khas masakan rumahan.",
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
      { "@type": "AdministrativeArea", name: "Ciayumajakuning" },
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
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Layanan Lengkap Dzanis Catering & Katering Ciayumajakuning",
      itemListElement: [
        {
          "@type": "OfferCatalog",
          name: "Layanan Prasmanan / Buffet Acara",
          itemListElement: [
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: "Paket Prasmanan Kantor, Resepsi & Syukuran",
                description: "Layanan jamuan prasmanan higienis siap saji lengkap dengan peralatan pemanas (chafing dish), piring keramik, dan waiter untuk rapat kerja, seminar, resepsi pernikahan, dan syukuran di Majalengka & Ciayumajakuning."
              },
              price: "45000",
              priceCurrency: "IDR"
            }
          ]
        },
        {
          "@type": "OfferCatalog",
          name: "Paket Nasi Kotak (Nasi Box)",
          itemListElement: [
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: "Paket Nasi Kotak Higienis",
                description: "Pilihan menu nasi kotak mulai Rp20.000 dengan lauk olahan ayam, olahan daging sapi, lauk pendamping kustom, dan alat makan steril untuk acara kantor dan syukuran."
              },
              price: "20000",
              priceCurrency: "IDR"
            }
          ]
        },
        {
          "@type": "OfferCatalog",
          name: "Paket Snack Box Acara",
          itemListElement: [
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: "Snack Box Custom & Coffeebreak",
                description: "Aneka pilihan kue basah, jajanan pasar, puff & pastry, serta puding higienis mulai Rp2.000/biji untuk kebutuhan coffeebreak rapat dan seminar."
              },
              price: "2000",
              priceCurrency: "IDR"
            }
          ]
        },
        {
          "@type": "OfferCatalog",
          name: "Nasi Tumpeng & Paket Syukuran",
          itemListElement: [
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: "Nasi Tumpeng Tradisional & Tumpeng Mini",
                description: "Sajian nasi tumpeng kuning tampah hias komplit dan tumpeng mini untuk syukuran, selamatan rumah, peresmian kantor, dan ulang tahun di Majalengka & Ciayumajakuning."
              }
            }
          ]
        },
        {
          "@type": "OfferCatalog",
          name: "Paket Acara & Katering Harian",
          itemListElement: [
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: "Katering Acara Kantor, Hajatan & Harian",
                description: "Solusi konsumsi terpadu untuk acara kantor, hajatan keluarga, corporate gathering, dan kebutuhan katering makan harian institusi."
              }
            }
          ]
        }
      ]
    },
    hasMenu: {
      "@type": "Menu",
      name: "Daftar Menu & Layanan Dzanis Catering",
      url: `${site}/#paket`,
      hasMenuSection: [
        {
          "@type": "MenuSection",
          name: "Paket Nasi Kotak",
          description: "Pilihan paket nasi kotak higienis lengkap dengan alat makan steril untuk berbagai acara di Ciayumajakuning.",
          hasMenuItem: nasiKotakItems.map((item) => ({
            "@type": "MenuItem",
            name: formatNamaPaket(item.nama),
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
                maxValue: item.maxOrder || 500,
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
                  maxValue: 500,
                  unitText: "Box"
                }
              }
            }
          ]
        },
        {
          "@type": "MenuSection",
          name: "Layanan Prasmanan Kantor",
          description: "Layanan prasmanan kantor higienis dan praktis untuk rapat kerja, pelatihan, dan syukuran kantor.",
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
    name: `${formatNamaPaket(paket.nama)} — Dzanis Catering`,
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
        maxValue: paket.maxOrder || 500,
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
