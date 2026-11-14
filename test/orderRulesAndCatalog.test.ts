import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import type { AddressInfo } from 'node:net';
import {
  DAFTAR_PAKET,
  POOL_LAUK_23K,
  POOL_LAUK_25K_28K,
} from '../src/data/paket.ts';
import { isWeekend, getMinOrderByDate } from '../src/utils/date.ts';
import { clampQuantity } from '../src/utils/pricing.ts';
import { company } from '../src/data/company.ts';
import { faqs } from '../src/data/faq.ts';
import { langkah } from '../src/data/konten.ts';
import { normalizePackage } from '../src/services/api/menuService.ts';
import { buildOrderModalWhatsAppMessage } from '../src/services/whatsapp/orderModalMessage.ts';
import { buildNasiKotakWhatsAppMessage } from '../src/services/whatsapp/nasiKotakMessage.ts';
import {
  buildLargeOrderWhatsAppMessage,
  buildLargeOrderWhatsAppUrl,
} from '../src/services/whatsapp/largeOrderMessage.ts';
import { waPhoneNumber } from '../src/data/company.ts';
import { generateProductSchema, generateFoodEstablishmentSchema } from '../src/utils/schema.ts';

test('SSOT DAFTAR_PAKET: contains exactly 4 packages with correct properties', () => {
  assert.equal(DAFTAR_PAKET.length, 4, 'DAFTAR_PAKET must have exactly 4 packages');

  const slugs = DAFTAR_PAKET.map((p) => p.slug);
  assert.deepEqual(
    slugs,
    [
      'paket-hemat-20k',
      'paket-favorit-23k',
      'paket-spesial-25k',
      'paket-ayam-kampung-28k',
    ],
    'Package slugs must match the 4 approved packages'
  );

  // 1. Paket Hemat 20k
  const p20k = DAFTAR_PAKET.find((p) => p.slug === 'paket-hemat-20k');
  assert.ok(p20k);
  assert.equal(p20k.harga, 20000);
  assert.equal(p20k.minOrder, 20);
  assert.equal(p20k.minOrderWeekend, 40);
  assert.equal(p20k.maxOrder, 500);
  assert.equal(p20k.canSelectMainMenu, false);
  assert.equal(p20k.sideDishesSelectMin, 0);
  assert.equal(p20k.sideDishesSelectMax, 0);

  // 2. Paket Favorit 23k
  const p23k = DAFTAR_PAKET.find((p) => p.slug === 'paket-favorit-23k');
  assert.ok(p23k);
  assert.equal(p23k.harga, 23000);
  assert.equal(p23k.minOrder, 20);
  assert.equal(p23k.minOrderWeekend, 40);
  assert.equal(p23k.maxOrder, 500);
  assert.equal(p23k.canSelectMainMenu, true);
  assert.equal(p23k.sideDishesSelectMin, 3);
  assert.equal(p23k.sideDishesSelectMax, 3);
  assert.deepEqual(p23k.selectableSideDishes, POOL_LAUK_23K);
  assert.deepEqual(p23k.menuUtama, ['Ayam Bakar', 'Ayam Goreng']);
  assert.deepEqual(p23k.selectableMainMenus, ['Ayam Bakar', 'Ayam Goreng']);

  // 3. Paket Spesial 25k
  const p25k = DAFTAR_PAKET.find((p) => p.slug === 'paket-spesial-25k');
  assert.ok(p25k);
  assert.equal(p25k.harga, 25000);
  assert.equal(p25k.minOrder, 20);
  assert.equal(p25k.minOrderWeekend, 40);
  assert.equal(p25k.maxOrder, 500);
  assert.equal(p25k.canSelectMainMenu, true);
  assert.equal(p25k.sideDishesSelectMin, 2);
  assert.equal(p25k.sideDishesSelectMax, 3);
  assert.deepEqual(p25k.selectableSideDishes, POOL_LAUK_25K_28K);

  // 4. Paket Ayam Kampung 28k (New Package)
  const p28k = DAFTAR_PAKET.find((p) => p.slug === 'paket-ayam-kampung-28k');
  assert.ok(p28k);
  assert.equal(p28k.harga, 28000);
  assert.equal(p28k.minOrder, 20);
  assert.equal(p28k.minOrderWeekend, 40);
  assert.equal(p28k.maxOrder, 500);
  assert.equal(p28k.canSelectMainMenu, true);
  assert.equal(p28k.sideDishesSelectMin, 2);
  assert.equal(p28k.sideDishesSelectMax, 3);
  assert.deepEqual(p28k.selectableSideDishes, POOL_LAUK_25K_28K);
  assert.equal(p28k.foto, '/images/menu/paket-25k.webp');
  assert.equal(p28k.fotoAlt, 'Paket katering nasi kotak ayam kampung Dzanis Catering Ciayumajakuning');
});

test('Master Pool Constants: verify item counts and pool content', () => {
  assert.equal(POOL_LAUK_23K.length, 9, 'POOL_LAUK_23K must have 9 items');
  assert.ok(POOL_LAUK_23K.includes('Bihun goreng'));
  assert.ok(POOL_LAUK_23K.includes('Soun'));
  assert.ok(POOL_LAUK_23K.includes('Capcay'));
  assert.ok(POOL_LAUK_23K.includes('Waluh jagung manis'));

  assert.equal(POOL_LAUK_25K_28K.length, 7, 'POOL_LAUK_25K_28K must have 7 items');
  assert.ok(POOL_LAUK_25K_28K.includes('Buncis jagung muda'));
  assert.ok(POOL_LAUK_25K_28K.includes('Jagung muda (putren)'));
  assert.ok(POOL_LAUK_25K_28K.includes('Toge jambal roti'));
  assert.ok(POOL_LAUK_25K_28K.includes('Pokcoy bawang putih'));
  assert.ok(POOL_LAUK_25K_28K.includes('Sambal goreng ati / jando'));
});

test('Pure Util isWeekend: properly differentiates weekday vs weekend', () => {
  // Monday: 2026-11-02
  assert.equal(isWeekend('2026-11-02'), false);
  // Wednesday: 2026-11-04
  assert.equal(isWeekend('2026-11-04'), false);
  // Friday: 2026-11-06
  assert.equal(isWeekend('2026-11-06'), false);

  // Saturday: 2026-11-07
  assert.equal(isWeekend('2026-11-07'), true);
  // Sunday: 2026-11-08
  assert.equal(isWeekend('2026-11-08'), true);

  // Invalid or empty input
  assert.equal(isWeekend(''), false);
  assert.equal(isWeekend('invalid-date'), false);
});

test('Pure Util getMinOrderByDate: returns 20 for weekday and 40 for weekend', () => {
  // Weekday defaults to 20
  assert.equal(getMinOrderByDate('2026-11-02'), 20);
  assert.equal(getMinOrderByDate('2026-11-06'), 20);

  // Weekend returns 40
  assert.equal(getMinOrderByDate('2026-11-07'), 40);
  assert.equal(getMinOrderByDate('2026-11-08'), 40);

  // Undefined / empty fallback
  assert.equal(getMinOrderByDate(undefined), 20);
  assert.equal(getMinOrderByDate(''), 20);

  // Custom bounds
  assert.equal(getMinOrderByDate('2026-11-07', 25, 50), 50);
  assert.equal(getMinOrderByDate('2026-11-02', 25, 50), 25);
});

test('Pure Util clampQuantity: clamps within [minOrder, maxOrder] with default max 500', () => {
  // Below min
  assert.equal(clampQuantity(10), 20);
  assert.equal(clampQuantity(0), 20);
  assert.equal(clampQuantity(-5), 20);
  assert.equal(clampQuantity('abc'), 20);

  // Within range
  assert.equal(clampQuantity(20), 20);
  assert.equal(clampQuantity(50), 50);
  assert.equal(clampQuantity(500), 500);

  // Above max 500
  assert.equal(clampQuantity(501), 500);
  assert.equal(clampQuantity(1000), 500);
  assert.equal(clampQuantity('9999'), 500);

  // Custom min and max
  assert.equal(clampQuantity(30, 40, 300), 40);
  assert.equal(clampQuantity(350, 40, 300), 300);
});

test('Operational Policy SSOT: company, FAQ, and konten reflect 20 weekday, 40 weekend, max 500, DP 25%, and pelunasan', () => {
  // company.ketentuan
  assert.equal(company.ketentuan.minBox, 20);
  assert.equal(company.ketentuan.minBoxWeekend, 40);
  assert.equal(company.ketentuan.maxBox, 500);
  assert.equal(company.ketentuan.dpPersen, 25);
  assert.ok(company.ketentuan.pelunasan?.toLowerCase().includes('pelunasan'));

  // faqs
  const minOrderFaq = faqs.find((f) => f.question.includes('minimal'));
  assert.ok(minOrderFaq);
  assert.ok(minOrderFaq.answer.includes('20 box'));
  assert.ok(minOrderFaq.answer.includes('40 box'));
  assert.ok(minOrderFaq.answer.includes('500 box'));

  const paymentFaq = faqs.find((f) => f.question.includes('pembayaran'));
  assert.ok(paymentFaq);
  assert.ok(paymentFaq.answer.includes('DP 25%'));
  assert.ok(paymentFaq.answer.includes('pelunasan'));

  // konten langkah
  const step4 = langkah.find((l) => l.judul.includes('Diantar'));
  assert.ok(step4);
  assert.ok(step4.deskripsi.includes('pelunasan'));
  assert.ok(step4.deskripsi.includes('tempat pengantaran'));
});

test('ACL menuService normalizePackage: preserves minOrderWeekend and maxOrder from local master', () => {
  const normalized = normalizePackage({
    id: 'paket-ayam-kampung-28k',
    slug: 'paket-ayam-kampung-28k',
    name: 'Paket Ayam Kampung 28K',
    price_per_pax: 28000,
  });

  assert.equal(normalized.slug, 'paket-ayam-kampung-28k');
  assert.equal(normalized.minOrder, 20);
  assert.equal(normalized.minOrderWeekend, 40);
  assert.equal(normalized.maxOrder, 500);
  assert.equal(normalized.foto, '/images/menu/paket-25k.webp');
  assert.equal(normalized.sideDishesSelectMin, 2);
  assert.equal(normalized.sideDishesSelectMax, 3);
});

test('WhatsApp Generator: orderModalMessage formats date and includes DP 25% & pelunasan terms', () => {
  const msg = buildOrderModalWhatsAppMessage({
    packageName: 'Paket Ayam Kampung 28K',
    customDetails: '• Pilihan: Ayam Bakar Rujak',
    portionCount: 45,
    eventDate: '2026-11-07',
    customerName: 'Bapak Ahmad',
    customerAddress: 'Jalan Pemuda No. 10 Majalengka',
  });

  // Verify formatted Indonesian date
  assert.ok(msg.includes('Sabtu, 7 November 2026'), 'Date must be formatted in Indonesian');
  assert.ok(msg.includes('Jumlah: 45 box'));
  assert.ok(msg.includes('DP 25%'));
  assert.ok(msg.includes('pelunasan'));
});

test('WhatsApp Generator: nasiKotakMessage formats date and includes DP 25% & pelunasan terms', () => {
  const msg = buildNasiKotakWhatsAppMessage({
    packageName: 'Paket Favorit 23K',
    qty: 30,
    total: 30 * 23000,
    hasMenuSelection: true,
    orderMode: 'default',
    defaultMainMenu: 'Ayam Bakar',
    defaultSideDishes: ['Bihun goreng', 'Capcay', 'Sambal goreng kentang'],
    selectedEventDate: '2026-11-06',
  });

  assert.ok(msg.includes('Jumat, 6 November 2026'), 'Date must be formatted in Indonesian');
  assert.ok(msg.includes('Menu Utama: Ayam Bakar'), 'Must include simplified Ayam Bakar');
  assert.ok(msg.includes('Total estimasi: Rp 690.000.'));
  assert.ok(msg.includes('DP 25%'));
  assert.ok(msg.includes('pelunasan'));
});

test('Schema SEO: generateProductSchema and generateFoodEstablishmentSchema contain all 4 packages with maxValue 500', () => {
  const p28k = DAFTAR_PAKET.find((p) => p.slug === 'paket-ayam-kampung-28k')!;
  const productSchema = generateProductSchema(p28k) as any;

  assert.equal(productSchema['@type'], 'Product');
  assert.equal(productSchema.offers.price, 28000);
  assert.equal(productSchema.offers.eligibleQuantity.minValue, 20);
  assert.equal(productSchema.offers.eligibleQuantity.maxValue, 500);

  const foodEst = generateFoodEstablishmentSchema() as any;
  const nasiKotakSection = foodEst.hasMenu.hasMenuSection.find(
    (s: any) => s.name === 'Paket Nasi Kotak'
  );
  assert.ok(nasiKotakSection);
  assert.equal(nasiKotakSection.hasMenuItem.length, 4, 'Must have 4 menu items in Nasi Kotak section');

  for (const item of nasiKotakSection.hasMenuItem) {
    assert.equal(item.offers.eligibleQuantity.minValue, 20);
    assert.equal(item.offers.eligibleQuantity.maxValue, 500);
  }
});

test('SSOT Package Lauk: default lauk for each package is contained in its respective master pool and matches approved count', () => {
  const p23k = DAFTAR_PAKET.find((p) => p.slug === 'paket-favorit-23k')!;
  assert.equal(p23k.laukPendamping.length, 3);
  for (const item of p23k.laukPendamping) {
    assert.ok(POOL_LAUK_23K.includes(item), `23k lauk "${item}" must be in POOL_LAUK_23K`);
  }

  const p25k = DAFTAR_PAKET.find((p) => p.slug === 'paket-spesial-25k')!;
  assert.ok(p25k.laukPendamping.length >= 2 && p25k.laukPendamping.length <= 3);
  for (const item of p25k.laukPendamping) {
    assert.ok(POOL_LAUK_25K_28K.includes(item), `25k lauk "${item}" must be in POOL_LAUK_25K_28K`);
  }

  const p28k = DAFTAR_PAKET.find((p) => p.slug === 'paket-ayam-kampung-28k')!;
  assert.ok(p28k.laukPendamping.length >= 2 && p28k.laukPendamping.length <= 3);
  for (const item of p28k.laukPendamping) {
    assert.ok(POOL_LAUK_25K_28K.includes(item), `28k lauk "${item}" must be in POOL_LAUK_25K_28K`);
  }
});

test('WhatsApp Generator: largeOrderMessage formats consultation template for orders > 500 box', () => {
  const msgDefault = buildLargeOrderWhatsAppMessage();
  assert.ok(msgDefault.includes('Halo Dzanis Catering, saya ingin konsultasi pesanan katering skala besar (>500 box)'));
  assert.ok(msgDefault.includes('- Rencana Jumlah: >500 box'));

  const msgCustom = buildLargeOrderWhatsAppMessage({
    packageName: 'Paket Spesial 25k',
    portionCount: 750,
    eventDate: '2026-11-20',
    customerName: 'Siti Rahma',
  });
  assert.ok(msgCustom.includes('- Paket: Paket Spesial 25k'));
  assert.ok(msgCustom.includes('- Rencana Jumlah: 750 box'));
  assert.ok(msgCustom.includes('- Tanggal Acara: Jumat, 20 November 2026'));
  assert.ok(msgCustom.includes('- Nama Pemesan: Siti Rahma'));

  const url = buildLargeOrderWhatsAppUrl(waPhoneNumber, {
    packageName: 'Paket Ayam Kampung 28k',
    portionCount: 600,
  });
  assert.ok(url.startsWith('https://wa.me/6281324383858?text='));
  assert.ok(!url.includes('tel:'));
  assert.ok(url.includes('600%20box'));
});

test('Static Built HTML: contains large order callout notices with touch targets >= 44px', () => {
  const distDir = path.resolve('dist');
  assert.ok(fs.existsSync(distDir), 'dist must exist, run build first');

  const paketHtml = fs.readFileSync(path.join(distDir, 'paket/paket-ayam-kampung-28k/index.html'), 'utf-8');
  assert.ok(paketHtml.includes('id="package-large-order-notice"'));
  assert.ok(paketHtml.includes('id="package-wa-admin-link"'));
  assert.ok(paketHtml.includes('min-h-[44px]'));

  const indexHtml = fs.readFileSync(path.join(distDir, 'index.html'), 'utf-8');
  assert.ok(indexHtml.includes('id="order-modal-large-notice"'));
  assert.ok(indexHtml.includes('id="order-modal-wa-admin-link"'));

  const snackHtml = fs.readFileSync(path.join(distDir, 'rakit-snack-box/index.html'), 'utf-8');
  assert.ok(snackHtml.includes('id="snack-builder-large-notice"'));
  assert.ok(snackHtml.includes('id="snack-builder-wa-admin-link"'));
});

test('Static Built HTML: Kontrol Racik Menu oleh Admin (paket-23k aktif racik multi menu, paket-20k fixed)', () => {
  const distDir = path.resolve('dist');
  assert.ok(fs.existsSync(distDir), 'dist must exist, run build first');

  // Paket 20K (Hemat): can_customize = false (fixed bundling tanpa section racik)
  const p20kHtml = fs.readFileSync(path.join(distDir, 'paket/paket-hemat-20k/index.html'), 'utf-8');
  assert.ok(!p20kHtml.includes('id="section-pilihan-menu"'), 'Paket 20k tidak boleh memiliki section racik menu saat can_customize nonaktif');

  // Paket 23K (Favorit): can_customize = true (diaktifkan admin dengan 2 pilihan menu utama dipisahkan koma)
  const p23kHtml = fs.readFileSync(path.join(distDir, 'paket/paket-favorit-23k/index.html'), 'utf-8');
  assert.ok(p23kHtml.includes('id="section-pilihan-menu"'), 'Paket 23k harus memiliki section racik menu saat diaktifkan admin');
  assert.ok(p23kHtml.includes('value="Ayam Bakar"'), 'Paket 23k harus memiliki opsi menu utama Ayam Bakar');
  assert.ok(p23kHtml.includes('value="Ayam Goreng"'), 'Paket 23k harus memiliki opsi menu utama Ayam Goreng');
});

test('Real headless Chrome: /paket/paket-spesial-25k default selection, dynamic switch to Ayam Rica Kemangi, and OrderModal prefill', async () => {
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
  const baseUrl = `http://127.0.0.1:${port}/paket/paket-spesial-25k/`;

  const chromeDebugPort = port + 1000;
  const chrome = spawn('google-chrome', [
    '--headless=new',
    `--remote-debugging-port=${chromeDebugPort}`,
    `--user-data-dir=/tmp/chrome-test-p25k-${port}`,
    '--window-size=375,812',
    baseUrl,
  ]);

  await new Promise((r) => setTimeout(r, 1500));

  try {
    const listRes = await fetch(`http://127.0.0.1:${chromeDebugPort}/json`);
    const tabs = await listRes.json();
    const pageTabs = tabs.filter((t: any) => t.type === 'page');
    const targetTab = pageTabs.find((t: any) => t.url.includes('paket-spesial-25k')) || pageTabs[0] || tabs[0];
    const ws = new WebSocket(targetTab.webSocketDebuggerUrl);

    const testResult = await new Promise<any>((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error('Headless Chrome test for paket-spesial-25k timed out after 8s'));
      }, 8000);

      ws.onopen = () => {
        ws.send(JSON.stringify({ id: 1, method: 'Runtime.enable' }));
        setTimeout(() => {
          ws.send(
            JSON.stringify({
              id: 2,
              method: 'Runtime.evaluate',
              params: {
                expression: `
                (() => {
                  // 1. Initial State: default preset and radio
                  const defaultPresetBox = document.getElementById('default-preset-box');
                  const defaultPresetText = defaultPresetBox ? defaultPresetBox.textContent.trim() : '';
                  const checkedRadioInitial = document.querySelector('input[name="main-menu"]:checked');
                  const initialRadioValue = checkedRadioInitial ? checkedRadioInitial.value : '';

                  const waCheckoutBtn = document.getElementById('wa-checkout-btn');
                  const defaultWaMessage = waCheckoutBtn && waCheckoutBtn.dataset ? waCheckoutBtn.dataset.waMessage || '' : '';

                  window.alert = () => {};
                  // Set a valid event date (H+7) to avoid date validation alert on checkout click
                  const eventDateInput = document.getElementById('event-date-input');
                  if (eventDateInput) {
                    const futureD = new Date();
                    futureD.setDate(futureD.getDate() + 7);
                    eventDateInput.value = futureD.toISOString().split('T')[0];
                    eventDateInput.dispatchEvent(new Event('input', { bubbles: true }));
                    eventDateInput.dispatchEvent(new Event('change', { bubbles: true }));
                  }

                  // 2. Switch to Custom Mode (Racik Sendiri)
                  const btnOrderCustom = document.getElementById('btn-order-custom');
                  if (btnOrderCustom) btnOrderCustom.click();

                  const customCollapsible = document.getElementById('custom-menu-collapsible');
                  const isCustomOpen = customCollapsible ? customCollapsible.getAttribute('data-buka') === 'true' : false;
                  const summaryMainInitial = document.getElementById('menu-summary-main')?.textContent?.trim() || '';

                  // 3. Select Ayam Rica Kemangi
                  const radioAyamRica = document.querySelector('input[name="main-menu"][value="Ayam Rica Kemangi"]');
                  let switchedToRica = false;
                  if (radioAyamRica) {
                    radioAyamRica.checked = true;
                    radioAyamRica.dispatchEvent(new Event('change', { bubbles: true }));
                    switchedToRica = radioAyamRica.checked;
                  }

                  const summaryMainAfterRica = document.getElementById('menu-summary-main')?.textContent?.trim() || '';
                  const customWaMessage = waCheckoutBtn && waCheckoutBtn.dataset ? waCheckoutBtn.dataset.waMessage || '' : '';

                  // 4. Click Checkout to open OrderModal and inspect prefill
                  if (waCheckoutBtn) waCheckoutBtn.click();
                  const modal = document.getElementById('order-modal');
                  const isModalOpen = modal ? modal.hasAttribute('open') : false;
                  const modalCustomDetails = document.getElementById('display-custom-details')?.textContent || '';

                  // 5. Close modal, switch back to Default Mode, and verify reset
                  const modalCancelBtn = document.getElementById('modal-cancel-btn');
                  if (modalCancelBtn) modalCancelBtn.click();

                  const btnOrderDefault = document.getElementById('btn-order-default');
                  if (btnOrderDefault) btnOrderDefault.click();

                  const isCustomClosed = customCollapsible ? customCollapsible.getAttribute('data-buka') === 'false' : false;
                  const revertedWaMessage = waCheckoutBtn && waCheckoutBtn.dataset ? waCheckoutBtn.dataset.waMessage || '' : '';

                  return JSON.stringify({
                    defaultPresetText,
                    initialRadioValue,
                    defaultWaMessage,
                    isCustomOpen,
                    summaryMainInitial,
                    switchedToRica,
                    summaryMainAfterRica,
                    customWaMessage,
                    isModalOpen,
                    modalCustomDetails,
                    isCustomClosed,
                    revertedWaMessage,
                  });
                })()
                `,
              },
            })
          );
        }, 500);
      };

      ws.onmessage = (msg: any) => {
        try {
          const data = JSON.parse(msg.data.toString());
          if (data.id === 2) {
            clearTimeout(timeoutId);
            if (data.result?.exceptionDetails) {
              reject(new Error(JSON.stringify(data.result.exceptionDetails)));
            } else {
              resolve(JSON.parse(data.result.result.value));
            }
          }
        } catch (err) {
          clearTimeout(timeoutId);
          reject(err);
        }
      };
      ws.onerror = (err) => {
        clearTimeout(timeoutId);
        reject(err);
      };
    });

    // 1. Initial State Assertions
    assert.ok(testResult.defaultPresetText.includes('Menu Utama: Rolade Daging Sapi Olahan'), 'Default preset box must show Menu Utama: Rolade Daging Sapi Olahan');
    assert.equal(testResult.initialRadioValue, 'Rolade Daging Sapi Olahan', 'Initial checked radio value must be Rolade Daging Sapi Olahan');
    assert.ok(testResult.defaultWaMessage.includes('Menu Utama: Rolade Daging Sapi Olahan'), 'Default WA message must contain Menu Utama: Rolade Daging Sapi Olahan');

    // 2. Custom Mode Assertions
    assert.equal(testResult.isCustomOpen, true, 'Collapsible custom menu must open on click');
    assert.ok(testResult.summaryMainInitial.includes('Rolade Daging Sapi Olahan'), 'Custom summary initial menu must be Rolade Daging Sapi Olahan');

    // 3. Selection of Ayam Rica Kemangi Assertions
    assert.equal(testResult.switchedToRica, true, 'Ayam Rica Kemangi radio button must be checkable');
    assert.ok(testResult.summaryMainAfterRica.includes('Ayam Rica Kemangi'), 'Summary must update to Ayam Rica Kemangi');
    assert.ok(testResult.customWaMessage.includes('Menu Utama: Ayam Rica Kemangi'), 'Custom WA message must reflect Menu Utama: Ayam Rica Kemangi');

    // 4. Modal Prefill Assertions
    assert.equal(testResult.isModalOpen, true, 'OrderModal must open on waCheckoutBtn click');
    assert.ok(testResult.modalCustomDetails.includes('Ayam Rica Kemangi'), 'OrderModal custom details must be prefilled with Ayam Rica Kemangi');

    // 5. Reset to Default Mode Assertions
    assert.equal(testResult.isCustomClosed, true, 'Collapsible must close when switching back to default mode');
    assert.ok(testResult.revertedWaMessage.includes('Menu Utama: Rolade Daging Sapi Olahan'), 'Reverted WA message must contain Menu Utama: Rolade Daging Sapi Olahan');
  } finally {
    chrome.kill();
    server.close();
  }
});

test('Real headless Chrome: Package detail dynamic MoQ reactivity (20 vs 40), max 500 clamping, and modal order flow on /paket/paket-ayam-kampung-28k', async () => {
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
  const baseUrl = `http://127.0.0.1:${port}/paket/paket-ayam-kampung-28k/`;

  const chromeDebugPort = port + 1000;
  const chrome = spawn('google-chrome', [
    '--headless=new',
    `--remote-debugging-port=${chromeDebugPort}`,
    `--user-data-dir=/tmp/chrome-test-suite-${port}`,
    '--window-size=375,812',
    baseUrl,
  ]);

  await new Promise((r) => setTimeout(r, 1500));

  try {
    const listRes = await fetch(`http://127.0.0.1:${chromeDebugPort}/json`);
    const tabs = await listRes.json();
    const pageTabs = tabs.filter((t: any) => t.type === 'page');
    const targetTab = pageTabs.find((t: any) => t.url.includes('paket-ayam-kampung-28k')) || pageTabs[0] || tabs[0];
    const ws = new WebSocket(targetTab.webSocketDebuggerUrl);

    const testResult = await new Promise<any>((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error('Headless Chrome test for paket-ayam-kampung-28k timed out after 8s'));
      }, 8000);

      ws.onopen = () => {
        ws.send(JSON.stringify({ id: 1, method: 'Runtime.enable' }));
        setTimeout(() => {
          ws.send(
            JSON.stringify({
              id: 2,
              method: 'Runtime.evaluate',
              params: {
                expression: `
                (() => {
                  window.alert = () => {};
                  const portionInput = document.getElementById('portion-input');
                  const labelMin = document.getElementById('label-min-order');
                  const subtotalDisplay = document.getElementById('subtotal-display');
                  const eventDateInput = document.getElementById('event-date-input');
                  const waCheckoutBtn = document.getElementById('wa-checkout-btn');
                  const modal = document.getElementById('order-modal');

                  // 1. Initial State (No date selected yet)
                  const initialMinOrderLabel = labelMin?.textContent?.trim();
                  const initialPortion = portionInput?.value;
                  const initialSubtotal = subtotalDisplay?.textContent?.trim();

                  // 2. Change event date to Saturday (Weekend: 2026-11-21)
                  eventDateInput.value = '2026-11-21';
                  eventDateInput.dispatchEvent(new Event('input', { bubbles: true }));
                  eventDateInput.dispatchEvent(new Event('change', { bubbles: true }));

                  const weekendMinOrderLabel = labelMin?.textContent?.trim();
                  const weekendPortion = portionInput?.value;
                  const weekendSubtotal = subtotalDisplay?.textContent?.trim();

                  // 3. Change event date to Monday (Weekday: 2026-11-23)
                  eventDateInput.value = '2026-11-23';
                  eventDateInput.dispatchEvent(new Event('input', { bubbles: true }));
                  eventDateInput.dispatchEvent(new Event('change', { bubbles: true }));

                  const weekdayMinOrderLabel = labelMin?.textContent?.trim();
                  const weekdayPortionMinAttr = portionInput?.min;

                  // 3.5 Test Large Order notice on Package Order Bar (>500 box)
                  portionInput.value = '650';
                  portionInput.dispatchEvent(new Event('input', { bubbles: true }));
                  const pkgNoticeVisibleOn650 = !document.getElementById('package-large-order-notice')?.classList.contains('hidden');
                  const pkgWaHrefOn650 = document.getElementById('package-wa-admin-link')?.getAttribute('href') || '';
                  const pkgWaLinkHeight = document.getElementById('package-wa-admin-link')?.getBoundingClientRect().height || 0;

                  // Blur to simulate moving away -> clamps input to 500, but notice must stay visible
                  portionInput.dispatchEvent(new Event('blur', { bubbles: true }));
                  const pkgPortionClamped500 = portionInput.value;
                  const pkgNoticeVisibleAfterBlur = !document.getElementById('package-large-order-notice')?.classList.contains('hidden');

                  // Change event date to 2026-11-27 -> notice must still stay visible and WA link must update
                  eventDateInput.value = '2026-11-27';
                  eventDateInput.dispatchEvent(new Event('change', { bubbles: true }));
                  const pkgNoticeVisibleAfterDateChange = !document.getElementById('package-large-order-notice')?.classList.contains('hidden');
                  const pkgWaHrefAfterDateChange = document.getElementById('package-wa-admin-link')?.getAttribute('href') || '';

                  // Try clicking checkout while in large order mode -> must block opening modal
                  waCheckoutBtn.click();
                  const modalOpenBlockedOnLarge = modal?.hasAttribute('open');

                  // Revert to 40
                  portionInput.value = '40';
                  portionInput.dispatchEvent(new Event('input', { bubbles: true }));
                  const pkgNoticeHiddenOn40 = document.getElementById('package-large-order-notice')?.classList.contains('hidden');

                  // 4. Change back to Saturday and click waCheckoutBtn to open OrderModal
                  eventDateInput.value = '2026-11-21';
                  eventDateInput.dispatchEvent(new Event('change', { bubbles: true }));
                  waCheckoutBtn.click();

                  const modalOpen = modal?.hasAttribute('open');
                  const modalDateVal = document.getElementById('event-date')?.value;
                  const modalPortionVal = document.getElementById('portion-count')?.value;
                  const modalMinHintWeekend = document.getElementById('portion-min-hint')?.textContent?.trim();

                  // 5. Inside OrderModal, change date from Saturday to Monday (Weekday)
                  const modalEventDateInput = document.getElementById('event-date');
                  const modalPortionInput = document.getElementById('portion-count');
                  modalEventDateInput.value = '2026-11-23';
                  modalEventDateInput.dispatchEvent(new Event('change', { bubbles: true }));

                  const modalMinHintWeekday = document.getElementById('portion-min-hint')?.textContent?.trim();
                  const modalPortionMinAttr = modalPortionInput?.min;

                  // Change portion to 20 on weekday -> should be allowed
                  modalPortionInput.value = '20';
                  modalPortionInput.dispatchEvent(new Event('blur', { bubbles: true }));
                  const modalPortionAllowed20 = modalPortionInput.value;

                  // 6. Test Max Order 500 clamping, notice retention on name change, and submit block
                  modalPortionInput.value = '600';
                  modalPortionInput.dispatchEvent(new Event('input', { bubbles: true }));
                  const modalNoticeVisibleOn600 = !document.getElementById('order-modal-large-notice')?.classList.contains('hidden');
                  const modalWaHrefOn600 = document.getElementById('order-modal-wa-admin-link')?.getAttribute('href') || '';
                  const modalWaLinkHeight = document.getElementById('order-modal-wa-admin-link')?.getBoundingClientRect().height || 0;

                  modalPortionInput.dispatchEvent(new Event('blur', { bubbles: true }));
                  const modalPortionClamped500 = modalPortionInput.value;
                  const modalNoticeStillVisibleAfterBlur = !document.getElementById('order-modal-large-notice')?.classList.contains('hidden');

                  // Typing customer name must NOT hide notice and must update WA href
                  const modalNameInput = document.getElementById('customer-name');
                  if (modalNameInput) {
                    modalNameInput.value = 'Bpk Bambang';
                    modalNameInput.dispatchEvent(new Event('input', { bubbles: true }));
                  }
                  const modalNoticeVisibleAfterName = !document.getElementById('order-modal-large-notice')?.classList.contains('hidden');
                  const modalWaHrefAfterName = document.getElementById('order-modal-wa-admin-link')?.getAttribute('href') || '';

                  // Submitting form while in large order mode must block submit
                  const modalForm = document.getElementById('order-form');
                  const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
                  modalForm?.dispatchEvent(submitEvent);
                  const modalStillOpenAfterLargeSubmit = modal?.hasAttribute('open');

                  // Reducing portion back to 30 hides the notice
                  modalPortionInput.value = '30';
                  modalPortionInput.dispatchEvent(new Event('input', { bubbles: true }));
                  const modalNoticeHiddenOn30 = document.getElementById('order-modal-large-notice')?.classList.contains('hidden');

                  // 7. Verify WA checkout message contains DP 25% and pelunasan
                  const waMessageBeforeSubmit = waCheckoutBtn?.dataset?.waMessage || '';

                  return JSON.stringify({
                    initialMinOrderLabel,
                    initialPortion,
                    initialSubtotal,
                    weekendMinOrderLabel,
                    weekendPortion,
                    weekendSubtotal,
                    weekdayMinOrderLabel,
                    weekdayPortionMinAttr,
                    pkgNoticeVisibleOn650,
                    pkgWaHrefOn650,
                    pkgWaLinkHeight,
                    pkgPortionClamped500,
                    pkgNoticeVisibleAfterBlur,
                    pkgNoticeVisibleAfterDateChange,
                    pkgWaHrefAfterDateChange,
                    modalOpenBlockedOnLarge,
                    pkgNoticeHiddenOn40,
                    modalOpen,
                    modalDateVal,
                    modalPortionVal,
                    modalMinHintWeekend,
                    modalMinHintWeekday,
                    modalPortionMinAttr,
                    modalPortionAllowed20,
                    modalNoticeVisibleOn600,
                    modalWaHrefOn600,
                    modalWaLinkHeight,
                    modalPortionClamped500,
                    modalNoticeStillVisibleAfterBlur,
                    modalNoticeVisibleAfterName,
                    modalWaHrefAfterName,
                    modalStillOpenAfterLargeSubmit,
                    modalNoticeHiddenOn30,
                    waMessageBeforeSubmit,
                  });
                })()
              `,
              },
            })
          );
        }, 500);
      };

      ws.onmessage = (msg: any) => {
        const data = JSON.parse(msg.data.toString());
        if (data.id === 2) {
          clearTimeout(timeoutId);
          if (data.result.exceptionDetails) {
            reject(new Error(JSON.stringify(data.result.exceptionDetails)));
          } else {
            resolve(JSON.parse(data.result.result.value));
          }
        }
      };

      ws.onerror = (err) => {
        clearTimeout(timeoutId);
        reject(err);
      };
    });

    // Assertions for Real Browser Behavior
    assert.equal(testResult.initialMinOrderLabel, '20');
    assert.equal(testResult.initialPortion, '20');
    assert.equal(testResult.initialSubtotal.replace(/\u00a0/g, ' '), 'Rp 560.000');

    // Weekend update
    assert.equal(testResult.weekendMinOrderLabel, '40', 'MoQ label must update to 40 on weekend');
    assert.equal(testResult.weekendPortion, '40', 'Portion input must automatically increase to 40 on weekend');
    assert.equal(testResult.weekendSubtotal.replace(/\u00a0/g, ' '), 'Rp 1.120.000', 'Subtotal must recompute to 40 x 28.000 = Rp 1.120.000');

    // Weekday update
    assert.equal(testResult.weekdayMinOrderLabel, '20', 'MoQ label must return to 20 on weekday');
    assert.equal(testResult.weekdayPortionMinAttr, '20', 'Portion min attr must return to 20 on weekday');

    // Package Large Order Notice (>500 Box)
    assert.equal(testResult.pkgNoticeVisibleOn650, true, 'Package large order notice must show when portion is 650');
    assert.ok(testResult.pkgWaHrefOn650.includes('650%20box'), 'Package WA link must include 650 box');
    assert.ok(testResult.pkgWaHrefOn650.includes('6281324383858'), 'Package WA link must use SSOT number');
    assert.ok(testResult.pkgWaLinkHeight >= 44, `Package WA CTA button height must be >= 44px (actual: ${testResult.pkgWaLinkHeight})`);
    assert.equal(testResult.pkgPortionClamped500, '500', 'Package portion input must clamp to 500 on blur');
    assert.equal(testResult.pkgNoticeVisibleAfterBlur, true, 'Package notice must remain visible after blur');
    assert.equal(testResult.pkgNoticeVisibleAfterDateChange, true, 'Package notice must remain visible after changing event date');
    assert.ok(testResult.pkgWaHrefAfterDateChange.includes('27%20November%202026'), 'Package WA link must reflect updated event date');
    assert.equal(testResult.modalOpenBlockedOnLarge, false, 'waCheckoutBtn must block opening OrderModal while in large order mode');
    assert.equal(testResult.pkgNoticeHiddenOn40, true, 'Package large order notice must hide when portion returns to 40');

    // Modal Prefill & Open
    assert.equal(testResult.modalOpen, true, 'OrderModal must open when clicking waCheckoutBtn');
    assert.equal(testResult.modalDateVal, '2026-11-21', 'OrderModal date must prefill with selected date');
    assert.equal(testResult.modalPortionVal, '40', 'OrderModal portion must prefill with weekend 40');
    assert.ok(testResult.modalMinHintWeekend.includes('Akhir Pekan'), 'Modal hint must state Akhir Pekan on weekend date');

    // Modal Dynamic MoQ on Date Change (Bug fix verification)
    assert.ok(testResult.modalMinHintWeekday.includes('Hari Kerja'), 'Modal hint must update to Hari Kerja on weekday date');
    assert.equal(testResult.modalPortionMinAttr, '20', 'Modal portion input min attribute must become 20 on weekday date');
    assert.equal(testResult.modalPortionAllowed20, '20', 'Modal must allow 20 boxes on weekday date');

    // Modal Large Order Notice & Clamping to Max 500
    assert.equal(testResult.modalNoticeVisibleOn600, true, 'Modal large order notice must show when portion is 600');
    assert.ok(testResult.modalWaHrefOn600.includes('600%20box'), 'Modal WA link must include 600 box');
    assert.ok(testResult.modalWaHrefOn600.includes('6281324383858'), 'Modal WA link must use SSOT number');
    assert.ok(testResult.modalWaLinkHeight >= 44, `Modal WA CTA button height must be >= 44px (actual: ${testResult.modalWaLinkHeight})`);
    assert.equal(testResult.modalPortionClamped500, '500', 'Modal must clamp portion > 500 to 500 on blur');
    assert.equal(testResult.modalNoticeStillVisibleAfterBlur, true, 'Modal notice must remain visible after blur when value was > 500');
    assert.equal(testResult.modalNoticeVisibleAfterName, true, 'Modal notice must NOT disappear when typing customer name');
    assert.ok(testResult.modalWaHrefAfterName.includes('Bpk%20Bambang'), 'Modal WA link must reflect updated customer name');
    assert.equal(testResult.modalStillOpenAfterLargeSubmit, true, 'Form submit must be blocked when in large order mode');
    assert.equal(testResult.modalNoticeHiddenOn30, true, 'Modal notice must hide when portion returns to 30');

    // Terms in WA Message
    assert.ok(testResult.waMessageBeforeSubmit.includes('DP 25%'), 'WA message must include DP 25%');
    assert.ok(testResult.waMessageBeforeSubmit.includes('pelunasan'), 'WA message must include pelunasan');
  } finally {
    chrome.kill();
    server.close();
  }
});

