import Image from "next/image";

import { company } from "@/data/company";

/** Kolom tautan hanya ada di artboard web; di mobile seluruh kolom disembunyikan. */
const kolomMenu = [
  { label: "Paket nasi kotak", href: "#paket" },
  { label: "Snack box", href: "#snack" },
  { label: "Prasmanan", href: "#layanan" },
  { label: "Booth / food cart", href: "#layanan" },
];

/** Dua tautan terakhir masih "#" persis seperti artboard — belum ada seksinya. */
const kolomInformasi = [
  { label: "Cara pesan", href: "#cara" },
  { label: "Area pengantaran", href: "#" },
  { label: "Sering ditanya", href: "#" },
];

const judulKolom =
  "font-heading text-[15px] font-semibold uppercase tracking-[0.06em] text-accent-400";
const tautanKolom =
  "text-[15px] text-neutral-300 no-underline transition-colors hover:text-bg";

export function Footer() {
  return (
    <footer className="bg-neutral-900 text-bg">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-[var(--space-6)] px-[var(--space-4)] py-[var(--space-8)] lg:gap-12 lg:px-14 lg:pt-16 lg:pb-10">
        <div className="flex flex-col gap-[var(--space-6)] lg:grid lg:grid-cols-[1.4fr_1fr_1fr_1.3fr] lg:gap-10">
          {/* Kolom 1 — identitas */}
          <div className="flex flex-col gap-[var(--space-4)] lg:gap-4">
            <div className="flex items-center gap-[var(--space-3)]">
              <span className="flex size-[52px] shrink-0 items-center justify-center rounded-full bg-bg lg:size-[46px]">
                <Image
                  src={company.mark}
                  alt={company.name}
                  width={44}
                  height={44}
                  className="size-11 rounded-full object-contain lg:size-[38px]"
                />
              </span>
              <div>
                <div className="font-heading text-[20px] font-semibold lg:text-[22px] lg:tracking-[0.02em] lg:uppercase">
                  {company.name}
                </div>
                <div className="text-[14px] text-neutral-400 lg:hidden">
                  {company.tagline}
                </div>
              </div>
            </div>
            <p className="hidden max-w-[260px] text-[15px] leading-[1.6] text-neutral-400 lg:block">
              Katering rumahan dari Majalengka. Nasi kotak, snack box, dan
              prasmanan untuk segala acara, diantar ke seluruh Ciayumajakuning.
            </p>
          </div>

          {/* Kolom 2 & 3 — hanya artboard web */}
          <nav
            aria-label="Menu"
            className="hidden flex-col gap-[var(--space-3)] lg:flex"
          >
            <h2 className={judulKolom}>Menu</h2>
            {kolomMenu.map((t) => (
              <a key={t.label} href={t.href} className={tautanKolom}>
                {t.label}
              </a>
            ))}
          </nav>

          <nav
            aria-label="Informasi"
            className="hidden flex-col gap-[var(--space-3)] lg:flex"
          >
            <h2 className={judulKolom}>Informasi</h2>
            {kolomInformasi.map((t) => (
              <a key={t.label} href={t.href} className={tautanKolom}>
                {t.label}
              </a>
            ))}
          </nav>

          {/* Kolom 4 — kontak langsung */}
          <div className="flex flex-col gap-[var(--space-6)] lg:gap-3.5">
            <h2 className={`hidden lg:block ${judulKolom}`}>Pesan langsung</h2>
            {/* Di mobile label & nomor rapat 4px; di web larut agar ikut jarak kolom. */}
            <div className="flex flex-col gap-[var(--space-1)] lg:contents">
              <span className="text-[14px] text-neutral-400 lg:hidden">
                Menerima pesanan setiap hari
              </span>
              <a
                href={company.contact.phoneHref}
                className="font-heading text-[31px] leading-[1.1] font-semibold text-bg no-underline transition-colors hover:text-accent-400 lg:text-[32px]"
              >
                {company.contact.whatsappDisplay}
              </a>
              <span className="hidden text-[14px] text-neutral-400 lg:block">
                {company.contact.operatingHours}
              </span>
            </div>
            {/* Cincin fokus bawaan .btn memakai accent-700 — di atas neutral-900
                rasionya cuma ~1,9:1, jadi di footer gelap warnanya ditimpa
                menjadi --color-bg agar lolos WCAG 1.4.11. */}
            <a
              className="btn btn-primary btn-block min-h-13 text-[16px] focus-visible:outline-bg lg:min-h-12 lg:w-auto lg:self-start lg:px-[var(--space-5)] lg:text-[14px] lg:tracking-[0.05em] lg:uppercase"
              href={company.contact.whatsappLink}
            >
              <span className="lg:hidden">Pesan via WhatsApp</span>
              <span className="hidden lg:inline">WhatsApp</span>
            </a>
          </div>
        </div>

        <div className="flex flex-col gap-[var(--space-2)] border-t border-bg/22 pt-[var(--space-4)] text-neutral-400 lg:flex-row lg:justify-between lg:gap-[var(--space-5)] lg:border-bg/20 lg:pt-[var(--space-5)]">
          <div className="text-[14px] leading-[1.5] lg:hidden">
            Dapur di Majalengka, mengantar ke {company.ketentuan.areaAntar}.
            Pengantaran mulai pukul 06.00.
          </div>
          <div className="text-[13px]">© 2026 Dzanis Catering</div>
          <div className="hidden text-[13px] lg:block">
            {company.contact.address}
          </div>
        </div>
      </div>
    </footer>
  );
}
