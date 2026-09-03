"use client";

import { useId, useState } from "react";

import { faqs } from "@/data/faq";

/**
 * Seksi FAQ.
 * Judul berbeda antar artboard (mobile panjang, web ringkas + uppercase),
 * jadi keduanya dirender dan disembunyikan per viewport.
 * Artboard memberi tiap baris state buka/tutup sendiri, bukan akordeon
 * eksklusif — maka beberapa jawaban boleh terbuka bersamaan.
 */
export function Faq() {
  const [terbuka, setTerbuka] = useState<number[]>([]);
  const uid = useId();

  const toggle = (i: number) =>
    setTerbuka((prev) =>
      prev.includes(i) ? prev.filter((n) => n !== i) : [...prev, i],
    );

  return (
    <section
      id="faq"
      className="px-[var(--space-4)] pb-[var(--space-8)] lg:px-14 lg:pb-20"
    >
      <div className="mx-auto flex max-w-[1280px] flex-col gap-[var(--space-3)] lg:grid lg:grid-cols-[1fr_1.4fr] lg:items-start lg:gap-14">
        <h2 className="font-heading text-[29px] leading-[1.12] lg:text-[44px] lg:leading-none lg:tracking-[-0.01em] lg:uppercase">
          <span className="lg:hidden">Pertanyaan yang sering masuk</span>
          <span className="hidden lg:inline">Sering ditanya</span>
        </h2>

        <div className="flex flex-col">
          {faqs.map((item, i) => {
            const buka = terbuka.includes(i);
            const idPanel = `${uid}-jawaban-${i}`;

            return (
              <div
                key={item.question}
                className="border-t border-divider last:border-b"
              >
                <button
                  type="button"
                  onClick={() => toggle(i)}
                  aria-expanded={buka}
                  aria-controls={idPanel}
                  className="flex w-full cursor-pointer items-center justify-between gap-[var(--space-3)] py-[var(--space-3)] text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-700 lg:min-h-12 lg:gap-6 lg:py-[18px]"
                >
                  <span className="font-heading text-[18px] leading-[1.25] lg:text-[20px]">
                    {item.question}
                  </span>
                  {/* Tanda hanya visual: status sebenarnya dibawa aria-expanded. */}
                  <span
                    aria-hidden="true"
                    data-buka={buka ? "true" : "false"}
                    className="tanda-akordeon w-5 flex-none text-center font-heading text-[20px] text-accent-700 lg:w-[22px] lg:text-[22px]"
                  >
                    {buka ? "−" : "+"}
                  </span>
                </button>

                <div className="akordeon-panel" data-buka={buka ? "true" : "false"}>
                  {/* Pembungkus kosong ini yang menjadi grid item dan mengerut
                      ke nol. Padding TIDAK boleh dipasang di sini: tinggi
                      konten grid item memang mengerut, tapi padding-nya tidak,
                      sehingga tersisa celah yang memperlihatkan jawaban saat
                      panel tertutup. Padding karena itu ada di elemen dalam. */}
                  <div>
                    <div
                      id={idPanel}
                      inert={!buka}
                      className="max-w-[320px] pb-[var(--space-3)] text-[15px] leading-[1.6] text-neutral-800 lg:max-w-[560px] lg:pb-[18px] lg:text-[16px] lg:leading-[1.65]"
                    >
                      {item.answer}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
