# Animasi Layout — Situs Dzanis Catering ("Organic")

Tanggal: 2026-09-03
Status: menunggu review

## 1. Tujuan

Memberi gerakan pada homepage supaya terasa hidup dan digarap serius, tanpa
mengorbankan hal yang membuat situs ini bagus sekarang: nyaris tidak mengirim
JavaScript, dan seluruh halaman ter-prerender statis.

Karakter yang disepakati: **kalem dan editorial**. Konten muncul lembut saat
digulir, tidak ada yang bergerak tanpa alasan, tidak ada scroll-jacking.

## 2. Cakupan

Termasuk:

- Animasi masuk (reveal) untuk seluruh seksi homepage.
- Memperhalus interaksi yang sudah ada: akordeon FAQ, akordeon "Lauk
  pendamping" di kartu paket, keadaan hover tombol/kartu, dan navbar yang
  menegas setelah hero terlewat.

Tidak termasuk (eksplisit):

- Halaman `/rakit-snack-box`. Builder adalah jalur pemesanan; salah animasi di
  sana mengganggu orang yang sedang bertransaksi. Dibahas terpisah bila perlu.
- Parallax, pinning, timeline sinematik, morph SVG.
- Transisi antar halaman.

## 3. Keputusan teknis

**Dipilih: wrapper `<Reveal>` mungil + transisi CSS.**

Kuncinya pola komposisi Next.js. Dokumen versi terpasang (16.3.1),
`node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md`
baris 178, menyatakan:

> "It does not apply to Server Components passed as children or other props.
> Those components are not imported into the Client Component's module graph.
> They are rendered on the server and passed to the Client Component as
> rendered output."

Artinya `<Reveal><Hero /></Reveal>` **tidak** mengubah `Hero` menjadi client
component. Kita mendapat animasi di semua seksi dengan biaya satu komponen
client kecil, bukan sebelas.

### Yang ditolak, dan alasannya

**GSAP.** GSAP imperatif dan berbasis DOM: tiap seksi butuh `'use client'` +
`useRef` + `useEffect`. Sepuluh server component akan berubah jadi client
component, ditambah ~70KB gzip untuk core + ScrollTrigger. Kekuatan asli GSAP —
timeline panjang, pinning, morph, inertia — tidak satu pun dipakai oleh ketiga
artboard. Membayar penuh tanpa memakai manfaatnya.

**CSS murni (`animation-timeline: view()`).** Nol JS, dan menggoda. Gagal pada
syarat yang justru diminta: menganimasikan `height: auto` untuk akordeon
memerlukan `calc-size()`, yang baru ada di Chrome 129+ dan belum di Safari
maupun Firefox. Akordeon akan tetap patah di sebagian besar browser.

**`framer-motion`.** Sudah terpasang di `package.json` (^13.1.0) sehingga
terasa gratis, tapi memaksa batas client yang sama seperti GSAP dan menambah
runtime ~34KB gzip. Berlebihan untuk fade + naik 16px.

## 4. Prinsip yang mengikat seluruh desain

1. **Keadaan diam adalah "terlihat".** Posisi tersembunyi hanya diberikan di
   dalam `@media (prefers-reduced-motion: no-preference)` **dan** hanya ketika
   JavaScript sudah menandai dokumen siap. Kalau animasi dimatikan, JS gagal,
   atau observer tidak pernah menyala, konten tampil normal. Ini menutup
   jebakan nyata: `globals.css` sudah punya blok `prefers-reduced-motion` yang
   memaksa `animation-duration: 0.01ms`, sehingga reveal yang dimulai dari
   `opacity: 0` bisa tersangkut tak terlihat selamanya.
2. **Hanya menganimasikan `opacity`, `translate`, `scale`, dan `rotate`.**
   Properti komposit; tidak memicu layout. Tidak pernah menganimasikan
   `width`/`height`/`top`/`margin` (akordeon memakai trik `grid-template-rows`
   di §6.2, bukan `height`).
3. **Sekali jalan.** Reveal berhenti mengamati setelah terpicu. Tidak ada
   elemen yang muncul-hilang berulang saat digulir naik-turun.
4. **Tidak ada listener `scroll`.** Semua deteksi posisi memakai
   `IntersectionObserver`.
5. **Tidak menggeser layout.** Jarak naik 16px dilakukan dengan `translate`,
   ruangnya sudah dipesan sejak awal. CLS tetap nol.

## 5. Token gerak

Ditambahkan ke blok `:root` di `src/app/globals.css`, sejajar dengan token
jarak dan radius yang sudah ada:

```css
--durasi-cepat: 180ms;    /* hover, tanda +/- */
--durasi-sedang: 260ms;   /* akordeon */
--durasi-lambat: 420ms;   /* reveal seksi */
--jeda-stagger: 60ms;     /* antar anak dalam satu seksi */
--jarak-naik: 16px;
--easing-keluar: cubic-bezier(0.22, 1, 0.36, 1);
```

Satu easing saja untuk seluruh situs. Konsistensi lebih penting daripada
variasi di sistem sekalem ini.

## 6. Mekanisme

### 6.1 `<Reveal>` — animasi masuk saat digulir

File baru: `src/components/organic/Reveal.tsx` (client, ~1KB).

```tsx
type Props = {
  children: React.ReactNode;
  /** Elemen pembungkus. Default "div". */
  as?: "div" | "section";
  className?: string;
};
```

Perilaku:

- Merender elemen sesuai prop `as` (default `div`) dengan atribut `data-reveal`,
  membungkus `children`.
- Satu `IntersectionObserver` per instans, `threshold: 0`,
  `rootMargin: "0px 0px -12% 0px"` supaya animasi mulai sedikit sebelum seksi
  benar-benar di tengah layar.
- Saat terpotong pertama kali: set `data-terlihat="true"`, lalu `unobserve`.

Stagger tidak memerlukan komponen per item. CSS menunda **anak langsung** dari
pembungkus:

```css
[data-js] [data-reveal] > * {
  transition:
    opacity var(--durasi-lambat) var(--easing-keluar),
    translate var(--durasi-lambat) var(--easing-keluar);
}

@media (prefers-reduced-motion: no-preference) {
  [data-js] [data-reveal]:not([data-terlihat]) > * {
    opacity: 0;
    translate: 0 var(--jarak-naik);
  }
}

[data-reveal] > *:nth-child(2) { transition-delay: calc(1 * var(--jeda-stagger)); }
[data-reveal] > *:nth-child(3) { transition-delay: calc(2 * var(--jeda-stagger)); }
/* dst. sampai nth-child(8); selebihnya memakai penundaan yang sama */
```

Untuk urutan khusus (mis. enam foto snack box), seksi boleh menyetel
`style={{ "--i": n }}` pada anaknya dan CSS memakai
`transition-delay: calc(var(--i, 0) * var(--jeda-stagger))`. Ini murni markup,
jadi tetap bisa dilakukan dari server component.

### 6.2 Akordeon — FAQ dan "Lauk pendamping"

Keduanya sekarang me-render panel secara kondisional (`{buka && <div>…}`),
sehingga tidak ada yang bisa ditransisikan. Perubahannya: panel **selalu ada di
DOM**, tingginya yang dianimasikan.

```css
.akordeon-panel {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows var(--durasi-sedang) var(--easing-keluar);
}
.akordeon-panel[data-buka="true"] { grid-template-rows: 1fr; }
.akordeon-panel > * { overflow: hidden; }
```

Trik `0fr → 1fr` didukung semua browser sasaran dan tidak memerlukan pengukuran
tinggi lewat JS.

Konsekuensi aksesibilitas yang harus ditangani: karena panel selalu ada, panel
tertutup harus diberi atribut `inert` (didukung sebagai prop boolean di React
19) supaya isinya tidak bisa difokus dan tidak dibacakan pembaca layar.
`aria-expanded` dan `aria-controls` yang sudah ada tetap dipertahankan.

Efek samping yang menguntungkan: jawaban FAQ kini selalu ada di HTML, sejalan
dengan `FAQPage` JSON-LD di `StructuredData.tsx`.

Tanda `+` / `−` tetap memakai karakter yang sama persis seperti artboard —
tidak diganti ikon yang dirotasi. Yang ditambahkan hanya
`transition: rotate var(--durasi-cepat)` sehingga pergantiannya tidak mengedip.

### 6.3 Hero — animasi saat muat, tanpa JS

Hero berada di paruh atas layar, jadi tidak butuh observer sama sekali. Cukup
`@keyframes` dengan `animation-delay` bertingkat, dibungkus
`@media (prefers-reduced-motion: no-preference)`.

`Hero.tsx` tetap **server component**. Tidak ada JS yang ditambahkan.

### 6.4 Navbar

Sentinel setinggi 1px diletakkan di awal `<main>`; ketika ia keluar dari
viewport, navbar mendapat bayangan halus dan garis bawah.

**Ini satu-satunya biaya arsitektur dalam desain ini:** `Navbar.tsx` harus
menjadi client component karena ia yang menyimpan state. Biayanya kecil —
komponen itu hanya mengimpor `company` (objek biasa) dan `next/image` — tetapi
jujur harus dicatat: server component berkurang dari 10 menjadi 9.

Jika biaya itu dianggap tidak sepadan, butir ini bisa dicoret tanpa memengaruhi
bagian lain desain.

### 6.5 Hover

Murni CSS, ditambahkan ke kelas yang sudah ada di `globals.css`:

- `.btn` — sudah punya transisi warna; ditambah `scale(1.02)` saat hover.
- `.card` — bayangan naik dari `--shadow-md` ke `--shadow-lg`.
- Foto di dalam kartu — `scale(1.03)` dengan `overflow: hidden` pada induk.

Semua di dalam `@media (hover: hover)` supaya tidak menempel di perangkat
sentuh.

## 7. Penanda JavaScript siap

Supaya keadaan tersembunyi tidak pernah muncul sebelum JS jalan (yang akan
menyebabkan kedipan: konten tampil → hilang → muncul lagi), `layout.tsx`
menyisipkan satu skrip inline yang berjalan sebelum paint:

```tsx
<script
  dangerouslySetInnerHTML={{
    __html: `document.documentElement.dataset.js="1"`,
  }}
/>
```

Seluruh aturan penyembunyian di §6.1 diberi awalan `[data-js]`. Tanpa JS,
atribut tidak pernah ada, dan konten tampil apa adanya. Tidak ada permintaan
jaringan tambahan.

## 8. Peta gerakan per seksi

| Seksi | Gerakan |
|---|---|
| Hero | Judul, paragraf, tombol, foto naik berurutan (stagger 60ms) saat muat. Lingkaran sage `scale` dari 0.9. Tanpa JS. |
| Paket | Band olive fade masuk; tiga baris harga stagger. Kartu carousel mobile tidak dianimasikan — sudah bergerak saat digeser. |
| Snack Box | Enam foto stagger lewat `--i`, dengan `--jeda-stagger` di-override lokal ke 40ms karena enam item beruntun terasa lamban pada 60ms; tiga angka besar (51 / 6 / 500) fade + naik. |
| CtaBesar | Foto dan panel terakota masuk bersama, tanpa stagger. |
| Layanan | Tiga kartu stagger. |
| CaraPesan | Empat langkah stagger; lingkaran nomor `scale` dari 0.85. |
| Angka | Panel fade; tiga baris angka stagger. |
| Faq | Reveal seksi + akordeon §6.2. |
| Navbar | Bayangan muncul setelah hero terlewat (§6.4). |
| Footer | Fade sederhana, tanpa stagger. |

Catatan: angka harga **tidak** dianimasikan menghitung naik. Pada desain
sekalem ini, angka berjalan menarik perhatian ke tempat yang salah dan
menyulitkan pembacaan harga — justru informasi terpenting di halaman.

## 9. Pembersihan dependensi

Karena tidak ada pustaka animasi yang dipakai, empat dependensi berikut tetap
tak terpakai dan bisa dicopot: `framer-motion`, `clsx`, `lucide-react`,
`tailwind-merge`. Semuanya sisa desain lama yang komponennya sudah dihapus.

Ini di luar cakupan animasi dan dikerjakan hanya bila disetujui terpisah.

## 10. Anggaran dan verifikasi

Baseline terukur sebelum perubahan: 9 berkas chunk, 608 KB mentah (belum
dikompresi, mencakup seluruh rute dan framework).

Yang akan diperiksa setelah implementasi:

1. `npm run build`, `npx tsc --noEmit`, `npm run lint` bersih.
2. Total JS di `.next/static/chunks` naik **kurang dari 5KB mentah** dibanding
   baseline 608KB. Diukur dengan perintah yang sama seperti saat mengambil
   baseline, bukan dengan menaksir ukuran satu komponen.
3. Kedua rute tetap `○ (Static)`.
4. Dengan `prefers-reduced-motion: reduce` aktif: **seluruh konten terlihat**,
   tidak ada yang tersangkut transparan. Diverifikasi lewat emulasi browser.
5. Dengan JavaScript dimatikan: seluruh konten terlihat.
6. Akordeon FAQ dan Paket masih bisa dioperasikan penuh lewat keyboard; panel
   tertutup tidak bisa difokus (`inert` bekerja).
7. CLS nol — tidak ada seksi yang menggeser tata letak saat masuk.
8. Halaman `/rakit-snack-box` tidak berubah sama sekali.

## 11. Risiko

| Risiko | Penanganan |
|---|---|
| Konten tersangkut tak terlihat | Keadaan diam = terlihat; penyembunyian dikunci di balik `[data-js]` **dan** `prefers-reduced-motion: no-preference`. Diuji eksplisit (§10.4, §10.5). |
| Panel akordeon selalu di DOM mengubah perilaku pembaca layar | `inert` pada panel tertutup; `aria-expanded`/`aria-controls` dipertahankan. |
| Stagger `nth-child` salah sasaran bila markup seksi berubah | Penundaan hanya berlaku untuk anak langsung `[data-reveal]`; seksi dengan urutan khusus memakai `--i` eksplisit. |
| Navbar jadi client component | Dicatat sebagai biaya sadar; butir paling mudah dicoret bila tidak sepadan. |
| Animasi terasa lambat di HP kelas bawah | Hanya properti komposit; satu observer per seksi; tidak ada listener scroll. |
