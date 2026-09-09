import Image from "next/image";

import { company } from "@/data/company";

/** Tautan anchor hanya ada di artboard web; di mobile disembunyikan. */
const tautan = [
  { label: "Paket", href: "#paket" },
  { label: "Snack Box", href: "#snack" },
  { label: "Layanan", href: "#layanan" },
  { label: "Cara pesan", href: "#cara" },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-bg lg:border-b lg:border-divider">
      <div className="mx-auto flex max-w-[1280px] items-center gap-[var(--space-2)] px-[var(--space-4)] py-[var(--space-3)] lg:gap-[var(--space-7)] lg:px-14 lg:py-[22px]">
        <div className="mr-auto flex items-center gap-[var(--space-2)] lg:gap-[var(--space-3)]">
          <Image
            src={company.mark}
            alt={company.name}
            width={40}
            height={40}
            preload
            className="size-9 shrink-0 rounded-full object-contain lg:size-10"
          />
          {/* Nama brand dipendekkan di mobile, versi panjang uppercase di web. */}
          <span className="font-heading font-semibold tracking-[0.02em]">
            <span className="text-[17px] lg:hidden">Dzanis</span>
            <span className="hidden text-[22px] lg:inline">DZANIS CATERING</span>
          </span>
        </div>

        <nav
          aria-label="Navigasi utama"
          className="hidden items-center gap-[34px] text-[15px] lg:flex"
        >
          {tautan.map((t) => (
            <a
              key={t.href}
              href={t.href}
              className="flex min-h-11 items-center text-text no-underline transition-colors hover:text-accent-700"
            >
              {t.label}
            </a>
          ))}
        </nav>

        <a
          className="btn btn-primary px-[18px] lg:px-[var(--space-5)]"
          href={company.contact.whatsappLink}
        >
          <span className="lg:hidden">Pesan</span>
          <span className="hidden lg:inline">Pesan sekarang</span>
        </a>
      </div>
    </header>
  );
}
