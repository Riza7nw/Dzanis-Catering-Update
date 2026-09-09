"use client";

import { useEffect, useRef, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  /** Elemen pembungkus yang dirender. Default "div". */
  as?: "div" | "section";
  className?: string;
};

/**
 * Membungkus konten supaya muncul lembut saat pertama masuk viewport.
 *
 * Komponen ini client, tapi anak-anaknya tidak ikut jadi client: server
 * component yang dilewatkan sebagai `children` tidak masuk ke module graph
 * client, ia dirender di server lalu diserahkan sebagai hasil jadi
 * (docs Next.js 16.3.1, 01-getting-started/05-server-and-client-components.md
 * baris 178). Jadi seluruh seksi homepage tetap server component.
 *
 * Penyembunyian awal dilakukan CSS, bukan di sini — lihat globals.css. Kalau
 * JavaScript tidak pernah jalan, atribut data-js tidak ada dan konten tampil
 * normal.
 */
export function Reveal({ children, as = "div", className }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Tanda bahwa bundle klien benar-benar terhidrasi. Skrip inline di
    // layout.tsx memasang [data-js] tanpa syarat, jadi bila bundle gagal
    // dimuat (jaringan putus, parse error) aturan penyembunyi ikut aktif
    // sementara tidak ada satu pun Reveal yang bisa membatalkannya —
    // seluruh isi di bawah hero hilang permanen. Penanda ini yang dibaca
    // penjaga waktu di layout.tsx untuk mencabut [data-js].
    document.documentElement.dataset.hidrasi = "1";

    // Browser tanpa IntersectionObserver: langsung tampilkan, jangan sampai
    // konten tertinggal tersembunyi.
    if (typeof IntersectionObserver === "undefined") {
      el.dataset.terlihat = "true";
      return;
    }

    const pengamat = new IntersectionObserver(
      (entri) => {
        for (const e of entri) {
          if (!e.isIntersecting) continue;
          (e.target as HTMLElement).dataset.terlihat = "true";
          pengamat.unobserve(e.target); // sekali jalan
        }
      },
      // Mulai sedikit sebelum seksi benar-benar di tengah layar.
      { threshold: 0, rootMargin: "0px 0px -12% 0px" },
    );

    pengamat.observe(el);
    return () => pengamat.disconnect();
  }, []);

  // `as` hanya boleh "div" atau "section"; keduanya HTMLElement, jadi ref
  // yang sama valid saat runtime. Cast dipakai supaya TS tidak perlu union ref.
  const Tag = as as "div";

  return (
    <Tag ref={ref} data-reveal className={className}>
      {children}
    </Tag>
  );
}
