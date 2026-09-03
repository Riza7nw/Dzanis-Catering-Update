import type { CSSProperties } from "react";

import { Reveal } from "@/components/organic/Reveal";
import { langkah } from "@/data/konten";

/**
 * Seksi "Cara pesan".
 * Mobile memakai `judul` (versi panjang), desktop `judulRingkas` — keduanya
 * ada di artboard, jadi keduanya dirender dan disembunyikan per viewport.
 * Nomor lingkaran cuma hiasan: urutan sudah dibawa oleh <ol>, maka
 * nomornya di-aria-hidden supaya tidak terbaca dua kali.
 *
 * CATATAN FIDELITAS — deskripsi langkah 2 & 3 di artboard mobile lebih
 * pendek daripada versi web ("...dan alamat lengkap." / "...setelah DP
 * masuk."), karena kualifikatornya sudah dibawa judul mobile. `langkah[]`
 * cuma punya satu field `deskripsi` (versi web), jadi mobile ikut memakai
 * teks web dan frasa "via WhatsApp" / "50%" muncul dua kali di layar kecil.
 * Perbaikan sebenarnya: tambah field varian mobile di src/data/konten.ts
 * (sejajar pasangan judul/judulRingkas yang sudah ada), lalu pakai di sini
 * dengan pola lg:hidden / hidden lg:inline yang sama seperti judul.
 */
export function CaraPesan() {
  return (
    <section
      id="cara"
      className="px-[var(--space-4)] py-[var(--space-8)] lg:px-14 lg:pt-0 lg:pb-[72px]"
    >
      <div className="mx-auto flex max-w-[1280px] flex-col gap-[var(--space-6)] lg:gap-8">
        <h2 className="font-heading text-[29px] leading-[1.12] lg:text-[52px] lg:leading-[0.98] lg:tracking-[-0.01em] lg:uppercase">
          Cara pesan
        </h2>

        {/* Kasus "cucu": <div> bukan anak yang sah bagi <ol>, jadi Reveal
            membungkus <ol> dari luar. Itu membuat <li> jadi cucu [data-reveal],
            tidak tersentuh aturan nth-child anak-langsung — makanya tiap <li>
            diberi --i eksplisit, dan giliran-manual mematikan fade anak-langsung
            supaya <ol> sendiri tidak ikut memudar. */}
        <Reveal className="giliran-manual">
          <ol
            role="list"
            className="flex list-none flex-col gap-[var(--space-4)] lg:grid lg:grid-cols-4 lg:gap-6"
          >
            {langkah.map((item, i) => (
              <li
                key={item.judulRingkas}
                style={{ "--i": i } as CSSProperties}
                className="flex items-start gap-[var(--space-3)] lg:flex-col lg:gap-3"
              >
                <span
                  aria-hidden="true"
                  className="lingkaran-langkah flex size-10 flex-none items-center justify-center rounded-full bg-accent-2-300 font-heading text-[17px] text-accent-2-900 lg:size-[52px] lg:text-[21px]"
                >
                  {i + 1}
                </span>

                <div className="pt-[5px] lg:flex lg:flex-col lg:gap-3 lg:pt-0">
                  <h3 className="mb-[2px] font-heading text-[19px] leading-tight lg:mb-0 lg:text-[21px]">
                    <span className="lg:hidden">{item.judul}</span>
                    <span className="hidden lg:inline">{item.judulRingkas}</span>
                  </h3>
                  <p className="text-[15px] leading-[1.5] text-neutral-800 lg:leading-[1.55]">
                    {item.deskripsi}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </Reveal>
      </div>
    </section>
  );
}
