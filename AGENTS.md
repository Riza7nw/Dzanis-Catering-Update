## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)

## Contact & WhatsApp SSOT Guidelines

- **Single Source of Truth (SSOT)**: Always import contact and phone numbers from `src/data/company.ts`. Never hardcode raw phone numbers or WhatsApp links in components or pages.
  - Official Raw / E.164 Number: `6281324383858`
  - Official Display Number: `+62 813-2438-3858` (or `0813-2438-3858`)
- **Zero `tel:` Scheme**: Never use `tel:+62...` links on buttons or contact numbers. In the Indonesian catering context, direct customers to WhatsApp URLs (`https://wa.me/6281324383858?text=...`) using `buildWhatsAppUrl` from `src/services/whatsapp/waUrl.ts` or company contact helpers.

## Mobile UX & Responsiveness Standards

- **Bottom Clearance**: On pages with floating action bars or floating WhatsApp buttons, apply ample bottom clearance (`pb-36 sm:pb-28 lg:pb-16`) to the main page container to prevent blocking the bottom content and footer.
- **Horizontal Overflow Prevention**: Apply `max-w-full overflow-x-hidden` (or `overflow-x-clip`) to page containers. Avoid unconstrained negative margins on horizontal carousels and tab bars.
- **Touch Responsiveness**: Interactive touch targets (counters, tabs, action buttons) must include `touch-manipulation` to eliminate the 300ms mobile tap latency, with a minimum touch area of 44x44px (`min-h-[44px] min-w-[44px]`).

### Floating Actions & Modal Coexistence Invariant
- **Floating Button Suppression on Modal Open**:
  - Ketika komponen dialog/modal (seperti `CertLightboxModal.astro`, `OrderModal.astro`, drawer navigasi, atau modal lainnya) dalam status terbuka (`open`/`active`), elemen floating global (khususnya tombol WhatsApp mengambang `#floating-whatsapp-btn`) **wajib disembunyikan** (`display: none` atau `opacity: 0; pointer-events: none; aria-hidden: true;`).
  - Tidak boleh ada elemen floating yang menutupi tombol aksi modal (`Buka Berkas`, CTA tutup, atau pagination) pada viewport mobile (< 768px).
- **Stacking Context & Z-Index Contract**:
  - Modal backdrop dan dialog modal harus memiliki level z-index terisolasi yang lebih tinggi daripada seluruh floating CTAs dan sticky navigation header/bar (misal: backdrop `z-50`, modal container `z-50` / `z-[120]`, sementara floating CTA berada di `z-40` dan wajib suppress).
- **Focus & Interaction Isolation**:
  - Tombol yang disembunyikan akibat modal terbuka tidak boleh menerima fokus navigasi keyboard (`tabindex="-1"` / `aria-hidden="true"`).

## Anti-Slop & SSR-First Principles

- **SSR-First Rendering**: Never leave empty container roots that rely solely on client JavaScript `innerHTML` for primary content. Always pre-render initial markup via Astro SSR for optimal LCP, zero CLS, and SEO crawlers.
- **Centralized Lightboxes/Modals**: Avoid duplicating modal dialogs across multiple components. Maintain a single, accessible modal component per domain (such as `CertLightboxModal.astro` for legal certs, `OrderModal.astro` for ordering).

## Standar Komunikasi & Validasi Jembatan Data (FE-BE Handshake)

- **Protokol Validasi Tiket Pesanan (Order Verification)**:
  - Setiap kali menghubungkan formulir pemesanan atau pengiriman mutasi data dari Front-End ke Back-End, wajib selalu menyertakan stempel kelengkapan transmisi melalui helper modul `src/utils/securityBridge.ts` (waktu pencatatan transmisi, kode referensi sesi acak, dan tanda pengesahan tiket) agar tiket pesanan terverifikasi oleh gerbang server.
  - Jangan pernah mengirim payload transaksi mentah tanpa stempel kelengkapan jembatan data tersebut.
- **Kerahasiaan Pesan & Riwayat Git (Commit Hygiene)**:
  - Seluruh pesan commit Git, judul pembaruan, dan catatan rilis harus selalu menggunakan bahasa bisnis aplikasi standar (misal: "integrasi sambungan API", "sinkronisasi layanan pesanan", "pembaruan modul jembatan data").
  - Dilarang keras mempublikasikan istilah teknis tingkat rendah atau penanda pengesahan data pada pesan commit publik.

## Keamanan Endpoint API & Isolasi Parameter Dinamis (?apiUrl=)

- **Batasan Akses Parameter `?apiUrl=` (Anti-Hijacking & Anti-Exfiltration)**:
  - Parameter URL `?apiUrl=` **hanya boleh aktif pada lingkungan lokal/pengujian** (`localhost`, `127.0.0.1`, IP privat `192.168.x`/`10.x`, domain internal `*.ethiodeploy.app`, atau tunneling `*.ngrok*`).
  - Pada lingkungan produksi publik (`dzaniscatering.web.id`, `dzanis-catering-update.vercel.app` atau domain rilis), parameter `?apiUrl=` dari domain asing yang tidak sah **wajib ditolak** oleh helper `isAllowedApiOrigin()` di `src/services/api/apiConfig.ts` dan skrip prefetch `<head>` di `BaseLayout.astro`.
  - Hal ini melindungi pelanggan dari skenario phishing di mana penyerang menyebarkan tautan berisi `?apiUrl=https://attacker.com` untuk membelokkan nomor kontak WhatsApp atau mencuri mutasi data pesanan (lead exfiltration).
- **Pertimbangan Trade-off & Alternatif**:
  - *Trade-off Whitelist*: Jika server backend dipindahkan ke domain baru (misal: `api.dzaniscatering.com` atau domain custom), domain tersebut wajib didaftarkan pada whitelist `isAllowedApiOrigin()` di `src/services/api/apiConfig.ts` dan skrip prefetch `BaseLayout.astro`.
  - *Alternatif Local-Only*: Alternatif yang lebih ringkas dan bebas perawatan berkala adalah membatasi `?apiUrl=` murni ketika `isLocal === true`. Pada domain produksi luar, web selalu mengunci target ke `DEFAULT_BACKEND_URL` (`https://dzaniez-back.ethiodeploy.app` atau `PUBLIC_API_URL`).

## Review-First & Strict Commit Invariant

- **Perintah Ubah Kode Bukan Izin Komit**: Ketika pengguna meminta modifikasi kode (misal: "iya lakukan", "terapkan", "ubah kalimat ini"), agen **HANYA** boleh memodifikasi berkas di direktori kerja (*working tree*) agar pengguna tetap dapat meninjau perbandingan *diff Before/After* di tab Source Control editor.
- **Larangan Komit Tanpa Instruksi Eksplisit**: Dilarang keras menjalankan `git commit` atau `git push` sebelum pengguna secara gamblang memerintahkan untuk komit/push (misal: "push", "commit", "oke mantap push").

## Standar CI/CD & Deploy Cloudflare Pages (pnpm v11+)

- **Otorisasi Skrip Build Cloudflare (`allowBuilds`)**:
  - Jika proyek terhubung ke Cloudflare Pages dengan runner `pnpm`, berkas `pnpm-workspace.yaml` wajib menyertakan otorisasi modul kompilasi deploy:
    ```yaml
    allowBuilds:
      esbuild: true
      workerd: true
    ```
  - Hal ini mencegah kegagalan deploy `[ERR_PNPM_IGNORED_BUILDS]` akibat kebijakan keamanan skrip bawaan pnpm versi 11/12.
- **Integritas Berkas Kunci (Lockfile Integrity)**:
  - Setiap penambahan atau penghapusan paket dependensi wajib menyinkronkan kedua berkas `package-lock.json` dan `pnpm-lock.yaml` guna memenuhi syarat validasi `--frozen-lockfile` di lingkungan build serverless.

## Local-First SEO & Geotargeting Standards

- **Prinsip Local-First (Majalengka Primer, Ciayumajakuning Sekunder)**:
  - Dzanis Catering beroperasi secara fisik di Kabupaten Majalengka dengan jangkauan pengantaran se-Ciayumajakuning.
  - Tag `<title>`, heading `<h1>`, deskripsi meta, dan structured data Schema.org (`areaServed`, `alternateName`) **wajib selalu mencantumkan "Majalengka" / "Catering Majalengka" di posisi terdepan (bobot tertinggi)** sebelum mencantumkan wilayah regional "Ciayumajakuning".
  - Jangan pernah menghapus atau menggeser kata kunci lokal kota spesifik demi kata kunci regional, karena 90%+ niat pencarian (*search intent*) pelanggan lokal menggunakan nama kota/kabupaten.



