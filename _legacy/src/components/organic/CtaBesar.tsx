import Image from "next/image";

import { waLink } from "@/data/company";

/**
 * Blok CTA dua kolom dari artboard web (foto kiri, panel terakota kanan),
 * baris 142-152 "Homepage Web.dc.html".
 *
 * Artboard mobile tidak punya seksi ini, jadi versi mobile diturunkan dari
 * konvensi artboard mobile yang berlaku di seksi lain, bukan dikarang:
 *   · h2 mobile selalu 29px / line-height 1.12, huruf normal (bukan
 *     uppercase) dan tanpa tracking — uppercase + tracking baru muncul di web.
 *   · seksi mobile memakai padding var(--space-8) var(--space-4).
 *   · foto selebar layar memakai aspect-ratio 4/3, bukan tinggi tetap.
 *   · tombol utama seksi memakai .btn-block 52px / 16px huruf normal;
 *     nilai web (uppercase, tracking 0.06em, 15px, padding-inline 30px)
 *     dipasang di breakpoint lg persis seperti artboard.
 */
export function CtaBesar() {
  return (
    <section>
      <div className="mx-auto grid max-w-[1280px] grid-cols-1 items-stretch lg:grid-cols-2">
        <div className="relative aspect-[4/3] w-full bg-surface lg:aspect-auto lg:min-h-[420px]">
          {/* Artboard menandai slot ini "foto menata / menyerahkan pesanan" tanpa
              aset. Sementara memakai foto Dzanis asli dari poster harga. */}
          <Image
            src="/images/menu/paket-25k.jpg"
            alt="Pesanan nasi kotak Dzanis Catering siap diantar"
            fill
            sizes="(min-width: 1024px) 640px, 100vw"
            className="washed object-cover"
          />
        </div>

        <div className="flex flex-col justify-center gap-[var(--space-5)] bg-accent-300 px-[var(--space-4)] py-[var(--space-8)] lg:gap-[26px] lg:px-14 lg:py-16">
          <h2 className="m-0 font-heading text-[29px] leading-[1.12] text-accent-900 lg:text-[54px] lg:leading-[0.98] lg:tracking-[-0.01em] lg:uppercase">
            Pesan sekarang untuk acara Anda
          </h2>
          <p className="m-0 max-w-[380px] text-[16px] leading-[1.65] text-accent-900">
            Kirim jumlah box, tanggal, dan alamat lewat WhatsApp. Kami balas
            dengan rincian harga di hari yang sama.
          </p>
          <a
            className="btn btn-primary btn-block min-h-[52px] text-[16px] lg:w-auto lg:self-start lg:px-[30px] lg:text-[15px] lg:tracking-[0.06em] lg:uppercase"
            href={waLink(
              "Halo Dzanis Catering, saya mau pesan untuk acara. Berikut jumlah box, tanggal, dan alamatnya:",
            )}
          >
            Pesan via WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}
