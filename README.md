# 🍱 Dzanis Catering — Modern Zero-JS Web Platform

[![Astro](https://img.shields.io/badge/Astro-5.x-BC52EE?style=flat-square&logo=astro&logoColor=white)](https://astro.build)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Zero-JS Architecture](https://img.shields.io/badge/Client_JS-~1.83_KB_(Zero--JS_Core)-success?style=flat-square)](docs/adr/0001-migrate-to-astro-native.md)

Platform web resmi layanan katering **Dzanis Catering** (Majalengka, Jawa Barat) yang melayani area Ciayumajakuning (Cirebon, Indramayu, Majalengka, Kuningan). Dibangun ulang dari awal menggunakan arsitektur **Pure Astro** untuk menyajikan katalog produk responsif, sistem pemesanan interaktif, dan estimasi pesanan dengan performa mobile sub-detik.

---

## 🚀 Ringkasan & Tujuan Proyek

- **Katalog Responsif Berkecepatan Tinggi:** Menampilkan paket nasi kotak, snack box isi sendiri, dan prasmanan dengan beban unduhan minimal bagi pelanggan di jaringan seluler.
- **Direct-to-WhatsApp Checkout:** Generator format pemesanan otomatis yang menghubungkan pelanggan langsung ke layanan admin WhatsApp bisnis tanpa friksi registrasi akun.
- **Efisiensi Beban Klien:** Reduksi beban JavaScript peramban dari **~188 KB** menjadi **~1.83 KB** (~99% penurunan ukuran bundle) dengan waktu generasi build statis berkisar antara **~350–550 ms**.

---

## 🏗️ Arsitektur & Tech Stack

| Komponen | Teknologi | Deskripsi |
| :--- | :--- | :--- |
| **Core Engine** | **Astro 5** | Static Site Generation (SSG) murni. Menghasilkan HTML statis tanpa runtime framework di sisi klien. |
| **Styling & Design System** | **Tailwind CSS v4** | Terintegrasi via plugin Vite (`@tailwindcss/vite`) dengan token semantik "Sistem Organic" di `src/styles/global.css`. |
| **Form Engine & Modal** | **Native HTML5 `<dialog>`** | Dialog modal aksesibel dengan Vanilla JavaScript DOM API, focus-trapping bawaan browser, dan sanitasi input. |
| **Data Layer** | **TypeScript Schemas** | Kontrak data bertipe ketat di `src/data/` (`company.ts`, `snack.ts`, `menu.ts`) yang siap diintegrasikan dengan database / Supabase. |

---

## 📁 Struktur Direktori Proyek

```text
Dzanis-catering-update/
├── _legacy/                  # ⚠️ ARSIP KODE LAMA: Referensi arsitektur historis (READ-ONLY)
├── docs/
│   └── adr/
│       └── 0001-migrate-to-astro-native.md  # Dokumen ADR migrasi Astro & dialog native
├── public/                   # Asset publik statis (favicon, logo, gambar menu)
│   └── images/
│       ├── brand/            # Logo & identitas visual
│       └── menu/             # Foto katalog nasi kotak & snack box
├── src/
│   ├── components/
│   │   ├── interactive/      # Komponen interaktif native (OrderModal.astro)
│   │   └── organic/          # Komponen presentasional zero-JS (Hero.astro, SnackBox.astro)
│   ├── data/                 # Sumber data statis & definisi skema TypeScript
│   │   ├── company.ts        # Informasi profil, jam operasional, dan nomor WhatsApp
│   │   ├── menu.ts           # Definisi interface MenuItem & koleksi paket
│   │   └── snack.ts          # Katalog 51 pilihan snack box & kalkulator ringkasan
│   ├── layouts/
│   │   └── BaseLayout.astro  # Layout dasar HTML5, SEO metadata, dan Google Fonts
│   ├── pages/
│   │   └── index.astro       # Halaman utama katalog Dzanis Catering
│   └── styles/
│       └── global.css        # Desain token Sistem Organic & import Tailwind CSS v4
├── astro.config.mjs          # Konfigurasi Astro (Tailwind v4 Vite plugin)
├── package.json              # Manifes dependensi proyek
├── PROJECT_SUMMARY.md        # Catatan lokal & ringkasan teknis (untracked di Git)
└── tsconfig.json             # Konfigurasi TypeScript strict mode
```

> **Perhatian:** Folder `_legacy/` merupakan arsip isolasi kode sebelum migrasi dan **bersifat strictly Read-Only**. Jangan menambahkan kode baru atau mengimpor file dari direktori tersebut.

---

## ⚡ Panduan Memulai (Quick Start)

### Prasyarat Lingkungan
- **Node.js:** Versi `18.20.0+` atau `20.x+` (disarankan)
- **NPM:** Versi `9.x+` atau `10.x+`

### Perintah Operasional

1. **Instalasi Dependensi:**
   ```bash
   npm install
   ```

2. **Menjalankan Server Pengembangan Lokal:**
   ```bash
   npm run dev
   ```
   Aplikasi akan berjalan di `http://localhost:4321/`.

3. **Validasi Tipe & Template (Strict Check):**
   ```bash
   npx astro check
   ```

4. **Ekspor Build Produksi Statis:**
   ```bash
   npm run build
   ```
   Seluruh output HTML, CSS, dan asset statis akan dikompilasi ke direktori `dist/`.

5. **Pratinjau Hasil Build Produksi:**
   ```bash
   npm run preview
   ```

---

## 🛠️ Standar Rekayasa & Alur Git

- **Cabang Pengembangan Aktif:** Seluruh pekerjaan migrasi dan pembaruan fitur saat ini difokuskan pada cabang `feat/astro-migration`.
- **Konvensi Pesan Commit:** Gunakan format standar *Conventional Commits*:
  - `feat:` Penambahan fitur atau komponen baru.
  - `fix:` Perbaikan bug fungsionalitas atau tampilan.
  - `refactor:` Restrukturisasi kode tanpa mengubah perilaku fitur.
  - `perf:` Peningkatan performa dan optimasi bundle.
  - `chore:` Pembaruan dependensi, konfigurasi, atau dokumentasi.

---

## 📚 Referensi Dokumentasi

Untuk rincian latar belakang arsitektur, pertimbangan opsi, dan verifikasi metrik efisiensi bundle JavaScript, baca dokumen arsitektur resmi:
👉 [ADR 0001: Migrasi Front-End ke Astro & Native Order Dialog](docs/adr/0001-migrate-to-astro-native.md)
