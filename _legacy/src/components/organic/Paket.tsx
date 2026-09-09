"use client";

import Image from "next/image";
import { useId, useState } from "react";
import { Reveal } from "@/components/organic/Reveal";
import { waLink } from "@/data/company";
import { paket } from "@/data/paket";
import { formatRupiah } from "@/data/snack";

/**
 * Seksi "paket" — dua artboard digabung jadi satu komponen.
 *
 * Mobile  : carousel geser samping berisi kartu paket lengkap (foto, tag,
 *           daftar lauk, akordeon lauk pendamping, tombol pesan).
 * Desktop : band olive dengan grid foto 2x2 + baris harga ringkas.
 *
 * Kedua susunan terlalu berbeda untuk dipaksakan jadi satu pohon DOM, jadi
 * masing-masing dirender lalu ditukar lewat `lg:` — tidak ada isi yang hilang.
 */

/** Garis tipis pada band gelap; dibuat dari token bg, bukan nilai warna baru. */
const GARIS_BAND = "color-mix(in srgb, var(--color-bg) 26%, transparent)";

/**
 * Foto ke-4 pada grid web adalah slot "tumpukan box siap antar" yang di artboard
 * masih kosong. Diisi foto Dzanis asli sampai pemilik mengirim foto box siap
 * antar — artboard sendiri juga memakai ulang satu lembar poster untuk beberapa
 * slot, jadi pengulangan begini konsisten dengan desainnya.
 */
const fotoBand = [
  ...paket.map((p) => ({ src: p.foto, alt: p.fotoAlt })),
  { src: "/images/menu/hero-nasi-kotak.jpg", alt: "Nasi kotak siap antar" },
];

export function Paket() {
  const [terbuka, setTerbuka] = useState<Record<string, boolean>>({});
  const uid = useId();

  const toggle = (id: string) =>
    setTerbuka((state) => ({ ...state, [id]: !state[id] }));

  return (
    <section id="paket">
      {/* ── Mobile: carousel kartu paket ─────────────────────────────── */}
      <div className="flex flex-col gap-[var(--space-4)] bg-surface py-[var(--space-8)] lg:hidden">
        <div className="flex flex-col gap-[var(--space-1)] px-[var(--space-4)]">
          <h2 className="font-heading text-[29px] leading-[1.12]">
            Tiga paket nasi kotak
          </h2>
          <p className="max-w-[300px] text-[15px] leading-[1.55] text-neutral-800">
            Harga per box, sudah termasuk kemasan dan sendok. Geser untuk
            melihat semua.
          </p>
        </div>

        <div className="dz-scroll flex snap-x snap-mandatory gap-[var(--space-3)] overflow-x-auto px-[var(--space-4)] pt-[var(--space-1)] pb-[var(--space-2)]">
          {paket.map((p) => {
            const panelId = `${uid}-pendamping-${p.id}`;
            const tombolId = `${uid}-pendamping-tombol-${p.id}`;
            const buka = Boolean(terbuka[p.id]);

            return (
              <article
                key={p.id}
                className={`flex w-[300px] flex-none snap-start flex-col overflow-hidden rounded-[32px] bg-bg ${
                  p.populer ? "shadow-[var(--shadow-lg)]" : "shadow-[var(--shadow-md)]"
                }`}
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-surface">
                  <Image
                    src={p.foto}
                    alt={p.fotoAlt}
                    fill
                    sizes="300px"
                    className="washed object-cover"
                  />
                  {p.populer ? (
                    <span className="absolute top-[12px] left-[12px] rounded-full bg-accent px-[14px] py-[7px] font-heading text-[13px] text-bg">
                      Paling sering dipesan
                    </span>
                  ) : null}
                </div>

                <div className="flex flex-1 flex-col gap-[var(--space-3)] p-[var(--space-4)]">
                  <div>
                    <h3 className="mb-[2px] font-heading text-[24px]">
                      {p.nama}
                    </h3>
                    <p className="flex items-baseline gap-[2px] text-accent-700">
                      <span className="font-heading text-[19px]">Rp</span>
                      <span className="font-heading text-[34px] leading-none">
                        {p.harga.toLocaleString("id-ID")}
                      </span>
                      <span className="ml-[6px] text-[14px] text-neutral-700">
                        per box
                      </span>
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-[var(--space-1)]">
                    {p.sudahTermasuk.map((item) => (
                      <span key={item} className="tag tag-accent-2 text-[12px]">
                        ✓ {item}
                      </span>
                    ))}
                  </div>

                  <div className="flex flex-col gap-[var(--space-2)]">
                    {p.lauk.map((l) => (
                      <p key={l.nama} className="text-[15px] leading-[1.45]">
                        {l.nama}{" "}
                        <span className="text-neutral-700">— {l.ket}</span>
                      </p>
                    ))}
                  </div>

                  <div className="flex flex-col gap-[var(--space-2)] border-t border-divider pt-[var(--space-2)]">
                    <button
                      type="button"
                      id={tombolId}
                      aria-expanded={buka}
                      aria-controls={panelId}
                      onClick={() => toggle(p.id)}
                      className="flex min-h-[48px] cursor-pointer items-center justify-between text-accent-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-700"
                    >
                      <span className="text-[15px] font-semibold">
                        Lauk pendamping ({p.pendamping.length})
                      </span>
                      <span
                        aria-hidden="true"
                        data-buka={buka ? "true" : "false"}
                        className="tanda-akordeon w-[22px] text-center font-heading text-[18px]"
                      >
                        {buka ? "−" : "+"}
                      </span>
                    </button>
                    <div className="akordeon-panel" data-buka={buka ? "true" : "false"}>
                      {/* Pembungkus kosong ini yang menjadi grid item dan
                          mengerut ke nol. Padding tidak boleh di sini —
                          padding grid item tidak ikut mengerut dan menyisakan
                          celah yang memperlihatkan isi saat panel tertutup. */}
                      <div>
                        <div
                          id={panelId}
                          role="region"
                          aria-labelledby={tombolId}
                          inert={!buka}
                          className="rounded-[var(--radius-lg)] bg-surface p-[var(--space-3)] text-[14px] leading-[1.6] text-neutral-800"
                        >
                          {p.pendamping.join(", ")}
                        </div>
                      </div>
                    </div>
                  </div>

                  <a
                    className="btn btn-primary btn-block mt-auto min-h-[50px] text-[16px]"
                    href={waLink(
                      `Halo Dzanis Catering, saya mau pesan ${p.nama}.`,
                    )}
                  >
                    Pesan paket ini
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {/* ── Desktop: band olive + baris harga ────────────────────────── */}
      <div className="hidden bg-accent-2-800 text-bg lg:block">
        <div className="mx-auto grid max-w-[1280px] grid-cols-[1.15fr_1fr] items-start gap-[56px] px-[56px] py-[64px]">
          <div className="grid grid-cols-2 gap-[14px]">
            {fotoBand.map((f) => (
              <div
                key={f.src}
                className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-sm)] bg-accent-2-900"
              >
                <Image
                  src={f.src}
                  alt={f.alt}
                  fill
                  sizes="(min-width: 1280px) 290px, 30vw"
                  className="washed object-cover"
                />
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-[24px]">
            <h2 className="font-heading text-[56px] leading-[0.96] tracking-[-0.01em] uppercase">
              Paket nasi kotak
            </h2>
            <p className="max-w-[400px] text-[16px] leading-[1.65] text-accent-2-200">
              Tiga tingkat harga, semuanya sudah termasuk nasi dan kemasan. Lauk
              pendamping bisa dipilih dari 14 pilihan.
            </p>

            {/* Anak langsung: Reveal menggantikan div "flex flex-col" ini
                (bukan carousel mobile — itu sudah bergerak sendiri saat
                digeser) supaya tiga baris harga jadi anak langsung
                [data-reveal] dan kena giliran nth-child dari Task 2. */}
            <Reveal className="flex flex-col">
              {paket.map((p, i) => (
                <div
                  key={p.id}
                  style={{
                    borderTopColor: GARIS_BAND,
                    borderBottomColor: GARIS_BAND,
                  }}
                  className={`flex items-baseline justify-between gap-[20px] border-t py-[18px] ${
                    i === paket.length - 1 ? "border-b" : ""
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-[12px]">
                      <span className="font-heading text-[24px]">{p.nama}</span>
                      {p.populer ? (
                        <span className="rounded-full bg-accent px-[11px] py-[4px] text-[11px] tracking-[0.06em] text-bg uppercase">
                          Paling sering dipesan
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-[2px] text-[14px] leading-[1.5] text-accent-2-200">
                      {p.ringkas}
                    </p>
                  </div>
                  <div className="font-heading text-[30px] whitespace-nowrap">
                    {formatRupiah(p.harga)}
                  </div>
                </div>
              ))}
            </Reveal>

            <a
              className="btn btn-primary min-h-[48px] self-start px-[26px] text-[14px] tracking-[0.06em] uppercase"
              href={waLink(
                "Halo Dzanis Catering, saya mau lihat menu lengkap nasi kotak.",
              )}
            >
              Lihat menu lengkap
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
