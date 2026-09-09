# ADR 0001: Migrasi Front-End ke Astro & Native Order Dialog

- **Status:** Implemented (di cabang `feat/astro-migration`)
- **Tanggal:** 2026-09-07
- **Pengambil Keputusan:** Frontend Architecture & Core Engineering Team
- **Konteks Teknis:** Dzanis Catering (Front-End Revamp)

---

## 1. Konteks & Masalah (Context & Problem Statement)

Aplikasi Dzanis Catering versi awal dibangun menggunakan stack Next.js / React. Berdasarkan hasil audit performa pada perangkat bergerak (mobile), ditemukan masalah overhead JavaScript yang signifikan:

1. **Vendor Bundle Leak:** Terdapat kebocoran bundel vendor React (`client.*.js`) sebesar **~188 KB** yang dimuat di sisi klien, meskipun sebagian besar halaman hanya berupa katalog makanan dan konten presentasional statis.
2. **Degradasi Metrik Web Vitals:** Beban rehidrasi JavaScript memperlambat *Time to Interactive* (TTI) dan meningkatkan *First-Load Latency*, terutama pada pengguna perangkat kelas menengah ke bawah dengan koneksi seluler 3G/4G di area operasional utama (Majalengka, Cirebon, Indramayu, Kuningan / Ciayumajakuning).
3. **Kompleksitas yang Berlebihan:** Implementasi formulir pemesanan modal sederhana sebelumnya mengandalkan library state eksternal yang tidak diperlukan untuk alur pemesanan langsung (*direct-to-WhatsApp checkout*).

---

## 2. Faktor Pendorong Keputusan (Decision Drivers)

- **Sub-second LCP:** Menghadirkan *Largest Contentful Paint* (LCP) di bawah 1 detik pada perangkat mobile jaringan seluler.
- **Zero-JS Runtime untuk Bagian Statis:** Mengeliminasi seluruh JavaScript dari seksi presentasional (`Hero.astro`, `SnackBox.astro`).
- **Checkout WhatsApp yang Efisien:** Menghasilkan perutean pesan pemesanan terstruktur ke WhatsApp tanpa library form eksternal.
- **Deployment Portabel:** Output HTML/CSS murni yang dapat di-host di penyedia static hosting mana pun (Vercel, Cloudflare Pages, Netlify) dengan efisiensi tinggi.

---

## 3. Opsi yang Dipertimbangkan (Considered Options)

### Opsi 1: Next.js (Full SPA / App Router)
- *Kelebihan:* Ekosistem matang, dukungan routing built-in.
- *Kekurangan:* Runtime client React tetap dipaksakan ke peramban. Biaya komputasi hidrasi terlalu tinggi untuk situs katalog bertarget mobile.

### Opsi 2: Astro Hybrid dengan React Islands (`@astrojs/react`)
- *Kelebihan:* Memungkinkan komponen Astro membungkus komponen React interaktif via direktif `client:load` / `client:visible`.
- *Kekurangan:* Integrasi `@astrojs/react` pada `astro.config.mjs` tetap memicu bundling runtime React dan Vite vendor chunk sebesar ~188 KB begitu ada satu komponen interaktif di halaman.

### Opsi 3: Pure Native Astro + Native HTML5 Elements (Pilihan Terpilih)
- *Kelebihan:* 
  - Seluruh layout dan komponen katalog dirender menjadi HTML statis saat build-time (zero-JS by default).
  - Modal interaktif dibangun menggunakan elemen bawaan peramban `<dialog>` standar HTML5 dan Vanilla JavaScript DOM API.
  - `@astrojs/react` didecouple total dari konfigurasi proyek.
- *Kekurangan:* Interaksi reaktif kompleks harus ditulis secara deklaratif dengan native DOM API, namun hal ini justru sangat ideal dan mencukupi untuk kebutuhan modal order WhatsApp.

---

## 4. Keputusan yang Diambil (Decision Outcome)

Dipilih **Opsi 3: Pure Native Astro + Native HTML5 Elements**.

### Langkah Arsitektural yang Diterapkan:
1. **Pembersihan Konfigurasi (`astro.config.mjs`):**
   - Menghapus impor `@astrojs/react` dan pemanggilan `react()` dari array `integrations`.
   - Mengonfigurasi Tailwind CSS v4 secara langsung via `@tailwindcss/vite` di array `vite.plugins`.
2. **Karantina Kode Lama:**
   - Memindahkan seluruh kode legacy ke direktori `_legacy/` sebagai referensi historis read-only.
3. **Refaktor Komponen ke Native Astro:**
   - Mengonversi `Hero.tsx` dan `SnackBox.tsx` menjadi `src/components/organic/Hero.astro` dan `src/components/organic/SnackBox.astro` tanpa runtime JavaScript klien.
4. **Modal Pemesanan Native (`OrderModal.astro`):**
   - Menggunakan elemen HTML5 `<dialog id="order-modal">`.
   - Menggunakan Vanilla JavaScript event delegation (`[data-order-trigger]`) dan CustomEvent `open-order-modal`.
   - Memvalidasi data form secara native (`form.checkValidity()`) dan menghasilkan tautan WhatsApp terenkripsi (`encodeURIComponent`) dengan proteksi keamanan tabnabbing (`noopener,noreferrer`).

---

## 5. Konsekuensi & Validasi Metrik (Consequences & Metrics Validation)

| Metrik | Arsitektur Lama (React / Next.js) | Arsitektur Baru (Pure Astro) | Hasil / Peningkatan |
| :--- | :--- | :--- | :--- |
| **Ukuran JavaScript Klien** | ~188 KB | **~1.83 KB** (inline module) | **Penurunan ~99%** |
| **External JS Chunks (`dist/_astro/`)** | 1 file vendor JS (`client.*.js`) | **0 file (0 KB)** | **Tereliminasi Total** |
| **Waktu Build Produksi** | ~2.5 - 4.0 detik | **~350–550 ms** | **Percepatan ~5x–8x** |
| **Ketergantungan UI Klien** | React, React-DOM, Lucide React | **0 runtime library** | **Zero-JS Overhead** |

### Aksesibilitas & Keamanan:
- Fokus keyboard otomatis terkunci di dalam modal saat `showModal()` dipanggil (native focus trapping).
- Penutupan modal via tombol `Escape` dan klik di luar area dialog (*backdrop click*) ditangani tanpa galat konsol.
- Pembersihan nomor telepon dilakukan via regex sanitasi angka sebelum pembuatan tautan `https://wa.me/`.
