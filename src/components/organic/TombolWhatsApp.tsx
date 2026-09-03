import { company } from "@/data/company";

/**
 * Tombol WhatsApp mengambang.
 *
 * Tidak ada di artboard Organic — ini dibawa kembali dari situs lama atas
 * permintaan, lalu ditulis ulang memakai token Organic supaya tidak bergantung
 * pada komponen lama yang sudah dihapus.
 *
 * Sengaja dipasang di homepage saja, bukan di root layout: halaman
 * /rakit-snack-box punya panel ringkasan yang menempel di bawah layar beserta
 * tombol "Kirim pesanan ke WhatsApp" sendiri, dan tombol mengambang akan
 * menutupinya.
 *
 * Warna tetap hijau WhatsApp supaya langsung dikenali. Rasio putih-di-atas-hijau
 * hanya ~2:1, di bawah ambang 3:1 untuk elemen non-teks, jadi batas tombol
 * dipertegas lewat cincin gelap + bayangan, dan maknanya tidak pernah hanya
 * bergantung pada ikon: ada aria-label dan teks sr-only.
 */
export function TombolWhatsApp() {
  return (
    <a
      href={company.contact.whatsappLink}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Chat WhatsApp ${company.name}`}
      className="fixed right-[var(--space-4)] bottom-[max(var(--space-4),env(safe-area-inset-bottom))] z-[300] flex size-14 items-center justify-center rounded-full bg-wa text-bg shadow-[var(--shadow-lg)] ring-1 ring-wa-gelap transition-[background-color,transform] duration-200 hover:scale-105 hover:bg-wa-gelap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-700 lg:size-[60px]"
    >
      {/* Glif resmi WhatsApp; dekoratif karena namanya sudah dibawa aria-label. */}
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
        focusable="false"
        className="size-7 lg:size-8"
      >
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.247-.694.247-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884a9.82 9.82 0 016.988 2.896 9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.885-9.885 9.885m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
      </svg>
      <span className="sr-only">Hubungi kami lewat WhatsApp</span>
    </a>
  );
}
