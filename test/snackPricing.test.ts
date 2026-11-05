import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { spawn } from 'node:child_process';
import type { AddressInfo } from 'node:net';
import {
  snackKategori,
  snackRingkasan,
  defaultSnackTemplates,
  formatRupiah,
} from '../src/data/snack.ts';
import {
  buildSnackBoxCustomDetails,
  buildSnackBoxPackageName,
  buildSnackBoxWhatsAppMessage,
} from '../src/services/whatsapp/snackBoxMessage.ts';
import { company } from '../src/data/company.ts';
import { faqs } from '../src/data/faq.ts';
import { langkah } from '../src/data/konten.ts';

test('SSOT snack master: exactly 51 items across 6 categories', () => {
  assert.equal(snackRingkasan.totalPilihan, 51);
  assert.equal(snackRingkasan.totalKategori, 6);
  assert.equal(snackKategori.length, 6);

  const flatItems = snackKategori.flatMap((k) => k.items);
  assert.equal(flatItems.length, 51);
});

test('SSOT snack master: cheapest item is Rp1.000 (Air Mineral Cup & Kemasan)', () => {
  assert.equal(snackRingkasan.hargaTermurah, 1000);
  assert.equal(formatRupiah(snackRingkasan.hargaTermurah), 'Rp1.000');
});

test('SSOT snack master: all item prices match approved revised catalog', () => {
  const expectedPrices: Record<string, number> = {
    // Puff & Pastry (Tetap)
    'Kue Sus Vanilla': 3000,
    'Kue Sus Coklat': 3000,
    'Kue Sus Buah': 3500,
    'Pie Susu': 3000,
    'Pie Buah': 3500,
    'Bolen Pisang': 4000,
    'Roti Unyil': 4000,
    'Roti Goreng': 4000,

    // Aneka Cake (Revisi)
    'Putu Ayu': 3000,
    'Putu Ayu Gula Merah': 3000,
    'Bolu Jadul / Pandan': 3500,
    'Bolu Kukus Gula Merah': 3000,
    'Bolu Pisang': 3500,
    'Sarang Semut': 3500,

    // Kue Basah (Revisi)
    'Brownies': 3500,
    'Bolu Gulung': 3500,
    'Rainbow Keju': 4000,
    'Lapis Surabaya': 4000,
    'Banana Muffin': 3500,
    'Nona Manis': 3000,
    'Kue Lapis': 3000,
    'Talam': 3000,
    'Kue Lumpur': 3000,
    'Hunkwe Pisang': 3000,
    'Cantik Manis': 3000,
    'Dadar Gulung': 3000,
    'Kue Angku / Cikak': 3000,
    'Lumpur Surga': 3000,
    'Putri Mandi': 3000,
    'Sengkulun / Awug': 3000,

    // Aneka Puding (+1000)
    'Puding Gula Merah': 2500,
    'Jelly': 2500,
    'Puding Lumut': 3000,
    'Puding Kelapa Muda': 3000,
    'Puding Rainbow': 3000,
    'Puding Coklat Vla': 4000,
    'Puding Cappuccino': 3500,
    'Puding Buah': 4000,

    // Menu Asin (Revisi)
    'Buras': 3000,
    'Gandos / Lobak': 3000,
    'Lemper': 3500,
    'Risoles Sayur': 3500,
    'Risoles Mayo': 4000,
    'Pastel': 3500,
    'Martabak': 3500,
    'Semar Mendem': 3500,

    // Pelengkap (Revisi)
    'Kemasan': 1000,
    'Air Mineral Cup': 1000,
    'Kacang Atom dsb': 1500,
    'Jeruk': 2500,
    'Pisang': 1500,
  };

  const actualPrices: Record<string, number> = {};
  for (const cat of snackKategori) {
    for (const item of cat.items) {
      actualPrices[item.nama] = item.harga;
    }
  }

  assert.equal(Object.keys(actualPrices).length, 51);
  for (const [nama, harga] of Object.entries(expectedPrices)) {
    assert.equal(
      actualPrices[nama],
      harga,
      `Harga item "${nama}" harus Rp${harga}, didapat: ${actualPrices[nama]}`
    );
  }
});

test('SSOT default templates: Lemper Bakar Ayam replaced with Lemper Ayam in pkg-snack-premium', () => {
  const premium = defaultSnackTemplates.find((p) => p.id === 'pkg-snack-premium');
  assert.ok(premium, 'pkg-snack-premium must exist');

  // Check items list
  assert.ok(premium.items.includes('Lemper Ayam'), 'items must include "Lemper Ayam"');
  assert.ok(!premium.items.includes('Lemper Bakar Ayam'), 'items must not contain "Lemper Bakar Ayam"');

  // Check custom slots
  assert.ok(premium.custom_slots, 'custom_slots must exist');
  const slot0 = premium.custom_slots[0];
  const slot2 = premium.custom_slots[2];

  assert.ok(slot0.options.includes('Lemper Ayam'));
  assert.ok(!slot0.options.includes('Lemper Bakar Ayam'));

  assert.equal(slot2.default_item, 'Lemper Ayam');
  assert.ok(slot2.options.includes('Lemper Ayam'));
  assert.ok(!slot2.options.includes('Lemper Bakar Ayam'));

  // Ensure zero occurrences in entire JSON representation of pkg-snack-premium
  const premiumJson = JSON.stringify(premium);
  assert.ok(!premiumJson.includes('Lemper Bakar Ayam'));
});

test('WhatsApp generator: buildSnackBoxCustomDetails with item unit prices and summary', () => {
  const items = [
    { nama: 'Lemper', harga: 3500 },
    { nama: 'Putu Ayu', harga: 3000 },
    { nama: 'Risoles Mayo', harga: 4000 },
  ];

  const details = buildSnackBoxCustomDetails(items, {
    subtotal: 10500,
    total: 210000,
    boxCount: 20,
  });

  assert.ok(details.includes('• Item 1: Lemper (Rp3.500)'));
  assert.ok(details.includes('• Item 2: Putu Ayu (Rp3.000)'));
  assert.ok(details.includes('• Item 3: Risoles Mayo (Rp4.000)'));
  assert.ok(details.includes('• Harga per box: Rp10.500'));
  assert.ok(details.includes('• Estimasi total: Rp210.000 (20 box)'));
});

test('WhatsApp generator: buildSnackBoxCustomDetails handles string-only items gracefully', () => {
  const items = ['Kue Sus Vanilla', 'Lemper Ayam'];
  const details = buildSnackBoxCustomDetails(items);

  assert.equal(
    details,
    '• Item 1: Kue Sus Vanilla\n• Item 2: Lemper Ayam'
  );
});

test('WhatsApp generator: buildSnackBoxCustomDetails returns empty string for empty array', () => {
  assert.equal(buildSnackBoxCustomDetails([]), '');
});

test('WhatsApp generator: buildSnackBoxPackageName produces correct text', () => {
  assert.equal(buildSnackBoxPackageName(4), 'Custom Snack Box (4 item)');
});

test('WhatsApp generator: buildSnackBoxWhatsAppMessage generates complete payload with auto-subtotal and total', () => {
  const message = buildSnackBoxWhatsAppMessage({
    selectedItems: [
      { nama: 'Lemper', harga: 3500 },
      { nama: 'Putu Ayu', harga: 3000 },
    ],
    boxCount: 25,
    eventDate: '2026-11-20',
  });

  assert.ok(message.includes('Halo Dzanis Catering, saya ingin memesan:'));
  assert.ok(message.includes('- Paket: Custom Snack Box (2 item)'));
  assert.ok(message.includes('• Item 1: Lemper (Rp3.500)'));
  assert.ok(message.includes('• Item 2: Putu Ayu (Rp3.000)'));
  assert.ok(message.includes('• Harga per box: Rp6.500'));
  assert.ok(message.includes('• Estimasi total: Rp162.500 (25 box)'));
  assert.ok(message.includes('- Jumlah: 25 box'));
  assert.ok(message.includes('- Tanggal Acara: 2026-11-20'));
  assert.ok(message.includes('- Total Estimasi: Rp 162.500'));
});

test('Meta SEO: rakit-snack-box page uses formatRupiah for hargaTermurah', () => {
  const pagePath = path.resolve('src/pages/rakit-snack-box.astro');
  const content = fs.readFileSync(pagePath, 'utf-8');

  assert.ok(
    content.includes('formatRupiah(snackRingkasan.hargaTermurah)'),
    'rakit-snack-box.astro must use formatRupiah(snackRingkasan.hargaTermurah)'
  );
  assert.ok(
    !content.includes('Rp${snackRingkasan.hargaTermurah}'),
    'rakit-snack-box.astro must not interpolate raw unformatted number'
  );
});

test('Terms of service: DP requirement updated to 25% across company, FAQ, and Cara Pesan', () => {
  // 1. company data
  assert.equal(company.ketentuan.dpPersen, 25);

  // 2. FAQ
  const paymentFaq = faqs.find((f) => f.question.includes('pembayaran'));
  assert.ok(paymentFaq, 'Payment FAQ must exist');
  assert.ok(paymentFaq.answer.includes('DP 25%'), 'FAQ answer must state DP 25%');
  assert.ok(!paymentFaq.answer.includes('DP 50%'), 'FAQ answer must not state DP 50%');

  // 3. Langkah cara pesan
  const dpStep = langkah.find((l) => l.judul.includes('DP'));
  assert.ok(dpStep, 'DP step must exist');
  assert.ok(dpStep.judul.includes('25%'), 'Step title must state 25%');
  assert.ok(!dpStep.judul.includes('50%'), 'Step title must not state 50%');
  assert.ok(dpStep.deskripsi.includes('DP 25%'), 'Step description must state DP 25%');
  assert.ok(!dpStep.deskripsi.includes('DP 50%'), 'Step description must not state DP 50%');
});

test('WhatsApp generator: handles null, undefined, and malformed items gracefully without crashing', () => {
  const malformedItems = [
    null as any,
    undefined as any,
    { nama: 'Lemper', harga: 3500 },
    { name: 'Putu Ayu', price: 3000 },
    { nama: 'Item Tanpa Harga' },
    { nama: 'Item NaN', harga: NaN },
  ];

  const details = buildSnackBoxCustomDetails(malformedItems);
  assert.ok(details.includes('• Item 1: Lemper (Rp3.500)'));
  assert.ok(details.includes('• Item 2: Putu Ayu (Rp3.000)'));
  assert.ok(details.includes('• Item 3: Item Tanpa Harga'));
  assert.ok(details.includes('• Item 4: Item NaN'));
  assert.ok(!details.includes('RpNaN'), 'Must not format NaN as RpNaN');

  const message = buildSnackBoxWhatsAppMessage({
    selectedItems: malformedItems,
    boxCount: 20,
  });
  assert.ok(message.includes('• Item 1: Lemper (Rp3.500)'));
});

test('WhatsApp generator: auto-computes subtotal when called without options', () => {
  const items = [
    { nama: 'Lemper', harga: 3500 },
    { nama: 'Putu Ayu', harga: 3000 },
  ];

  const details = buildSnackBoxCustomDetails(items);
  assert.ok(details.includes('• Item 1: Lemper (Rp3.500)'));
  assert.ok(details.includes('• Item 2: Putu Ayu (Rp3.000)'));
  assert.ok(details.includes('• Harga per box: Rp6.500'));
});

test('WhatsApp generator: auto-computes subtotal and total when only boxCount is passed in options', () => {
  const items = [
    { nama: 'Lemper', harga: 3500 },
    { nama: 'Putu Ayu', harga: 3000 },
  ];

  const details = buildSnackBoxCustomDetails(items, { boxCount: 20 });
  assert.ok(details.includes('• Harga per box: Rp6.500'));
  assert.ok(details.includes('• Estimasi total: Rp130.000 (20 box)'));
});

test('Interactive Headless Chrome: /rakit-snack-box/ custom builder calculation and OrderModal prefill', async () => {
  const distDir = path.resolve('dist');
  assert.ok(fs.existsSync(distDir), 'dist must exist, run build first');

  const server = http.createServer((req, res) => {
    let reqPath = (req.url || '/').split('?')[0];
    if (reqPath.endsWith('/')) reqPath += 'index.html';
    let filePath = path.join(distDir, reqPath);
    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
      filePath = path.join(filePath, 'index.html');
    }
    if (!fs.existsSync(filePath)) {
      res.statusCode = 404;
      return res.end('Not found');
    }
    const ext = path.extname(filePath);
    const mimeMap: Record<string, string> = {
      '.html': 'text/html',
      '.css': 'text/css',
      '.js': 'application/javascript',
      '.png': 'image/png',
      '.svg': 'image/svg+xml',
    };
    res.setHeader('Content-Type', mimeMap[ext] || 'application/octet-stream');
    fs.createReadStream(filePath).pipe(res);
  });

  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = (server.address() as AddressInfo).port;
  const baseUrl = `http://127.0.0.1:${port}/rakit-snack-box/`;

  const chromeDebugPort = port + 1400;
  const chrome = spawn('google-chrome', [
    '--headless=new',
    `--remote-debugging-port=${chromeDebugPort}`,
    `--user-data-dir=/tmp/chrome-snack-interaction-${port}`,
    '--window-size=1280,800',
    baseUrl,
  ]);

  await new Promise((r) => setTimeout(r, 1500));

  try {
    const listRes = await fetch(`http://127.0.0.1:${chromeDebugPort}/json`);
    const tabs = await listRes.json();
    const targetTab = tabs.find((t: any) => t.type === 'page' && t.url.includes('rakit-snack-box')) || tabs[0];
    const ws = new WebSocket(targetTab.webSocketDebuggerUrl);

    const result = await new Promise<any>((resolve, reject) => {
      ws.onopen = () => {
        ws.send(JSON.stringify({ id: 1, method: 'Page.enable' }));
      };

      ws.onmessage = (msg: any) => {
        const data = JSON.parse(msg.data.toString());
        if (data.id === 1) {
          setTimeout(() => {
            ws.send(
              JSON.stringify({
                id: 2,
                method: 'Runtime.evaluate',
                params: {
                  expression: `
                  (() => {
                    // 1. Select 3 checkboxes
                    const cbs = Array.from(document.querySelectorAll('input[name="snack-choice"]'));
                    const susVanilla = cbs.find(c => c.value === 'Kue Sus Vanilla');
                    const susCoklat = cbs.find(c => c.value === 'Kue Sus Coklat');
                    const pieSusu = cbs.find(c => c.value === 'Pie Susu');

                    if (susVanilla) { susVanilla.checked = true; susVanilla.dispatchEvent(new Event('change', { bubbles: true })); }
                    if (susCoklat) { susCoklat.checked = true; susCoklat.dispatchEvent(new Event('change', { bubbles: true })); }
                    if (pieSusu) { pieSusu.checked = true; pieSusu.dispatchEvent(new Event('change', { bubbles: true })); }

                    // Check live UI displays
                    const itemCount = document.getElementById('summary-item-count')?.textContent?.trim();
                    const subtotalText = document.getElementById('summary-subtotal')?.textContent?.trim();
                    const totalText = document.getElementById('summary-total')?.textContent?.trim();

                    // Test Large Order notice on Snack Builder (>500 box)
                    const boxInput = document.getElementById('builder-box-count');
                    let snackNoticeVisibleOn600 = false;
                    let snackWaHrefOn600 = '';
                    let snackWaLinkHeight = 0;
                    let snackNoticeStillVisibleAfterBlur = false;
                    let orderBlockedOnLarge = false;
                    let snackNoticeHiddenOnMinus = false;
                    let snackNoticeHiddenOn25 = false;

                    if (boxInput) {
                      boxInput.value = '600';
                      boxInput.dispatchEvent(new Event('input', { bubbles: true }));
                      snackNoticeVisibleOn600 = !document.getElementById('snack-builder-large-notice')?.classList.contains('hidden');
                      snackWaHrefOn600 = document.getElementById('snack-builder-wa-admin-link')?.getAttribute('href') || '';
                      snackWaLinkHeight = document.getElementById('snack-builder-wa-admin-link')?.getBoundingClientRect().height || 0;

                      // Blur clamps to 500, but notice must remain visible
                      boxInput.dispatchEvent(new Event('blur', { bubbles: true }));
                      snackNoticeStillVisibleAfterBlur = !document.getElementById('snack-builder-large-notice')?.classList.contains('hidden');

                      // Try clicking order button while in large order mode -> must block opening modal
                      const testOrderBtn = document.getElementById('builder-order-btn');
                      testOrderBtn?.click();
                      orderBlockedOnLarge = !document.getElementById('order-modal')?.hasAttribute('open');

                      // Click minus button -> must dismiss large order mode
                      const minusBtn = document.getElementById('builder-box-minus');
                      minusBtn?.click();
                      snackNoticeHiddenOnMinus = document.getElementById('snack-builder-large-notice')?.classList.contains('hidden');

                      // Set box count to 25
                      boxInput.value = '25';
                      boxInput.dispatchEvent(new Event('input', { bubbles: true }));
                      snackNoticeHiddenOn25 = document.getElementById('snack-builder-large-notice')?.classList.contains('hidden');
                    }

                    const subtotalAfterBoxChange = document.getElementById('summary-subtotal')?.textContent?.trim();
                    const totalAfterBoxChange = document.getElementById('summary-total')?.textContent?.trim();

                    // Click order button
                    const orderBtn = document.getElementById('builder-order-btn');
                    orderBtn?.click();

                    // Modal check
                    const modal = document.getElementById('order-modal');
                    const isModalOpen = modal?.hasAttribute('open');
                    const displayPackage = document.getElementById('display-package-name')?.textContent?.trim();
                    const displayCustom = document.getElementById('display-custom-details')?.textContent?.trim();
                    const hiddenPackage = document.getElementById('input-package-name')?.value;
                    const hiddenCustom = document.getElementById('input-custom-details')?.value;
                    const portionInput = document.getElementById('portion-count')?.value;

                    return JSON.stringify({
                      itemCount,
                      subtotalText,
                      totalText,
                      snackNoticeVisibleOn600,
                      snackWaHrefOn600,
                      snackWaLinkHeight,
                      snackNoticeStillVisibleAfterBlur,
                      orderBlockedOnLarge,
                      snackNoticeHiddenOnMinus,
                      snackNoticeHiddenOn25,
                      subtotalAfterBoxChange,
                      totalAfterBoxChange,
                      isModalOpen,
                      displayPackage,
                      displayCustom,
                      hiddenPackage,
                      hiddenCustom,
                      portionInput
                    });
                  })()
                  `,
                },
              })
            );
          }, 600);
        }

        if (data.id === 2) {
          if (data.result.exceptionDetails) {
            reject(new Error(JSON.stringify(data.result.exceptionDetails)));
          } else {
            resolve(JSON.parse(data.result.result.value));
          }
        }
      };

      ws.onerror = (err) => reject(err);
    });

    assert.equal(result.itemCount, '3 macam');
    assert.equal(result.subtotalText, 'Rp9.000'); // 3000 + 3000 + 3000
    assert.equal(result.totalText, 'Rp180.000'); // 9000 * 20

    // Snack Builder Large Order Notice (>500 Box)
    assert.equal(result.snackNoticeVisibleOn600, true, 'Snack builder large order notice must show when boxCount is 600');
    assert.ok(result.snackWaHrefOn600.includes('600%20box'), 'Snack builder WA link must include 600 box');
    assert.ok(result.snackWaHrefOn600.includes('6281324383858'), 'Snack builder WA link must use SSOT number');
    assert.ok(result.snackWaLinkHeight >= 44, `Snack builder WA CTA button height must be >= 44px (actual: ${result.snackWaLinkHeight})`);
    assert.equal(result.snackNoticeStillVisibleAfterBlur, true, 'Snack builder notice must remain visible after blur');
    assert.equal(result.orderBlockedOnLarge, true, 'Clicking order button must be blocked while large order notice is active');
    assert.equal(result.snackNoticeHiddenOnMinus, true, 'Clicking minus button when at maxBoxes dismisses large order notice');
    assert.equal(result.snackNoticeHiddenOn25, true, 'Snack builder large order notice must hide when boxCount returns to 25');

    assert.equal(result.subtotalAfterBoxChange, 'Rp9.000');
    assert.equal(result.totalAfterBoxChange, 'Rp225.000'); // 9000 * 25
    assert.equal(result.isModalOpen, true, 'OrderModal must open after clicking builder-order-btn');
    assert.equal(result.displayPackage, 'Custom Snack Box (3 item)');
    assert.equal(result.hiddenPackage, 'Custom Snack Box (3 item)');
    assert.equal(result.portionInput, '25');

    assert.ok(result.displayCustom.includes('• Item 1: Kue Sus Vanilla (Rp3.000)'));
    assert.ok(result.displayCustom.includes('• Item 2: Kue Sus Coklat (Rp3.000)'));
    assert.ok(result.displayCustom.includes('• Item 3: Pie Susu (Rp3.000)'));
    assert.ok(result.displayCustom.includes('• Harga per box: Rp9.000'));
    assert.ok(result.displayCustom.includes('• Estimasi total: Rp225.000 (25 box)'));
    assert.equal(result.hiddenCustom, result.displayCustom);
  } finally {
    chrome.kill();
    server.close();
  }
});
