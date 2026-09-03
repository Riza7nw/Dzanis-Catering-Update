import Image from "next/image";

import { waLink } from "@/data/company";

/** Pesan pembuka WhatsApp dari hero — dipakai dua tombol (mobile & web). */
const PESAN_HERO = "Halo Dzanis Catering, saya mau tanya paket nasi kotak.";

export function Hero() {
  return (
    <section className="hero-masuk mx-auto flex max-w-[1280px] flex-col gap-[var(--space-4)] px-[var(--space-4)] pt-[var(--space-3)] pb-[var(--space-8)] lg:gap-[44px] lg:px-14 lg:pt-16 lg:pb-[72px]">
      {/* Judul & paragraf: bertumpuk di mobile, sebaris rata-bawah di web. */}
      <div className="flex flex-col gap-[var(--space-4)] lg:flex-row lg:items-end lg:justify-between lg:gap-[var(--space-8)]">
        {/* 82px persis di lebar artboard (1280px); clamp hanya mengecilkan
            judul di rentang 1024–1279px supaya tidak menabrak paragraf. */}
        <h1 className="m-0 max-w-[330px] font-heading text-[38px] leading-[1.06] tracking-[-0.01em] text-pretty uppercase lg:max-w-[820px] lg:text-[clamp(56px,5.8vw,82px)] lg:leading-[0.94] lg:tracking-[-0.02em] xl:text-[82px]">
          Setiap sajian punya{" "}
          <span className="font-body font-normal tracking-[-0.01em] normal-case italic text-accent-700 lg:whitespace-nowrap">
            cerita
          </span>
        </h1>
        <p className="m-0 max-w-[320px] text-[16px] leading-[1.6] text-neutral-800 lg:mb-[var(--space-2)] lg:w-[300px] lg:max-w-none lg:flex-none">
          Hidangan yang dibuat dengan bahan pilihan dan cita rasa terbaik untuk
          menemani cerita di balik setiap momen berharga.
        </p>
      </div>

      {/* Dua tombol block hanya ada di artboard mobile. */}
      <div className="flex flex-col items-start gap-[var(--space-2)] lg:hidden">
        <a className="btn btn-primary btn-block min-h-[52px] text-[16px]" href="#paket">
          Lihat paket &amp; harga
        </a>
        <a
          className="btn btn-secondary btn-block min-h-[52px] text-[16px]"
          href={waLink(PESAN_HERO)}
        >
          Pesan via WhatsApp
        </a>
      </div>

      <div className="relative mt-[var(--space-2)] lg:mt-0">
        {/* Lingkaran sage mengintip di balik foto — versi mobile. */}
        <span
          aria-hidden="true"
          className="lingkaran-sage absolute top-[-22px] right-[-14px] size-24 rounded-full bg-accent-2-300 lg:hidden"
        />

        <div className="grid gap-[var(--space-4)] lg:grid-cols-[1.55fr_1fr]">
          {/* Bayangan hanya ada di artboard mobile; versi web tanpa shadow. */}
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[var(--radius-lg)] bg-surface shadow-[var(--shadow-md)] lg:rounded-[var(--radius-md)] lg:shadow-none">
            <Image
              src="/images/menu/hero-nasi-kotak.jpg"
              alt="Nasi kotak Dzanis Catering"
              fill
              preload
              sizes="(min-width: 1024px) 700px, calc(100vw - 40px)"
              className="washed object-cover"
            />
          </div>

          {/* Foto kedua hanya muncul di artboard web. Slot ini dibiarkan kosong
              di artboard ("foto acara / meja prasmanan"), jadi diisi foto Dzanis
              asli dari poster harga sampai pemilik mengirim foto acara. */}
          <div className="relative hidden overflow-hidden rounded-[var(--radius-md)] bg-surface lg:block">
            <Image
              src="/images/menu/paket-23k.jpg"
              alt="Nasi kotak lengkap Dzanis Catering"
              fill
              sizes="(min-width: 1024px) 450px, 100vw"
              className="washed object-cover"
            />
          </div>
        </div>

        {/* Badge harga menumpuk di sudut grid — versi web. */}
        <div className="absolute top-[-34px] right-[-16px] hidden size-[118px] flex-col items-center justify-center gap-px rounded-full bg-accent text-bg shadow-[var(--shadow-md)] lg:flex">
          <span className="font-heading text-[14px] tracking-[0.04em]">MULAI</span>
          <span className="font-heading text-[27px] leading-none">20K</span>
          <span className="text-[12px] tracking-[0.04em] text-accent-900">per box</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-[var(--space-2)] lg:gap-[14px]">
        <span className="tag tag-accent lg:hidden">Mulai Rp20.000/box</span>
        <span className="tag tag-accent-2 hidden lg:inline-flex lg:px-4 lg:py-[var(--space-2)]">
          Halal, masakan rumahan
        </span>
        {/* Sage di mobile, netral di web — mengikuti masing-masing artboard. */}
        <span className="tag tag-accent-2 lg:bg-neutral-200 lg:px-4 lg:py-[var(--space-2)] lg:text-neutral-800">
          Minimal 20 box
        </span>
        <span className="tag tag-neutral lg:px-4 lg:py-[var(--space-2)]">Antar Ciayumajakuning</span>
        <a
          className="btn btn-secondary hidden px-[22px] lg:ml-auto lg:inline-flex"
          href={waLink(PESAN_HERO)}
        >
          Tanya via WhatsApp
        </a>
      </div>
    </section>
  );
}
