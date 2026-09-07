"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { company, waLink } from "@/data/company";
import {
  MIN_BOX,
  STEP_BOX,
  formatRupiah,
  snackKategori,
  snackRingkasan,
} from "@/data/snack";

type QtyMap = Record<string, number>;

type BarisTerpilih = {
  nama: string;
  qty: number;
  /** Harga item × qty, untuk satu box. */
  baris: number;
};

/**
 * Builder snack box: pilih jajanan per biji, tentukan jumlah box,
 * lalu kirim rinciannya ke WhatsApp.
 */
export function RakitSnackBox() {
  const [kategoriAktif, setKategoriAktif] = useState(0);
  const [qty, setQty] = useState<QtyMap>({});
  const [jumlahBox, setJumlahBox] = useState(MIN_BOX);
  const [panelOpen, setPanelOpen] = useState(false);

  // Qty 0 berarti item keluar dari pilihan, bukan disimpan sebagai angka 0.
  function ubahQty(nama: string, next: number) {
    setQty((prev) => {
      const salinan = { ...prev };
      if (next <= 0) delete salinan[nama];
      else salinan[nama] = next;
      return salinan;
    });
  }

  // Rincian dibaca dari seluruh katalog, bukan dari kategori yang sedang
  // dibuka, supaya urutannya tetap sama saat tab dipindah-pindah.
  const { terpilih, subtotal, pcs } = useMemo(() => {
    const rows: BarisTerpilih[] = [];
    let sub = 0;
    let biji = 0;
    for (const kategori of snackKategori) {
      for (const item of kategori.items) {
        const n = qty[item.nama] ?? 0;
        if (!n) continue;
        sub += n * item.harga;
        biji += n;
        rows.push({ nama: item.nama, qty: n, baris: n * item.harga });
      }
    }
    return { terpilih: rows, subtotal: sub, pcs: biji };
  }, [qty]);

  const adaPilihan = terpilih.length > 0;
  const total = subtotal * jumlahBox;
  const itemKategori = snackKategori[kategoriAktif].items;

  const pesan =
    "Halo Dzanis Catering, saya mau pesan snack box:\n" +
    terpilih.map((r) => `- ${r.nama} ${r.qty}×`).join("\n") +
    `\n\nIsi per box: ${pcs} pcs (${formatRupiah(subtotal)})` +
    `\nJumlah box: ${jumlahBox}` +
    `\nTotal: ${formatRupiah(total)}` +
    "\n\nTanggal acara: \nAlamat antar: ";

  return (
    <div className="flex h-dvh w-full justify-center bg-neutral-300">
      <main
        id="konten"
        className="flex h-full w-full max-w-[480px] flex-col overflow-hidden bg-bg lg:shadow-[var(--shadow-lg)]"
      >
        {/* 1 — header tetap + tab kategori */}
        <div className="flex flex-none flex-col gap-[var(--space-3)] border-b border-divider px-[var(--space-4)] pt-[var(--space-4)] pb-[var(--space-3)]">
          <div className="flex items-center gap-[var(--space-3)]">
            <Link
              href="/"
              aria-label="Kembali ke beranda"
              className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-surface text-[19px] text-text no-underline transition-colors hover:bg-neutral-300"
            >
              <span aria-hidden="true">←</span>
            </Link>
            <div className="min-w-0 flex-1">
              <h1 className="font-heading text-[23px] leading-[1.1]">
                Rakit snack box
              </h1>
              <p className="text-[13px] text-neutral-700">
                {snackRingkasan.totalPilihan} pilihan · harga per biji
              </p>
            </div>
          </div>

          <div className="dz-hide mx-[calc(-1*var(--space-4))] flex gap-[var(--space-2)] overflow-x-auto px-[var(--space-4)] py-[2px]">
            {snackKategori.map((kategori, i) => {
              const aktif = i === kategoriAktif;
              return (
                <button
                  key={kategori.label}
                  type="button"
                  aria-pressed={aktif}
                  onClick={() => setKategoriAktif(i)}
                  className={`min-h-11 flex-none cursor-pointer rounded-full border border-divider px-4 font-heading text-[14px] ${
                    aktif ? "bg-accent text-bg" : "bg-transparent text-text"
                  }`}
                >
                  {kategori.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2 — daftar item kategori aktif */}
        <div className="min-h-0 flex-1 overflow-y-auto px-[var(--space-4)]">
          {itemKategori.map((item) => {
            const n = qty[item.nama] ?? 0;
            return (
              <div
                key={item.nama}
                className="flex min-h-[60px] items-center gap-[var(--space-3)] border-b border-divider py-[var(--space-2)]"
              >
                <div className="min-w-0 flex-1">
                  <div className="text-[16px] leading-[1.3]">{item.nama}</div>
                  <div className="mt-px text-[14px] font-semibold text-accent-700">
                    {formatRupiah(item.harga)}
                  </div>
                </div>
                <div className="flex flex-none items-center gap-[var(--space-1)]">
                  {n > 0 && (
                    <div className="flex items-center gap-[var(--space-1)]">
                      <button
                        type="button"
                        aria-label={`Kurangi ${item.nama}`}
                        onClick={() => ubahQty(item.nama, n - 1)}
                        className="h-11 w-11 cursor-pointer rounded-full border border-accent bg-transparent font-heading text-[19px] leading-none text-accent-700"
                      >
                        −
                      </button>
                      <div className="min-w-[28px] text-center font-heading text-[18px]">
                        {n}
                      </div>
                    </div>
                  )}
                  <button
                    type="button"
                    aria-label={`Tambah ${item.nama}`}
                    onClick={() => ubahQty(item.nama, n + 1)}
                    className="h-11 w-11 cursor-pointer rounded-full border-none bg-accent font-heading text-[19px] leading-none text-bg"
                  >
                    +
                  </button>
                </div>
              </div>
            );
          })}
          <div className="h-[var(--space-4)]" />
        </div>

        {/* 3 — panel ringkasan yang menempel di bawah */}
        <div className="flex-none border-t border-divider bg-surface pb-[env(safe-area-inset-bottom)] shadow-[0_-6px_18px_color-mix(in_srgb,var(--color-neutral-900)_10%,transparent)]">
          <button
            type="button"
            aria-expanded={panelOpen}
            onClick={() => setPanelOpen((o) => !o)}
            className="flex min-h-[56px] w-full cursor-pointer items-center gap-[var(--space-3)] px-[var(--space-4)] py-[var(--space-3)] text-left"
          >
            {/* Isi tombol harus phrasing content, jadi span, bukan div. */}
            <span className="min-w-0 flex-1">
              {adaPilihan ? (
                <span className="block">
                  <span className="block text-[13px] text-neutral-700">
                    {terpilih.length} jenis · {pcs} pcs per box
                  </span>
                  <span className="block font-heading text-[21px] leading-[1.15]">
                    {formatRupiah(subtotal)}{" "}
                    <span className="font-body text-[13px] font-semibold text-neutral-700">
                      per box
                    </span>
                  </span>
                </span>
              ) : (
                <span className="block">
                  <span className="block font-heading text-[18px] leading-[1.2]">
                    Belum ada yang dipilih
                  </span>
                  <span className="mt-px block text-[13px] text-neutral-700">
                    Tekan + pada jajanan yang mau masuk box
                  </span>
                </span>
              )}
            </span>
            <span
              aria-hidden="true"
              className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-bg text-[15px] text-accent-700"
            >
              {panelOpen ? "▾" : "▴"}
            </span>
          </button>

          {panelOpen && (
            <div className="flex flex-col gap-[var(--space-3)] border-t border-divider px-[var(--space-4)] pt-[var(--space-3)] pb-[var(--space-4)]">
              <div className="flex max-h-[190px] flex-col overflow-y-auto">
                {terpilih.map((row) => (
                  <div
                    key={row.nama}
                    className="flex items-center gap-[var(--space-3)] border-b border-divider py-[var(--space-2)]"
                  >
                    <div className="min-w-[30px] font-heading text-[15px] text-accent-700">
                      {row.qty}×
                    </div>
                    <div className="min-w-0 flex-1 text-[15px]">{row.nama}</div>
                    <div className="text-[15px] font-semibold">
                      {formatRupiah(row.baris)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between gap-[var(--space-3)] rounded-full bg-bg py-[var(--space-2)] pr-[var(--space-2)] pl-[var(--space-4)]">
                <div>
                  <div className="text-[15px] font-semibold">Jumlah box</div>
                  <div className="text-[12px] text-neutral-700">
                    minimal {MIN_BOX}
                  </div>
                </div>
                <div className="flex items-center gap-[var(--space-2)]">
                  <button
                    type="button"
                    aria-label="Kurangi jumlah box"
                    onClick={() =>
                      setJumlahBox((b) => Math.max(MIN_BOX, b - STEP_BOX))
                    }
                    className="h-11 w-11 cursor-pointer rounded-full border border-accent bg-transparent font-heading text-[19px] leading-none text-accent-700"
                  >
                    −
                  </button>
                  <div className="min-w-[42px] text-center font-heading text-[20px]">
                    {jumlahBox}
                  </div>
                  <button
                    type="button"
                    aria-label="Tambah jumlah box"
                    onClick={() => setJumlahBox((b) => b + STEP_BOX)}
                    className="h-11 w-11 cursor-pointer rounded-full border-none bg-accent font-heading text-[19px] leading-none text-bg"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex items-baseline justify-between gap-[var(--space-3)]">
                <div className="text-[15px] text-neutral-800">
                  Total keseluruhan
                </div>
                <div className="font-heading text-[30px] leading-none text-accent-700">
                  {formatRupiah(total)}
                </div>
              </div>

              <a
                className="btn btn-primary btn-block mt-0 min-h-[52px] text-[15px] tracking-[0.04em] uppercase"
                href={waLink(pesan)}
                aria-label={`Kirim pesanan ke WhatsApp ${company.name}`}
              >
                Kirim pesanan ke WhatsApp
              </a>
              <div className="text-center text-[12px] leading-[1.5] text-neutral-700">
                Harga dapat berubah, kami konfirmasi ulang lewat WhatsApp.
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
