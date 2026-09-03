import Image from "next/image";
import Link from "next/link";

import { Reveal } from "@/components/organic/Reveal";
import { formatRupiah, snackRingkasan } from "@/data/snack";

/** Urutan & alt disalin dari artboard (mobile 181-186 · web 133-138). */
const foto = [
  { src: "/images/menu/snack-kue-sus.jpg", alt: "Kue sus" },
  { src: "/images/menu/snack-bolu.jpg", alt: "Bolu" },
  { src: "/images/menu/snack-putu-ayu.jpg", alt: "Putu ayu" },
  { src: "/images/menu/snack-jajan-pasar.jpg", alt: "Jajan pasar" },
  { src: "/images/menu/snack-puding.jpg", alt: "Puding" },
  { src: "/images/menu/snack-puding-buah.jpg", alt: "Puding buah" },
];

/** Tiga angka besar kolom kiri artboard web (baris 116-129). */
const angka = [
  { nilai: snackRingkasan.totalPilihan, label: "pilihan jajanan" },
  { nilai: snackRingkasan.totalKategori, label: "kategori" },
  { nilai: snackRingkasan.hargaTermurah, label: "rupiah termurah" },
];

/**
 * Teaser snack box — gabungan artboard mobile (175-189) dan web (112-140).
 *
 * Judul dan paragrafnya memang berbeda antar artboard, bukan versi pendek
 * dari yang sama: mobile menaruh angka di judul ("51 pilihan jajanan,
 * mulai Rp500") lalu daftar kategori di paragraf, sedangkan web memakai
 * judul bermerek "Snack box isi sendiri" dan memindahkan angkanya ke
 * paragraf plus tiga angka besar. Keduanya dirender, ditukar di lg.
 *
 * Angka mobile tidak hilang: nilainya sama, hanya diucapkan sebagai kalimat.
 *
 * Kolom kiri memakai display:contents di mobile supaya grid foto bisa
 * menyela antara paragraf dan tombol sesuai artboard mobile, sementara di
 * lg ia kembali jadi satu kolom flex yang bisa ditengahkan grid.
 */
export function SnackBox() {
  return (
    <section id="snack">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-[var(--space-4)] px-[var(--space-4)] py-[var(--space-8)] lg:grid lg:grid-cols-[1fr_1.2fr] lg:items-center lg:gap-14 lg:px-14 lg:py-[72px]">
        <div className="contents lg:flex lg:flex-col lg:gap-[22px]">
          <div className="flex flex-col gap-[var(--space-2)] lg:contents">
            <h2 className="m-0 max-w-[300px] text-[29px] leading-[1.12] lg:max-w-none lg:text-[56px] lg:leading-[0.96] lg:tracking-[-0.01em] lg:uppercase">
              <span className="lg:hidden">
                {snackRingkasan.totalPilihan} pilihan jajanan, mulai{" "}
                {formatRupiah(snackRingkasan.hargaTermurah)}
              </span>
              <span className="hidden lg:inline">
                Snack box{" "}
                <span className="font-body font-normal normal-case italic text-accent-700">
                  isi sendiri
                </span>
              </span>
            </h2>

            <p className="m-0 text-[16px] leading-[1.6] text-neutral-800 lg:hidden">
              Puff & pastry, aneka cake, kue basah, puding, menu asin, dan
              pelengkap. Pilih sendiri isinya, harga mengikuti isi box.
            </p>
            <p className="m-0 hidden max-w-[380px] text-[17px] leading-[1.65] text-neutral-800 lg:block">
              {snackRingkasan.totalPilihan} pilihan jajanan mulai{" "}
              {formatRupiah(snackRingkasan.hargaTermurah)} — puff & pastry,
              aneka cake, kue basah, puding, menu asin, dan pelengkap. Harga box
              mengikuti isi yang dipilih.
            </p>
          </div>

          <Reveal className="hidden lg:flex lg:gap-8">
            {angka.map((a) => (
              <div key={a.label}>
                <div className="font-heading text-[38px] leading-none text-accent-700">
                  {a.nilai}
                </div>
                <div className="text-[14px] text-neutral-700">{a.label}</div>
              </div>
            ))}
          </Reveal>

          <Link
            href="/rakit-snack-box"
            className="btn btn-primary btn-block order-1 min-h-[52px] text-[16px] lg:order-none lg:min-h-12 lg:w-auto lg:self-start lg:px-[26px] lg:text-[14px] lg:tracking-[0.06em] lg:uppercase"
          >
            <span className="lg:hidden">Rakit snack box sendiri</span>
            <span className="hidden lg:inline">Rakit snack box</span>
          </Link>
        </div>

        {/* Bulat di mobile, persegi radius-sm di web. Reveal menggantikan div
            pembungkus grid ini (bukan menambah lapisan baru) supaya keenam
            foto tetap jadi anak langsung [data-reveal] dan kena giliran
            nth-child dari Task 2. */}
        <Reveal className="grid grid-cols-3 gap-[var(--space-3)] lg:gap-[14px] stagger-rapat">
          {foto.map((f) => (
            <div
              key={f.src}
              className="relative aspect-square overflow-hidden rounded-full bg-surface lg:rounded-[var(--radius-sm)]"
            >
              <Image
                src={f.src}
                alt={f.alt}
                fill
                sizes="(min-width: 1280px) 194px, (min-width: 1024px) 17vw, 33vw"
                className="washed object-cover"
              />
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
