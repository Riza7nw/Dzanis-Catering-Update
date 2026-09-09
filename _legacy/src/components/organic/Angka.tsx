import { Fragment, type CSSProperties } from "react";

import { Reveal } from "@/components/organic/Reveal";
import { company } from "@/data/company";

const angka = [
  { nilai: company.stats.tahun, label: company.stats.tahunLabel },
  { nilai: company.stats.acara, label: company.stats.acaraLabel },
  { nilai: company.stats.pilihan, label: company.stats.pilihanLabel },
];

/**
 * Strip angka statistik — hanya ada di artboard mobile (baris 246-264).
 * Nilai & keterangan diambil dari company.stats, isinya identik dengan
 * teks artboard ({{ angka1 }} = 8, {{ angka2 }} = 400+, {{ angka3 }} = 51).
 * Versi desktop diturunkan sendiri: tiga kolom sejajar dengan garis tegak.
 */
export function Angka() {
  return (
    <section className="px-[var(--space-4)] pb-[var(--space-8)] lg:px-14 lg:pb-[72px]">
      {/* Kasus "cucu": Fragment menyelipkan <div> garis pemisah di antara
          blok isi, jadi anak langsung wadahnya berpola blok-garis-blok-garis-
          blok — nth-child akan ikut menghitung garis dan gilirannya meleset.
          --i eksplisit dipasang hanya pada blok isi; garis pemisah dibiarkan
          tanpa --i supaya muncul bersama panel, tidak ikut bergiliran. */}
      <Reveal className="giliran-manual">
        <div className="mx-auto max-w-[1280px] rounded-[32px] bg-accent-2-200 px-[var(--space-4)] py-[var(--space-6)] lg:px-[var(--space-8)] lg:py-[var(--space-7)]">
          {/* Mobile: tiga baris bertumpuk. Web: tiga kolom sejajar, garis ikut memutar. */}
          <div className="flex flex-col gap-[var(--space-4)] lg:flex-row lg:items-stretch lg:gap-[var(--space-7)]">
            {angka.map((item, i) => (
              <Fragment key={item.label}>
                {i > 0 && (
                  <div
                    aria-hidden="true"
                    className="h-px w-full bg-accent-2-900/20 lg:h-auto lg:w-px lg:shrink-0"
                  />
                )}
                <div
                  style={{ "--i": i } as CSSProperties}
                  className="flex items-baseline gap-[var(--space-3)] lg:flex-1 lg:flex-col lg:items-start lg:gap-[var(--space-2)]"
                >
                  <div className="font-heading text-[42px] leading-none text-accent-2-900 lg:text-[56px]">
                    {item.nilai}
                  </div>
                  <div className="text-[15px] leading-[1.4] text-accent-2-900 lg:max-w-[220px] lg:text-[16px]">
                    {item.label}
                  </div>
                </div>
              </Fragment>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  );
}
