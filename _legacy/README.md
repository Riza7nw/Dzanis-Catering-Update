# 🍽️ Dzanis Catering

Website profil catering modern yang dibangun dengan **Next.js 16**, **React 19**, **Tailwind CSS v4**, dan **Framer Motion**.

---

## 📋 Prasyarat

Sebelum memulai, pastikan perangkat kamu sudah terinstal:

| Kebutuhan | Versi Minimum | Cara Cek |
|-----------|---------------|----------|
| [Node.js](https://nodejs.org/) | v18.17+ | `node -v` |
| [npm](https://www.npmjs.com/) | v9+ | `npm -v` |
| [Git](https://git-scm.com/) | Terbaru | `git --version` |

> **Rekomendasi:** Gunakan [nvm](https://github.com/nvm-sh/nvm) untuk mengelola versi Node.js.

---

## 🚀 Cara Instalasi

### 1. Clone Repository

```bash
git clone https://github.com/your-username/dzanis-catering.git
cd dzanis-catering
```

### 2. Install Dependensi

```bash
npm install
```

> Alternatif menggunakan package manager lain:
> ```bash
> yarn install   # menggunakan Yarn
> pnpm install   # menggunakan pnpm
> bun install    # menggunakan Bun
> ```

### 3. Jalankan Development Server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser untuk melihat hasilnya.

---

## 🛠️ Perintah yang Tersedia

| Perintah | Deskripsi |
|----------|-----------|
| `npm run dev` | Menjalankan server pengembangan |
| `npm run build` | Build aplikasi untuk produksi |
| `npm start` | Menjalankan hasil build produksi |
| `npm run lint` | Menjalankan linter ESLint |

---

## 📦 Teknologi yang Digunakan

- **[Next.js 16](https://nextjs.org/)** – Framework React dengan App Router
- **[React 19](https://react.dev/)** – Library UI
- **[Tailwind CSS v4](https://tailwindcss.com/)** – Framework CSS utility-first
- **[Framer Motion](https://www.framer.com/motion/)** – Animasi
- **[Lucide React](https://lucide.dev/)** – Ikon
- **[TypeScript](https://www.typescriptlang.org/)** – Type safety

---

## 📁 Struktur Proyek

```
dzanis-catering/
├── src/
│   ├── app/          # Halaman & layout (Next.js App Router)
│   ├── components/   # Komponen UI yang dapat digunakan ulang
│   └── data/         # Data statis (menu, kontak, dll.)
├── public/           # Aset statis (gambar, ikon)
├── docs/             # Dokumentasi tambahan
└── scripts/          # Script utilitas
```

---

## 🌐 Deploy

Cara termudah untuk men-deploy aplikasi Next.js adalah menggunakan **[Vercel](https://vercel.com/new)**:

1. Push kode ke repository GitHub
2. Import project di [vercel.com](https://vercel.com/new)
3. Deploy otomatis setiap push ke branch `main`

Lihat [dokumentasi deployment Next.js](https://nextjs.org/docs/app/building-your-application/deploying) untuk opsi lainnya.

---

## 📚 Referensi

- [Dokumentasi Next.js](https://nextjs.org/docs)
- [Tutorial Next.js](https://nextjs.org/learn)
- [GitHub Next.js](https://github.com/vercel/next.js)
