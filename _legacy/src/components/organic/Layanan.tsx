import Image from "next/image";

import { Reveal } from "@/components/organic/Reveal";
import { waLink } from "@/data/company";
import { layanan } from "@/data/konten";

/**
 * Seksi "Layanan lain" — gabungan dua artboard.
 *
 * Mobile: latar surface, kartu bg tanpa foto (artboard mobile memang tidak
 * memasang foto di sini). Web: header dua kolom lalu grid tiga kartu
 * bergambar dengan padding 0 supaya foto menempel ke tepi kartu.
 *
 * Paragraf pengantar hanya ada di artboard web, tetapi tetap dirender di
 * mobile agar tidak ada teks yang hilang saat kedua artboard digabung.
 * Ukurannya 16px/1.6 di semua lebar: sama dengan nilai artboard web dan
 * sama dengan paragraf pengantar seksi lain di artboard mobile.
 */
export function Layanan() {
  return (
    <section id="layanan" className="bg-surface lg:bg-bg">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-[var(--space-4)] px-[var(--space-4)] py-[var(--space-8)] lg:gap-8 lg:px-14 lg:py-[72px]">
        <div className="flex flex-col gap-[var(--space-3)] lg:flex-row lg:items-end lg:justify-between lg:gap-10">
          <h2 className="m-0 text-[29px] leading-[1.12] lg:text-[52px] lg:leading-[0.98] lg:tracking-[-0.01em] lg:uppercase">
            Layanan lain
          </h2>
          <p className="m-0 text-[16px] leading-[1.6] text-neutral-800 lg:mb-[6px] lg:w-[340px] lg:flex-none">
            Di luar nasi kotak dan snack box, kami juga menangani acara
            berskala besar.
          </p>
        </div>

        {/* Reveal menggantikan div grid ini (bukan menambah lapisan baru)
            supaya tiga kartu tetap anak langsung [data-reveal], kena
            giliran nth-child dari Task 2. */}
        <Reveal className="flex flex-col gap-[var(--space-3)] lg:grid lg:grid-cols-3 lg:gap-5">
          {layanan.map((item) => (
            <article
              key={item.judul}
              className="card items-start bg-bg lg:gap-0 lg:overflow-hidden lg:bg-surface lg:p-0"
            >
              {/* Foto hanya bagian dari artboard web */}
              <div className="relative hidden aspect-[4/3] w-full lg:block">
                <Image
                  src={item.foto}
                  alt={item.fotoAlt}
                  fill
                  sizes="(min-width: 1280px) 376px, 33vw"
                  className="washed object-cover"
                />
              </div>

              <div className="flex w-full flex-col items-start gap-[var(--space-2)] lg:gap-[10px] lg:px-[26px] lg:pt-6 lg:pb-7">
                <h3 className="card-title text-[20px] lg:text-[23px]">
                  {item.judul}
                </h3>
                <p className="card-body text-[15px] leading-[1.5] lg:leading-[1.55]">
                  {item.deskripsi}
                </p>
                {/* Tiga tombol bertulisan sama; nama aksesibelnya dibedakan
                    tanpa mengubah teks yang terlihat di artboard. */}
                <a
                  className="btn btn-secondary min-h-[44px] lg:text-[13px] lg:tracking-[0.05em] lg:uppercase"
                  href={waLink(
                    `Halo Dzanis Catering, saya mau minta penawaran untuk ${item.judul}.`,
                  )}
                  aria-label={`Minta penawaran untuk ${item.judul}`}
                >
                  Minta penawaran
                </a>
              </div>
            </article>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
