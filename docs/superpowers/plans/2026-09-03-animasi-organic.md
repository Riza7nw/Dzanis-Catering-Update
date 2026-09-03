# Animasi Layout "Organic" — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Memberi animasi masuk yang kalem pada seluruh seksi homepage dan memperhalus akordeon/hover, tanpa menambah pustaka animasi dan tanpa mengubah rute mana pun dari statis.

**Architecture:** Satu komponen client mungil `<Reveal>` memakai `IntersectionObserver` membungkus tiap seksi. Karena server component yang dilewatkan sebagai `children` tidak masuk ke module graph client, seluruh seksi tetap dirender di server. Sisanya murni CSS: token gerak, transisi, `@keyframes` hero, dan trik `grid-template-rows: 0fr → 1fr` untuk akordeon.

**Tech Stack:** Next.js 16.3.1 (App Router, Turbopack) · React 19.2.8 · Tailwind CSS v4.3.3 · TypeScript strict. Tidak ada pustaka animasi.

**Spec:** `docs/superpowers/specs/2026-09-03-animasi-organic-design.md`

## Global Constraints

Berlaku untuk **setiap** task. Nilai disalin persis dari spec.

- **Keadaan diam adalah "terlihat".** Aturan yang menyembunyikan elemen hanya boleh hidup di dalam `@media (prefers-reduced-motion: no-preference)` **dan** di bawah selektor `[data-js]`. Jika JS gagal atau animasi dimatikan, semua konten harus tampil.
- **Hanya menganimasikan `opacity`, `translate`, `scale`, `rotate`.** Tidak pernah `width`, `height`, `top`, `margin`, `padding`.
- **Tidak ada listener `scroll`.** Deteksi posisi hanya lewat `IntersectionObserver`.
- **Reveal sekali jalan.** `unobserve` setelah terpicu.
- **Tidak ada pustaka animasi baru.** Tidak menambah dependensi apa pun ke `package.json`.
- **Halaman `/rakit-snack-box` tidak boleh berubah sama sekali.**
- **Next.js 16:** prop `priority` pada `next/image` sudah deprecated (pakai `preload`); jangan pernah menyetel prop `quality`.
- **Token gerak** (didefinisikan di Task 1, dipakai semua task sesudahnya):
  `--durasi-cepat: 180ms` · `--durasi-sedang: 260ms` · `--durasi-lambat: 420ms` · `--jeda-stagger: 60ms` · `--jarak-naik: 16px` · `--easing-keluar: cubic-bezier(0.22, 1, 0.36, 1)`
- **Komentar kode berbahasa Indonesia**, mengikuti seluruh berkas di `src/`.
- **Catatan lingkungan:** pada sesi penyusunan rencana ini `git` tidak dapat dijalankan (terpasang di drive `D:` yang tidak ter-mount). Langkah commit tetap ditulis karena benar; jalankan saat `git` tersedia. Jika `git` belum ada, selesaikan task lalu lanjutkan — jangan memblokir pekerjaan.

### Cara memverifikasi (baca sekali sebelum mulai)

Proyek ini **tidak punya test runner** (`package.json` hanya berisi `dev`, `build`, `start`, `lint`). Menambahkannya di luar cakupan yang disetujui, dan unit test tidak bisa membuktikan hal yang penting di sini — `transition-delay`, `grid-template-rows`, atau apakah konten terlihat saat animasi dimatikan.

Karena itu setiap task memakai siklus **verifikasi nyata** sebagai ganti siklus merah-hijau:

1. Perintah wajib lulus: `npx tsc --noEmit`, `npm run lint`, `npm run build`.
2. Cuplikan DevTools yang bisa disalin-tempel ke Console, dengan hasil yang diharapkan tertulis.

Cuplikan Console dijalankan pada `http://localhost:3000` (`npm run dev`). Untuk mengemulasi `prefers-reduced-motion`: DevTools → Command Menu (Ctrl+Shift+P) → "Show Rendering" → *Emulate CSS media feature prefers-reduced-motion* → `reduce`. Untuk mematikan JavaScript: Command Menu → "Disable JavaScript".

---

## File Structure

| Berkas | Tanggung jawab | Task |
|---|---|---|
| `src/app/globals.css` | Token gerak, aturan reveal, akordeon, keyframes hero, hover | 1, 2, 4, 5, 6, 8 |
| `src/app/layout.tsx` | Penanda `[data-js]` sebelum paint | 1 |
| `src/components/organic/Reveal.tsx` | **Baru.** Pembungkus client `IntersectionObserver` | 2 |
| `src/app/page.tsx` | Membungkus seksi dengan `<Reveal>`, sentinel navbar | 2, 3, 9 |
| `src/components/organic/SnackBox.tsx` | `--i` untuk 6 foto + 3 angka | 4 |
| `src/components/organic/Layanan.tsx` | `<Reveal>` internal pada grid kartu | 4 |
| `src/components/organic/CaraPesan.tsx` | `--i` pada daftar langkah | 4 |
| `src/components/organic/Angka.tsx` | `--i` pada baris angka | 4 |
| `src/components/organic/Paket.tsx` | `<Reveal>` pada baris harga + akordeon | 4, 7 |
| `src/components/organic/Hero.tsx` | Kelas animasi muat | 5 |
| `src/components/organic/Faq.tsx` | Akordeon `grid-rows` + `inert` | 6 |
| `src/components/organic/Navbar.tsx` | Bayangan saat digulir (jadi client) | 9 |

---

## Task 1: Token gerak & penanda `[data-js]`

Fondasi. Belum ada perubahan visual apa pun — itu memang yang diharapkan.

**Files:**
- Modify: `src/app/globals.css` (blok `:root`, setelah `--shadow-lg`)
- Modify: `src/app/layout.tsx` (di dalam `<html>`, sebelum `<body>`)

**Interfaces:**
- Consumes: —
- Produces: enam custom property gerak (`--durasi-cepat`, `--durasi-sedang`, `--durasi-lambat`, `--jeda-stagger`, `--jarak-naik`, `--easing-keluar`) dan atribut `data-js="1"` pada `<html>`. Semua task berikutnya bergantung pada keduanya.

- [ ] **Step 1: Tambahkan token gerak**

Di `src/app/globals.css`, tepat setelah baris `--shadow-lg: ...;` dan sebelum `}` penutup blok `:root`:

```css

  /* ── Gerak ──────────────────────────────────────────────────────────
     Satu easing untuk seluruh situs; konsistensi lebih penting daripada
     variasi pada sistem sekalem ini. */
  --durasi-cepat: 180ms; /* hover, pergantian tanda +/− */
  --durasi-sedang: 260ms; /* buka-tutup akordeon */
  --durasi-lambat: 420ms; /* animasi masuk seksi */
  --jeda-stagger: 60ms; /* jarak antar anak dalam satu seksi */
  --jarak-naik: 16px;
  --easing-keluar: cubic-bezier(0.22, 1, 0.36, 1);
```

- [ ] **Step 2: Tambahkan penanda JavaScript siap**

Di `src/app/layout.tsx`, sisipkan tepat sebelum `<body ...>`:

```tsx
      <head>
        {/*
          Menandai dokumen sebelum paint pertama. Seluruh aturan yang
          menyembunyikan elemen untuk animasi masuk diberi awalan [data-js],
          jadi tanpa JavaScript atribut ini tidak pernah ada dan konten
          tampil apa adanya — bukan tersangkut transparan. Dijalankan
          inline supaya tidak ada kedipan tampil → hilang → muncul lagi.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `document.documentElement.dataset.js="1"`,
          }}
        />
      </head>
```

- [ ] **Step 3: Verifikasi perintah build**

```bash
npx tsc --noEmit
```
Diharapkan: tanpa keluaran.

```bash
npm run lint
```
Diharapkan: tanpa keluaran.

```bash
npm run build
```
Diharapkan: `✓ Compiled successfully`, dan kedua rute `/` serta `/rakit-snack-box` tetap bertanda `○ (Static)`.

- [ ] **Step 4: Verifikasi di browser**

Jalankan `npm run dev`, buka `http://localhost:3000`, tempel di Console:

```js
const s = getComputedStyle(document.documentElement);
({
  js: document.documentElement.dataset.js,
  lambat: s.getPropertyValue('--durasi-lambat').trim(),
  stagger: s.getPropertyValue('--jeda-stagger').trim(),
  naik: s.getPropertyValue('--jarak-naik').trim(),
  easing: s.getPropertyValue('--easing-keluar').trim(),
})
```

Diharapkan:
```
{ js: "1", lambat: ".42s", stagger: "60ms", naik: "16px", easing: "cubic-bezier(.22, 1, .36, 1)" }
```

Perhatikan bentuk nilainya: Lightning CSS (minifier bawaan Tailwind v4)
menormalkan `420ms` menjadi `.42s` dan membuang nol di depan pada
`cubic-bezier`. Nilainya identik dengan yang ditulis di Step 1 — yang
diperiksa adalah kesamaan nilai, bukan kesamaan penulisan. `60ms` tetap
`60ms` karena sudah bentuk terpendeknya.

- [ ] **Step 5: Commit**

```bash
git add src/app/globals.css src/app/layout.tsx
git commit -m "feat(animasi): tambah token gerak dan penanda data-js"
```

---

## Task 2: Komponen `<Reveal>` dan pembuktiannya pada Footer

Membuat mekanismenya, lalu memasangnya di **satu** seksi paling tidak berisiko untuk membuktikan tiga jalur sekaligus: animasi jalan, reduced-motion aman, tanpa-JS aman.

**Files:**
- Create: `src/components/organic/Reveal.tsx`
- Modify: `src/app/globals.css` (setelah blok `.washed`)
- Modify: `src/app/page.tsx`

**Interfaces:**
- Consumes: token dari Task 1, atribut `[data-js]` dari Task 1.
- Produces: `export function Reveal({ children, as, className }: { children: React.ReactNode; as?: "div" | "section"; className?: string })`. Merender elemen sesuai `as` (default `"div"`) dengan atribut `data-reveal`, dan menyetel `data-terlihat="true"` saat pertama masuk viewport. Task 3, 4, dan 9 memakainya.

- [ ] **Step 1: Buat komponen**

Buat `src/components/organic/Reveal.tsx`:

```tsx
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
```

- [ ] **Step 2: Tambahkan aturan CSS reveal**

Di `src/app/globals.css`, tepat setelah blok `.washed { ... }`:

```css
/* ── Animasi masuk ────────────────────────────────────────────────────
   Anak langsung dari [data-reveal] naik dan memudar masuk, bergiliran.
   Keadaan diam (di luar media query) sengaja "terlihat": penyembunyian
   hanya berlaku bila JS sudah menandai dokumen DAN pengguna tidak minta
   animasi dikurangi. Tanpa salah satunya, konten tampil apa adanya. */
[data-reveal] > * {
  transition:
    opacity var(--durasi-lambat) var(--easing-keluar),
    translate var(--durasi-lambat) var(--easing-keluar);
  transition-delay: calc(var(--i, 0) * var(--jeda-stagger));
}

@media (prefers-reduced-motion: no-preference) {
  [data-js] [data-reveal]:not([data-terlihat]) > * {
    opacity: 0;
    translate: 0 var(--jarak-naik);
  }
}

/* Giliran bawaan untuk seksi yang tidak menyetel --i sendiri. */
[data-reveal] > *:nth-child(2) { --i: 1; }
[data-reveal] > *:nth-child(3) { --i: 2; }
[data-reveal] > *:nth-child(4) { --i: 3; }
[data-reveal] > *:nth-child(5) { --i: 4; }
[data-reveal] > *:nth-child(6) { --i: 5; }
[data-reveal] > *:nth-child(n + 7) { --i: 6; }
```

- [ ] **Step 3: Pasang pada Footer saja**

Di `src/app/page.tsx`, tambahkan impor:

```tsx
import { Reveal } from "@/components/organic/Reveal";
```

lalu bungkus footer:

```tsx
      <Reveal>
        <Footer />
      </Reveal>
```

- [ ] **Step 4: Verifikasi perintah build**

```bash
npx tsc --noEmit
```
Diharapkan: tanpa keluaran.

```bash
npm run lint
```
Diharapkan: tanpa keluaran.

- [ ] **Step 5: Verifikasi animasi jalan**

`npm run dev`, buka `http://localhost:3000`, tempel di Console **tanpa menggulir dulu**:

```js
const w = document.querySelector('[data-reveal]');
({ adaWrapper: !!w, terlihatSebelumDigulir: w.dataset.terlihat ?? '(belum)' })
```
Diharapkan: `{ adaWrapper: true, terlihatSebelumDigulir: "(belum)" }` — footer masih di bawah layar.

Gulir ke paling bawah, lalu tempel lagi:
```js
document.querySelector('[data-reveal]').dataset.terlihat
```
Diharapkan: `"true"`.

- [ ] **Step 6: Verifikasi jalur reduced-motion**

Aktifkan emulasi `prefers-reduced-motion: reduce` (lihat "Cara memverifikasi"), muat ulang halaman, dan **tanpa menggulir** tempel:

```js
const anak = document.querySelector('[data-reveal]').children;
[...anak].map(el => getComputedStyle(el).opacity)
```
Diharapkan: setiap nilai `"1"`. Kalau ada yang `"0"`, aturan penyembunyian bocor keluar dari media query — perbaiki sebelum lanjut.

- [ ] **Step 7: Verifikasi jalur tanpa JavaScript**

Matikan JavaScript lewat Command Menu, muat ulang, lalu periksa secara visual bahwa footer terlihat penuh. (Console tidak bisa dipakai menilai di sini karena JS mati — cukup lihat halamannya.)

Diharapkan: footer tampil normal, tidak transparan.

- [ ] **Step 8: Commit**

```bash
git add src/components/organic/Reveal.tsx src/app/globals.css src/app/page.tsx
git commit -m "feat(animasi): komponen Reveal + animasi masuk pada footer"
```

---

## Task 3: Pasang `<Reveal>` pada seluruh seksi homepage

**Files:**
- Modify: `src/app/page.tsx`

**Interfaces:**
- Consumes: `Reveal` dari Task 2.
- Produces: setiap seksi homepage terbungkus `[data-reveal]`.

- [ ] **Step 1: Bungkus seksi yang tersisa**

Di `src/app/page.tsx`, bungkus setiap seksi **kecuali `Hero`** (hero ditangani Task 5 tanpa JS) dan **kecuali `Navbar`**. Isi `<main>` menjadi:

```tsx
      <main id="konten">
        <Hero />
        <Reveal>
          <Paket />
        </Reveal>
        <Reveal>
          <SnackBox />
        </Reveal>
        <Reveal>
          <CtaBesar />
        </Reveal>
        <Reveal>
          <Layanan />
        </Reveal>
        <Reveal>
          <CaraPesan />
        </Reveal>
        <Reveal>
          <Angka />
        </Reveal>
        <Reveal>
          <Faq />
        </Reveal>
      </main>
```

Catatan penting untuk pelaksana: tiap `<Reveal>` di sini hanya punya **satu** anak langsung (elemen `<section>` milik komponennya), jadi seksinya memudar masuk sebagai satu kesatuan tanpa giliran. Stagger di dalam seksi ditangani Task 4. Ini disengaja: `<Reveal>` membuat giliran untuk anak langsungnya saja.

- [ ] **Step 2: Verifikasi perintah build**

```bash
npx tsc --noEmit
```
Diharapkan: tanpa keluaran.

```bash
npm run build
```
Diharapkan: `✓ Compiled successfully`; `/` dan `/rakit-snack-box` tetap `○ (Static)`.

- [ ] **Step 3: Verifikasi jumlah dan kelengkapan**

`npm run dev`, buka `http://localhost:3000`, tempel:

```js
({
  jumlahReveal: document.querySelectorAll('[data-reveal]').length,
  seksiDalamMain: document.querySelectorAll('main section').length,
})
```
Diharapkan: `jumlahReveal` bernilai `8` (tujuh seksi + footer), `seksiDalamMain` bernilai `8` (termasuk hero yang tidak dibungkus).

- [ ] **Step 4: Verifikasi tidak ada pergeseran layout**

Gulir perlahan dari atas ke bawah dan amati: tidak boleh ada seksi yang "mendorong" konten lain saat muncul. Jarak naik memakai `translate`, yang tidak memesan ulang ruang.

Untuk memastikan secara angka, tempel sebelum menggulir dan sesudah menggulir penuh:
```js
document.documentElement.scrollHeight
```
Diharapkan: **nilainya sama** pada kedua pengukuran.

- [ ] **Step 5: Verifikasi ulang reduced-motion pada seluruh halaman**

Aktifkan emulasi `reduce`, muat ulang, tempel:

```js
const semua = [...document.querySelectorAll('[data-reveal] > *')];
({ total: semua.length, adaYangTersembunyi: semua.filter(el => getComputedStyle(el).opacity === '0').length })
```
Diharapkan: `adaYangTersembunyi: 0`.

- [ ] **Step 6: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat(animasi): animasi masuk untuk seluruh seksi homepage"
```

---

## Task 4: Giliran (stagger) di dalam seksi

Membuat kartu, foto, dan angka muncul bergiliran alih-alih serentak.

Ada dua cara memberi giliran, dan pelaksana harus memilih yang tepat per kasus:

- **Anak langsung** — cukup bungkus wadahnya dengan `<Reveal>`; aturan `nth-child` dari Task 2 otomatis memberi giliran. Dipakai untuk grid `<div>` biasa.
- **Cucu, lewat `--i` eksplisit** — dipakai kalau `<Reveal>` tidak boleh menyisipkan `<div>` di antara induk dan anaknya. Contohnya `<ol>`: `<div>` bukan anak yang sah bagi `<ol>`, jadi `<Reveal>` harus membungkus `<ol>` dari luar, yang membuat `<li>` menjadi cucu dan tidak tersentuh aturan `nth-child`.

**Files:**
- Modify: `src/components/organic/SnackBox.tsx`
- Modify: `src/components/organic/Layanan.tsx`
- Modify: `src/components/organic/CaraPesan.tsx`
- Modify: `src/components/organic/Angka.tsx`
- Modify: `src/components/organic/Paket.tsx`
- Modify: `src/app/globals.css`

**Interfaces:**
- Consumes: `Reveal` dari Task 2, aturan `--i` dari Task 2.
- Produces: kelas `.stagger-rapat`; aturan giliran untuk cucu ber-`--i`.

- [ ] **Step 1: Tambahkan CSS pendukung**

Di `src/app/globals.css`, setelah blok aturan `nth-child` dari Task 2:

```css
/* Enam item beruntun terasa lamban pada 60ms; grid foto snack box memakai
   giliran yang lebih rapat. */
.stagger-rapat {
  --jeda-stagger: 40ms;
}

/* Beberapa seksi memberi giliran pada cucu, bukan anak langsung — misalnya
   <li> di dalam <ol> (karena <div> tidak sah sebagai anak <ol>), atau strip
   angka yang menyelipkan garis pemisah di antara blok isinya. */
[data-reveal] [style*="--i"] {
  transition:
    opacity var(--durasi-lambat) var(--easing-keluar),
    translate var(--durasi-lambat) var(--easing-keluar);
  transition-delay: calc(var(--i, 0) * var(--jeda-stagger));
}

@media (prefers-reduced-motion: no-preference) {
  [data-js] [data-reveal]:not([data-terlihat]) [style*="--i"] {
    opacity: 0;
    translate: 0 var(--jarak-naik);
  }
}

/* Seksi yang mengatur gilirannya sendiri lewat --i mematikan aturan
   anak-langsung, supaya isinya tidak memudar dua kali (sekali oleh
   pembungkus, sekali oleh dirinya sendiri). Kelasnya menambah kekhususan
   sehingga menang atas aturan penyembunyian di atas. */
@media (prefers-reduced-motion: no-preference) {
  [data-js] [data-reveal].giliran-manual:not([data-terlihat]) > * {
    opacity: 1;
    translate: none;
  }
}

/* Lingkaran nomor pada "Cara pesan" ikut membesar dari 0.85 (spec §8).
   --i diwarisi dari <li> induknya, jadi gilirannya otomatis sama. */
.lingkaran-langkah {
  transition: scale var(--durasi-lambat) var(--easing-keluar);
  transition-delay: calc(var(--i, 0) * var(--jeda-stagger));
}

@media (prefers-reduced-motion: no-preference) {
  [data-js] [data-reveal]:not([data-terlihat]) .lingkaran-langkah {
    scale: 0.85;
  }
}
```

- [ ] **Step 2: SnackBox — grid foto dan baris angka**

Di `src/components/organic/SnackBox.tsx`, tambahkan impor:

```tsx
import { Reveal } from "@/components/organic/Reveal";
```

Bungkus **elemen grid foto** (grid tiga kolom berisi enam `<Image>`) dengan:

```tsx
<Reveal className="stagger-rapat">
  {/* elemen grid foto yang sudah ada, tidak diubah isinya */}
</Reveal>
```

Bungkus juga **wadah tiga angka besar** (51 / 6 / 500) dengan `<Reveal>` biasa (tanpa `className`).

Pelaksana: jangan mengubah kelas, `sizes`, atau `alt` gambar mana pun. `<Reveal>` hanya menyisipkan satu `<div>` pembungkus.

- [ ] **Step 3: Layanan — grid tiga kartu**

Di `src/components/organic/Layanan.tsx`, tambahkan impor `Reveal` yang sama, lalu bungkus elemen grid yang memuat tiga `.card`:

```tsx
<Reveal>
  {/* grid tiga kartu yang sudah ada */}
</Reveal>
```

- [ ] **Step 4: CaraPesan — daftar empat langkah**

Ini kasus "cucu". Bungkus `<ol>` dari luar dengan `<Reveal className="giliran-manual">`, lalu beri `--i` pada tiap `<li>`:

```tsx
<Reveal className="giliran-manual">
  <ol className="…kelas yang sudah ada…">
    {langkah.map((l, i) => (
      <li
        key={l.judul}
        style={{ "--i": i } as React.CSSProperties}
        className="…kelas yang sudah ada…"
      >
        {/* isi langkah yang sudah ada */}
      </li>
    ))}
  </ol>
</Reveal>
```

Tambahkan juga kelas `lingkaran-langkah` pada elemen lingkaran bernomor di dalam tiap `<li>` (lingkaran `bg-accent-2-300` berisi angka), supaya ia ikut membesar dari 0.85 sesuai spec §8. Cukup menambah satu kelas di depan daftar kelas yang sudah ada; ukuran dan warnanya tidak diubah.

- [ ] **Step 5: Angka — tiga baris angka**

`Angka.tsx` menyelipkan `<div>` garis pemisah di antara blok angka (lihat `{i > 0 && …}` di sekitar baris 25-30), sehingga anak langsung wadahnya berpola blok–garis–blok–garis–blok. Kalau memakai `nth-child`, garis pemisah ikut terhitung dan gilirannya meleset. Jadi seksi ini **wajib** memakai `--i` eksplisit.

Bungkus panel (elemen `rounded-[32px] bg-accent-2-200` di sekitar baris 20) dengan `<Reveal className="giliran-manual">`, lalu beri `--i` pada blok isi — bukan pada garis pemisah:

```tsx
              <div
                style={{ "--i": i } as React.CSSProperties}
                className="flex items-baseline gap-[var(--space-3)] lg:flex-1 lg:flex-col lg:items-start lg:gap-[var(--space-2)]"
              >
```

Garis pemisah dibiarkan tanpa `--i` supaya ia muncul bersama panel, tidak ikut bergiliran.

- [ ] **Step 6: Paket — tiga baris harga versi desktop**

Di `src/components/organic/Paket.tsx`, bungkus wadah tiga baris harga (kolom kanan band olive) dengan `<Reveal>`. **Jangan** membungkus carousel kartu versi mobile: kartu itu sudah bergerak saat digeser, dan menambah animasi masuk di dalam wadah yang bisa digulir horizontal berisiko memicu ulang saat digeser.

- [ ] **Step 7: Verifikasi perintah build**

```bash
npx tsc --noEmit
```
Diharapkan: tanpa keluaran. (Jika muncul galat pada `style={{ "--i": i }}`, pastikan cast `as React.CSSProperties` sudah ada — TypeScript menolak custom property tanpa itu.)

```bash
npm run lint
```
Diharapkan: tanpa keluaran.

- [ ] **Step 8: Verifikasi giliran benar-benar berbeda**

`npm run dev`, gulir ke seksi Snack Box, lalu tempel:

```js
const g = document.querySelector('.stagger-rapat');
[...g.children[0].children].map(el => getComputedStyle(el).transitionDelay)
```
Diharapkan: nilai menaik seperti `["0s", "0.04s", "0.08s", "0.12s", "0.16s", "0.2s"]`.

Lalu untuk daftar langkah:
```js
[...document.querySelectorAll('#cara li')].map(el => getComputedStyle(el).transitionDelay)
```
Diharapkan: `["0s", "0.06s", "0.12s", "0.18s"]`.

- [ ] **Step 9: Verifikasi ulang reduced-motion**

Aktifkan emulasi `reduce`, muat ulang, tempel:

```js
const semua = [...document.querySelectorAll('[data-reveal] > *, [data-reveal] [style*="--i"]')];
({ total: semua.length, tersembunyi: semua.filter(el => getComputedStyle(el).opacity === '0').length })
```
Diharapkan: `tersembunyi: 0`.

- [ ] **Step 10: Commit**

```bash
git add src/components/organic/SnackBox.tsx src/components/organic/Layanan.tsx src/components/organic/CaraPesan.tsx src/components/organic/Angka.tsx src/components/organic/Paket.tsx src/app/globals.css
git commit -m "feat(animasi): giliran masuk untuk kartu, foto, dan angka"
```

---

## Task 5: Animasi muat pada Hero — CSS murni

Hero ada di paruh atas layar, jadi tidak boleh menunggu JavaScript. Kalau ia memakai `<Reveal>`, pada koneksi lambat hero akan diam tersembunyi sampai hidrasi selesai lalu melompat masuk. Karena itu hero memakai `@keyframes` yang jalan sejak paint pertama, dan `Hero.tsx` tetap server component tanpa JS sama sekali.

**Files:**
- Modify: `src/components/organic/Hero.tsx:10`
- Modify: `src/app/globals.css`

**Interfaces:**
- Consumes: token dari Task 1.
- Produces: kelas `.hero-masuk`.

- [ ] **Step 1: Tambahkan keyframes dan kelas**

Di `src/app/globals.css`, setelah aturan reveal:

```css
/* ── Hero ─────────────────────────────────────────────────────────────
   Hero di paruh atas layar, jadi tidak memakai IntersectionObserver:
   menunggu hidrasi akan membuatnya diam tersembunyi lalu melompat masuk.
   `both` memastikan elemen berhenti pada keadaan akhir yang terlihat, dan
   seluruh blok hanya hidup saat pengguna tidak meminta animasi dikurangi. */
@keyframes hero-naik {
  from {
    opacity: 0;
    translate: 0 var(--jarak-naik);
  }
}

@media (prefers-reduced-motion: no-preference) {
  .hero-masuk > * {
    animation: hero-naik var(--durasi-lambat) var(--easing-keluar) both;
    animation-delay: calc(var(--i, 0) * var(--jeda-stagger));
  }
  .hero-masuk > *:nth-child(2) { --i: 1; }
  .hero-masuk > *:nth-child(3) { --i: 2; }
  .hero-masuk > *:nth-child(4) { --i: 3; }

  /* Lingkaran sage di balik foto membesar dari 0.9 (spec §8). Hanya `scale`,
     tanpa opacity — induknya sudah memudar masuk, dan menumpuk dua fade
     membuat lingkaran terlihat berkedip. */
  .lingkaran-sage {
    animation: lingkaran-membesar var(--durasi-lambat) var(--easing-keluar) both;
    animation-delay: calc(2 * var(--jeda-stagger));
  }
}

@keyframes lingkaran-membesar {
  from {
    scale: 0.9;
  }
}
```

- [ ] **Step 2: Pasang kelas pada Hero**

Di `src/components/organic/Hero.tsx` baris 10, tambahkan `hero-masuk` di awal daftar kelas `<section>`:

```tsx
    <section className="hero-masuk mx-auto flex max-w-[1280px] flex-col gap-[var(--space-4)] px-[var(--space-4)] pt-[var(--space-3)] pb-[var(--space-8)] lg:gap-[44px] lg:px-14 lg:pt-16 lg:pb-[72px]">
```

Lalu pada `<span aria-hidden="true">` lingkaran sage di baris 42-45, tambahkan kelas `lingkaran-sage` di depan daftar kelas yang sudah ada:

```tsx
        <span
          aria-hidden="true"
          className="lingkaran-sage absolute top-[-22px] right-[-14px] size-24 rounded-full bg-accent-2-300 lg:hidden"
        />
```

Catatan untuk peninjau: `<section>` ini punya empat anak langsung — (1) blok judul + paragraf, (2) dua tombol khusus mobile, (3) blok foto, (4) baris tag. Jadi judul dan paragraf naik **bersama sebagai satu kelompok**, bukan berurutan seperti bunyi spec §8. Ini penyederhanaan sadar: keduanya berdampingan pada tampilan desktop sehingga memisahkannya justru terasa janggal. Kalau tetap diinginkan terpisah, beri `--i` eksplisit pada `<h1>` dan `<p>` serta tambahkan `.hero-masuk` pada pembungkusnya di baris 12.

- [ ] **Step 3: Verifikasi perintah build**

```bash
npx tsc --noEmit
```
Diharapkan: tanpa keluaran.

```bash
npm run build
```
Diharapkan: `✓ Compiled successfully`.

- [ ] **Step 4: Verifikasi hero tidak bergantung pada JavaScript**

Matikan JavaScript lewat Command Menu, muat ulang `http://localhost:3000`.

Diharapkan: hero tetap **beranimasi masuk** (judul, tombol, foto, tag berurutan) meski JS mati — inilah bedanya dengan seksi lain. Tidak ada elemen yang tersangkut transparan.

- [ ] **Step 5: Verifikasi reduced-motion**

Nyalakan kembali JavaScript, aktifkan emulasi `reduce`, muat ulang, tempel:

```js
const s = document.querySelector('.hero-masuk');
[...s.children].map(el => ({
  animasi: getComputedStyle(el).animationName,
  opacity: getComputedStyle(el).opacity,
}))
```
Diharapkan: setiap `animasi` bernilai `"none"` dan setiap `opacity` bernilai `"1"`.

- [ ] **Step 6: Commit**

```bash
git add src/components/organic/Hero.tsx src/app/globals.css
git commit -m "feat(animasi): animasi muat hero tanpa JavaScript"
```

---

## Task 6: Akordeon FAQ

`Faq.tsx` sudah menyimpan panel di DOM dan menyembunyikannya dengan atribut `hidden`. Atribut itu berarti `display: none`, yang tidak bisa ditransisikan. Diganti wadah grid yang tingginya beranimasi, dan panel tertutup diberi `inert`.

**Files:**
- Modify: `src/components/organic/Faq.tsx` (blok panel yang memakai `hidden={!buka}`, dan `<span aria-hidden="true">` penanda +/−)
- Modify: `src/app/globals.css`

**Interfaces:**
- Consumes: token dari Task 1.
- Produces: kelas `.akordeon-panel` dan `.tanda-akordeon`, keduanya dipakai lagi di Task 7.

- [ ] **Step 1: Tambahkan CSS akordeon**

Di `src/app/globals.css`, setelah blok hero:

```css
/* ── Akordeon ─────────────────────────────────────────────────────────
   Menganimasikan tinggi tanpa mengukur lewat JavaScript dan tanpa
   menyentuh properti layout: grid dengan satu baris yang bergerak dari
   0fr ke 1fr. Anaknya wajib overflow:hidden supaya isinya terpotong rapi
   saat menutup. */
.akordeon-panel {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows var(--durasi-sedang) var(--easing-keluar);
}

.akordeon-panel[data-buka="true"] {
  grid-template-rows: 1fr;
}

.akordeon-panel > * {
  overflow: hidden;
}

/* Tanda +/− tetap memakai karakter yang sama seperti artboard; hanya
   pergantiannya yang dihaluskan supaya tidak mengedip. */
.tanda-akordeon {
  transition: rotate var(--durasi-cepat) var(--easing-keluar);
}

.tanda-akordeon[data-buka="true"] {
  rotate: 180deg;
}
```

- [ ] **Step 2: Ubah panel FAQ**

Di `src/components/organic/Faq.tsx`, ganti blok panel (yang saat ini memakai `hidden={!buka}`) menjadi:

```tsx
                <div className="akordeon-panel" data-buka={buka ? "true" : "false"}>
                  <div
                    id={idPanel}
                    inert={!buka}
                    className="max-w-[320px] pb-[var(--space-3)] text-[15px] leading-[1.6] text-neutral-800 lg:max-w-[560px] lg:pb-[18px] lg:text-[16px] lg:leading-[1.65]"
                  >
                    {item.answer}
                  </div>
                </div>
```

Perubahannya: `hidden={!buka}` diganti `inert={!buka}`, dan panel dibungkus wadah `.akordeon-panel`. `id={idPanel}` tetap pada elemen dalam supaya `aria-controls` yang sudah ada tetap menunjuk sasaran yang benar.

- [ ] **Step 3: Haluskan tanda +/−**

Pada `<span aria-hidden="true">` yang menampilkan `{buka ? "−" : "+"}`, tambahkan kelas `tanda-akordeon` di depan daftar kelas yang sudah ada dan atribut `data-buka`:

```tsx
                  <span
                    aria-hidden="true"
                    data-buka={buka ? "true" : "false"}
                    className="tanda-akordeon w-5 flex-none text-center font-heading text-[20px] text-accent-700 lg:w-[22px] lg:text-[22px]"
                  >
                    {buka ? "−" : "+"}
                  </span>
```

Isi teksnya **tidak diubah** — karakter `+` dan `−` tetap sesuai artboard.

- [ ] **Step 4: Verifikasi perintah build**

```bash
npx tsc --noEmit
```
Diharapkan: tanpa keluaran. (React 19 menerima `inert` sebagai prop boolean; kalau TypeScript mengeluh, periksa `@types/react` sudah versi untuk React 19.)

```bash
npm run lint
```
Diharapkan: tanpa keluaran.

- [ ] **Step 5: Verifikasi tinggi benar-benar beranimasi**

`npm run dev`, gulir ke seksi FAQ, klik pertanyaan pertama, lalu segera tempel:

```js
const p = document.querySelector('.akordeon-panel');
({ buka: p.dataset.buka, baris: getComputedStyle(p).gridTemplateRows })
```
Diharapkan saat terbuka: `buka: "true"` dan `baris` berupa nilai piksel (mis. `"72px"`), bukan `"0px"`.

- [ ] **Step 6: Verifikasi aksesibilitas**

Dengan semua panel tertutup, tempel:

```js
const tertutup = [...document.querySelectorAll('.akordeon-panel[data-buka="false"] > *')];
({ jumlah: tertutup.length, semuaInert: tertutup.every(el => el.inert === true) })
```
Diharapkan: `semuaInert: true`.

Lalu uji keyboard: Tab ke pertanyaan pertama, tekan Enter. Diharapkan panel terbuka, `aria-expanded` berubah menjadi `true`, dan fokus tetap pada tombol.

- [ ] **Step 7: Commit**

```bash
git add src/components/organic/Faq.tsx src/app/globals.css
git commit -m "feat(animasi): akordeon FAQ dengan tinggi beranimasi"
```

---

## Task 7: Akordeon "Lauk pendamping" pada kartu paket

Mekanisme yang sama seperti Task 6, tapi komponennya berbeda: ada tiga instans (satu per paket) dengan state masing-masing, dan panelnya membawa `role="region"` serta `aria-labelledby`.

**Files:**
- Modify: `src/components/organic/Paket.tsx` (blok panel yang memakai `hidden={!buka}`, dan `<span aria-hidden="true">` penanda +/−)

**Interfaces:**
- Consumes: kelas `.akordeon-panel` dan `.tanda-akordeon` dari Task 6.
- Produces: —

- [ ] **Step 1: Ubah panel**

Di `src/components/organic/Paket.tsx`, ganti blok panel (yang saat ini memakai `hidden={!buka}`) menjadi:

```tsx
                    <div className="akordeon-panel" data-buka={buka ? "true" : "false"}>
                      <div
                        id={panelId}
                        role="region"
                        aria-labelledby={tombolId}
                        inert={!buka}
                        className="rounded-[var(--radius-lg)] bg-surface p-[var(--space-3)] text-[14px] leading-[1.6] text-neutral-800"
                      >
                        {/* isi daftar lauk pendamping yang sudah ada, tidak diubah */}
                      </div>
                    </div>
```

- [ ] **Step 2: Haluskan tanda +/−**

Pada `<span aria-hidden="true">` yang menampilkan `{buka ? "−" : "+"}`, tambahkan kelas `tanda-akordeon` di depan daftar kelas yang sudah ada dan atribut `data-buka={buka ? "true" : "false"}`. Isi teksnya tidak diubah.

- [ ] **Step 3: Verifikasi perintah build**

```bash
npx tsc --noEmit
```
Diharapkan: tanpa keluaran.

```bash
npm run build
```
Diharapkan: `✓ Compiled successfully`.

- [ ] **Step 4: Verifikasi ketiganya berdiri sendiri**

`npm run dev`, kecilkan lebar jendela di bawah 1024px supaya carousel kartu terlihat. Buka akordeon pada kartu **Paket 20K** saja, lalu tempel:

```js
[...document.querySelectorAll('.akordeon-panel')].map(p => p.dataset.buka)
```
Diharapkan: hanya satu `"true"` di antara panel-panel kartu paket; sisanya `"false"`. Membuka satu kartu tidak boleh membuka kartu lain.

- [ ] **Step 5: Verifikasi `/rakit-snack-box` tidak terpengaruh**

Buka `http://localhost:3000/rakit-snack-box`, tempel:

```js
({ akordeon: document.querySelectorAll('.akordeon-panel').length, reveal: document.querySelectorAll('[data-reveal]').length })
```
Diharapkan: `{ akordeon: 0, reveal: 0 }` — halaman builder harus tetap persis seperti sebelum pekerjaan ini.

- [ ] **Step 6: Commit**

```bash
git add src/components/organic/Paket.tsx
git commit -m "feat(animasi): akordeon lauk pendamping dengan tinggi beranimasi"
```

---

## Task 8: Sentuhan hover

Murni CSS, tidak menyentuh satu pun komponen.

**Files:**
- Modify: `src/app/globals.css`

**Interfaces:**
- Consumes: token dari Task 1.
- Produces: —

- [ ] **Step 1: Tambahkan aturan hover**

Di `src/app/globals.css`, setelah blok akordeon:

```css
/* ── Hover ────────────────────────────────────────────────────────────
   Dikurung dalam (hover: hover) supaya keadaan hover tidak menempel
   setelah disentuh di perangkat layar sentuh. */
@media (hover: hover) {
  .btn {
    transition:
      background-color var(--durasi-cepat) var(--easing-keluar),
      color var(--durasi-cepat) var(--easing-keluar),
      border-color var(--durasi-cepat) var(--easing-keluar),
      scale var(--durasi-cepat) var(--easing-keluar);
  }

  .btn:hover {
    scale: 1.02;
  }

  .card {
    transition: box-shadow var(--durasi-sedang) var(--easing-keluar);
  }

  .card:hover {
    box-shadow: var(--shadow-lg);
  }
}
```

Catatan: aturan `.btn` di sini menimpa `transition` bawaan yang ada di `@layer components`, karena aturan di luar layer selalu menang atas aturan di dalam layer. Itu memang yang diinginkan; jangan memindahkan blok ini ke dalam `@layer components`.

- [ ] **Step 2: Verifikasi perintah build**

```bash
npm run build
```
Diharapkan: `✓ Compiled successfully`.

- [ ] **Step 3: Verifikasi transisi terpasang**

`npm run dev`, tempel:

```js
const b = document.querySelector('.btn');
getComputedStyle(b).transitionProperty
```
Diharapkan: memuat `scale` di samping `background-color`, `color`, dan `border-color`.

- [ ] **Step 4: Verifikasi perangkat sentuh tidak terpengaruh**

DevTools → toggle device toolbar (mode ponsel), muat ulang, tempel:

```js
matchMedia('(hover: hover)').matches
```
Diharapkan: `false` — sehingga blok hover tidak aktif dan tombol tidak "tersangkut" membesar setelah disentuh.

- [ ] **Step 5: Commit**

```bash
git add src/app/globals.css
git commit -m "feat(animasi): sentuhan hover untuk tombol dan kartu"
```

---

## Task 9: Bayangan navbar saat digulir

**Task ini opsional.** Ia satu-satunya bagian rencana yang menaikkan biaya arsitektur: `Navbar.tsx` berubah dari server component menjadi client component, sehingga jumlah server component turun dari 10 menjadi 9. Kalau peninjau menilai bayangan navbar tidak sepadan dengan biaya itu, **lewati task ini** — tidak ada task lain yang bergantung padanya.

**Files:**
- Modify: `src/components/organic/Navbar.tsx`
- Modify: `src/app/page.tsx`
- Modify: `src/app/globals.css`

**Interfaces:**
- Consumes: token dari Task 1.
- Produces: —

- [ ] **Step 1: Tambahkan sentinel di awal `<main>`**

Di `src/app/page.tsx`, jadikan elemen pertama di dalam `<main id="konten">`:

```tsx
        {/* Sentinel setinggi 1px: saat ia keluar layar, navbar menegas.
            Dipakai sebagai ganti listener scroll supaya tidak ada jank. */}
        <div data-sentinel-navbar aria-hidden="true" className="h-px" />
```

- [ ] **Step 2: Jadikan Navbar client dan amati sentinel**

Di `src/components/organic/Navbar.tsx`, tambahkan `"use client";` sebagai baris pertama, lalu tambahkan impor:

```tsx
import { useEffect, useState } from "react";
```

Di dalam `export function Navbar() {`, sebelum `return`:

```tsx
  const [menegas, setMenegas] = useState(false);

  useEffect(() => {
    const sentinel = document.querySelector("[data-sentinel-navbar]");
    if (!sentinel || typeof IntersectionObserver === "undefined") return;

    const pengamat = new IntersectionObserver(
      ([entri]) => setMenegas(!entri.isIntersecting),
      { threshold: 0 },
    );
    pengamat.observe(sentinel);
    return () => pengamat.disconnect();
  }, []);
```

Lalu pada elemen `<header>`, tambahkan atribut dan kelas:

```tsx
    <header
      data-menegas={menegas ? "true" : "false"}
      className="navbar-menegas sticky top-0 z-50 bg-bg lg:border-b lg:border-divider"
    >
```

- [ ] **Step 3: Tambahkan CSS**

Di `src/app/globals.css`, setelah blok hover:

```css
/* Navbar menegas setelah hero terlewat. */
.navbar-menegas {
  transition: box-shadow var(--durasi-sedang) var(--easing-keluar);
}

.navbar-menegas[data-menegas="true"] {
  box-shadow: var(--shadow-md);
}
```

- [ ] **Step 4: Verifikasi perintah build**

```bash
npx tsc --noEmit
```
Diharapkan: tanpa keluaran.

```bash
npm run build
```
Diharapkan: `✓ Compiled successfully`; kedua rute tetap `○ (Static)`.

- [ ] **Step 5: Verifikasi perilaku**

`npm run dev`, buka `http://localhost:3000` tanpa menggulir, tempel:

```js
document.querySelector('header').dataset.menegas
```
Diharapkan: `"false"`.

Gulir ke bawah sekitar 300px, tempel lagi. Diharapkan: `"true"`.

- [ ] **Step 6: Commit**

```bash
git add src/components/organic/Navbar.tsx src/app/page.tsx src/app/globals.css
git commit -m "feat(animasi): bayangan navbar setelah hero terlewat"
```

---

## Task 10: Sapuan verifikasi akhir terhadap spec §10

Tidak ada kode baru. Menjalankan seluruh delapan kriteria penerimaan dari spec dan mencatat hasilnya.

**Files:** —

**Interfaces:**
- Consumes: seluruh task sebelumnya.
- Produces: —

- [ ] **Step 1: Perintah build bersih (spec §10.1)**

```bash
npx tsc --noEmit
```
```bash
npm run lint
```
```bash
npm run build
```
Diharapkan: ketiganya tanpa galat.

- [ ] **Step 2: Anggaran JavaScript (spec §10.2)**

```bash
node -e "const fs=require('fs'),p=require('path');let t=0,n=0;(function w(d){for(const f of fs.readdirSync(d,{withFileTypes:true})){const q=p.join(d,f.name);if(f.isDirectory())w(q);else if(f.name.endsWith('.js')){t+=fs.statSync(q).size;n++}}})('.next/static/chunks');console.log(n+' berkas, '+(t/1024).toFixed(0)+' KB mentah')"
```
Diharapkan: kurang dari **613 KB** (baseline 608 KB + batas 5 KB dari spec).

- [ ] **Step 3: Rute tetap statis (spec §10.3)**

Dari keluaran `npm run build` di Step 1, pastikan `/` dan `/rakit-snack-box` keduanya bertanda `○ (Static)`.

- [ ] **Step 4: Reduced-motion — tidak ada yang tersangkut (spec §10.4)**

Aktifkan emulasi `prefers-reduced-motion: reduce`, muat ulang `http://localhost:3000`, tempel:

```js
const kandidat = [...document.querySelectorAll('[data-reveal] > *, [data-reveal] [style*="--i"], .hero-masuk > *')];
({ diperiksa: kandidat.length, tersembunyi: kandidat.filter(el => getComputedStyle(el).opacity === '0').length })
```
Diharapkan: `tersembunyi: 0`.

- [ ] **Step 5: Tanpa JavaScript — tidak ada yang tersangkut (spec §10.5)**

Matikan JavaScript, muat ulang, gulir dari atas sampai bawah secara visual.
Diharapkan: seluruh seksi terlihat penuh; hero tetap beranimasi masuk.

- [ ] **Step 6: Akordeon dapat dioperasikan keyboard (spec §10.6)**

Nyalakan kembali JavaScript. Dengan keyboard saja: Tab menuju pertanyaan FAQ pertama, tekan Enter, lalu Tab lagi.
Diharapkan: panel terbuka; isi panel yang terbuka bisa dijangkau Tab; panel yang tertutup dilewati sepenuhnya.

- [ ] **Step 7: Tidak ada pergeseran layout (spec §10.7)**

Muat ulang, catat nilai, gulir penuh ke bawah, catat lagi:
```js
document.documentElement.scrollHeight
```
Diharapkan: kedua nilai sama.

- [ ] **Step 8: Builder tidak berubah (spec §10.8)**

Buka `http://localhost:3000/rakit-snack-box` dan lakukan pemesanan singkat: pilih dua item, buka panel ringkasan, ubah jumlah box.
Diharapkan: perilakunya persis seperti sebelum pekerjaan animasi; tidak ada elemen `[data-reveal]` maupun `.akordeon-panel` di halaman itu.

- [ ] **Step 9: Commit catatan hasil (opsional)**

Bila ada temuan yang perlu ditindaklanjuti, catat di bagian bawah spec dan commit:

```bash
git add docs/superpowers/specs/2026-09-03-animasi-organic-design.md
git commit -m "docs: catatan hasil verifikasi animasi"
```

---

## Yang sengaja tidak dikerjakan

- **Animasi di `/rakit-snack-box`** — di luar cakupan yang disetujui (spec §2).
- **Angka harga menghitung naik** — ditolak secara sadar di spec §8: harga adalah informasi terpenting di halaman, dan angka berjalan menyulitkan pembacaannya.
- **Mencopot `framer-motion`, `clsx`, `lucide-react`, `tailwind-merge`** — keempatnya memang tidak terpakai (spec §9), tapi itu pekerjaan pembersihan dependensi yang terpisah dan butuh persetujuan sendiri.
- **Menambahkan test runner** — proyek belum punya, dan menambahkannya di luar cakupan yang disetujui. Lihat "Cara memverifikasi" untuk siklus yang dipakai sebagai gantinya.
