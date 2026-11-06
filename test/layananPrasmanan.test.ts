import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import type { AddressInfo } from 'node:net';
import { LAYANAN_PRASMANAN_SSOT } from '../src/data/layananLain.ts';

test('SSOT LAYANAN_PRASMANAN_SSOT contains complete clean editorial structure', () => {
  assert.equal(LAYANAN_PRASMANAN_SSOT.eyebrow, 'LAYANAN KHUSUS');
  assert.equal(LAYANAN_PRASMANAN_SSOT.heading, 'Layanan Prasmanan Kantor & Acara');
  assert.equal(LAYANAN_PRASMANAN_SSOT.harga, 'Rp 45.000');
  assert.ok(
    LAYANAN_PRASMANAN_SSOT.satuanHarga.includes('porsi') ||
    LAYANAN_PRASMANAN_SSOT.satuanHarga.includes('pax')
  );
  assert.equal(LAYANAN_PRASMANAN_SSOT.minOrder, 'Min. 50 Pax');
  assert.equal(LAYANAN_PRASMANAN_SSOT.gallery.length, 2);
  assert.equal(LAYANAN_PRASMANAN_SSOT.fasilitas.length, 3);
  assert.equal(LAYANAN_PRASMANAN_SSOT.menuPopuler.length, 4);
  assert.ok(LAYANAN_PRASMANAN_SSOT.waPreFilledMessage.includes('min. 50 pax'));
});

test('Built dist/index.html contains Layanan Prasmanan section with design system alignment', () => {
  const indexPath = path.resolve('dist/index.html');
  assert.ok(fs.existsSync(indexPath), 'dist/index.html should exist');
  const html = fs.readFileSync(indexPath, 'utf-8');

  // 1. Anchor validity
  assert.ok(html.includes('id="layanan"'), 'Anchor #layanan must be preserved');

  // 2. Eyebrow, heading, and subtitle (outside card)
  assert.ok(html.includes('LAYANAN KHUSUS'), 'Should render eyebrow text');
  assert.ok(
    html.includes('Layanan Prasmanan Kantor &amp; Acara') ||
    html.includes('Layanan Prasmanan Kantor & Acara'),
    'Should render heading'
  );
  assert.ok(
    html.includes('Solusi jamuan prasmanan higienis siap saji'),
    'Should render subtitle outside card'
  );

  // 3. Main surface card & internal grid
  assert.ok(html.includes('/images/layanan/prasmanan-kantor.webp'), 'Gallery must include prasmanan-kantor');
  assert.ok(html.includes('/images/layanan/wedding-catering.webp'), 'Gallery must include wedding-catering');
  assert.ok(
    html.includes('Setup Meja Kantor &amp; Rapat') ||
    html.includes('Setup Meja Kantor & Rapat'),
    'Should render photo label 1'
  );
  assert.ok(
    html.includes('Setup Meja Resepsi &amp; Acara') ||
    html.includes('Setup Meja Resepsi & Acara'),
    'Should render photo label 2'
  );

  // 4. Price & MoQ
  assert.ok(html.includes('Rp 45.000'), 'Should render price Rp 45.000');
  assert.ok(html.includes('Min. 50 Pax'), 'Should render min order badge');

  // 5. Fasilitas & Menu
  assert.ok(html.includes('Chafing Dish'), 'Should list chafing dish in facilities');
  assert.ok(
    html.includes('Piring Keramik &amp; Sendok Garpu') ||
    html.includes('Piring Keramik & Sendok Garpu'),
    'Should list tableware in facilities'
  );
  assert.ok(html.includes('Gurame Asam Manis'), 'Should list Gurame Asam Manis in popular menu');
  assert.ok(
    html.includes('Ayam Kampung (Opor / Goreng)') ||
    html.includes('Ayam Kampung'),
    'Should list Ayam Kampung in popular menu'
  );

  // 6. Pre-filled WhatsApp CTA
  assert.ok(html.includes('https://wa.me/6281324383858?text='), 'Should use SSOT WhatsApp link');
  assert.ok(html.includes('konsultasi%20paket%20prasmanan'), 'WhatsApp URL should have pre-filled message');
});

test('Real headless Chrome: Zero horizontal overflow on mobile viewports for homepage #layanan', async () => {
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
      '.webp': 'image/webp',
      '.svg': 'image/svg+xml',
    };
    res.setHeader('Content-Type', mimeMap[ext] || 'application/octet-stream');
    fs.createReadStream(filePath).pipe(res);
  });

  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = (server.address() as AddressInfo).port;
  const baseUrl = `http://127.0.0.1:${port}/#layanan`;

  const chromeDebugPort = port + 1400;
  const chrome = spawn('google-chrome', [
    '--headless=new',
    `--remote-debugging-port=${chromeDebugPort}`,
    `--user-data-dir=/tmp/chrome-layanan-viewport-${port}`,
    '--window-size=375,812',
    baseUrl,
  ]);

  await new Promise((r) => setTimeout(r, 1500));

  try {
    const listRes = await fetch(`http://127.0.0.1:${chromeDebugPort}/json`);
    const tabs = await listRes.json();
    const targetTab = tabs.find((t: any) => t.type === 'page') || tabs[0];
    const ws = new WebSocket(targetTab.webSocketDebuggerUrl);

    const testResult = await new Promise<any>((resolve, reject) => {
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
                  const el = document.getElementById('layanan');
                  const docWidth = document.documentElement.clientWidth;
                  const scrollWidth = document.documentElement.scrollWidth;
                  const elScrollWidth = el ? el.scrollWidth : 0;
                  return {
                    hasSection: Boolean(el),
                    docWidth,
                    scrollWidth,
                    hasOverflow: scrollWidth > docWidth
                  };
                })()
                `,
                returnByValue: true,
              },
            })
          );
        }, 500);
      };

      ws.onmessage = (msg) => {
        const data = JSON.parse(msg.data.toString());
        if (data.id === 2) {
          resolve(data.result?.result?.value);
        }
      };

      ws.onerror = reject;
      setTimeout(() => reject(new Error('Timeout evaluating viewport')), 5000);
    });

    assert.ok(testResult.hasSection, 'Section #layanan must exist in DOM');
    assert.strictEqual(
      testResult.hasOverflow,
      false,
      `Mobile viewport (375px) must not have horizontal overflow: docWidth=${testResult.docWidth}, scrollWidth=${testResult.scrollWidth}`
    );
  } finally {
    chrome.kill('SIGKILL');
    server.close();
  }
});
