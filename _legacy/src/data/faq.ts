/** Empat pertanyaan yang muncul di kedua artboard, teks jawaban identik. */
export type Faq = { question: string; answer: string };

export const faqs: Faq[] = [
  {
    question: "Berapa minimal pesanan?",
    answer: "Minimal 20 box, berlaku untuk nasi kotak maupun snack box.",
  },
  {
    question: "Berapa hari sebelum acara harus pesan?",
    answer:
      "Idealnya H-3. Untuk pesanan di atas 200 box, sebaiknya H-7 supaya bahan dan tenaga bisa disiapkan.",
  },
  {
    question: "Area pengantarannya ke mana saja?",
    answer:
      "Dapur kami di Majalengka, dan kami mengantar ke seluruh Ciayumajakuning: Cirebon, Indramayu, Majalengka, dan Kuningan. Ongkos antar menyesuaikan jarak, tanyakan dulu lewat WhatsApp.",
  },
  {
    question: "Bagaimana cara pembayarannya?",
    answer:
      "DP 50% saat pesanan dikonfirmasi, sisanya dilunasi ketika pesanan diantar.",
  },
];
