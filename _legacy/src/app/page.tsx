import { Navbar } from "@/components/organic/Navbar";
import { Hero } from "@/components/organic/Hero";
import { Paket } from "@/components/organic/Paket";
import { SnackBox } from "@/components/organic/SnackBox";
import { CtaBesar } from "@/components/organic/CtaBesar";
import { Layanan } from "@/components/organic/Layanan";
import { CaraPesan } from "@/components/organic/CaraPesan";
import { Angka } from "@/components/organic/Angka";
import { Faq } from "@/components/organic/Faq";
import { Footer } from "@/components/organic/Footer";
import { TombolWhatsApp } from "@/components/organic/TombolWhatsApp";
import { Reveal } from "@/components/organic/Reveal";

/**
 * Homepage "Organic".
 *
 * Satu halaman responsif yang menggabungkan dua artboard Claude Design:
 * "Homepage Mobile Organic" (390px) dan "Homepage Web" (1280px). Urutan
 * seksi mengikuti artboard web; dua seksi yang hanya ada di salah satu
 * artboard tetap dipertahankan — Angka (khusus mobile) dan CtaBesar
 * (khusus web) — supaya tidak ada isi desain yang hilang.
 */
export default function Home() {
  return (
    <>
      <Navbar />
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
      <Reveal>
        <Footer />
      </Reveal>
      <TombolWhatsApp />
    </>
  );
}
