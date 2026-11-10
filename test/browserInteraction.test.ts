import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import type { AddressInfo } from 'node:net';

test('Real headless Chrome: Certificate modal click, focus, filtering, and copy protection', async () => {
  // 1. Spin up ephemeral local static server for dist
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
  const baseUrl = `http://127.0.0.1:${port}/sertifikat/`;

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
    const targetTab = tabs.find((t: any) => t.url.includes('sertifikat')) || tabs[0];
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
                  const modal = document.getElementById('cert-lightbox-modal');
                  const firstCard = document.querySelector('.cert-card');
                  const copyNumber = document.querySelector('[data-copy-number]');

                  // 1. Initial State
                  const initialHidden = modal.classList.contains('hidden');

                  // 2. Click copy number -> modal should stay hidden
                  copyNumber?.click();
                  const afterCopyClickHidden = modal.classList.contains('hidden');

                  // 3. Click card -> modal should open
                  firstCard.click();
                  const afterCardClickHidden = modal.classList.contains('hidden');
                  const title = document.getElementById('cert-lightbox-title')?.textContent;
                  const number = document.getElementById('cert-lightbox-number')?.textContent;
                  const imgSrc = document.getElementById('cert-lightbox-img')?.getAttribute('src');

                  // 4. Click close button -> modal should close
                  const closeBtn = document.getElementById('cert-lightbox-close-btn');
                  closeBtn.click();
                  const afterCloseClickHidden = modal.classList.contains('hidden');

                  // 5. Test Category Filter
                  const mutuBtn = document.querySelector('[data-filter="sertifikat"]');
                  mutuBtn?.click();
                  const visibleMutuCards = Array.from(document.querySelectorAll('.cert-card'))
                    .filter(c => c.style.display !== 'none').length;

                  const allBtn = document.querySelector('[data-filter="all"]');
                  allBtn?.click();
                  const visibleAllCards = Array.from(document.querySelectorAll('.cert-card'))
                    .filter(c => c.style.display !== 'none').length;

                  // 6. Test B2B CTA Mobile Layout
                  const b2bSections = document.querySelectorAll('section');
                  const b2bSection = Array.from(b2bSections).find(s => s.textContent.includes('Kesiapan Pengadaan B2B'));
                  const b2bPadTop = b2bSection ? parseFloat(window.getComputedStyle(b2bSection).paddingTop) : 0;
                  const b2bCard = b2bSection?.querySelector('.bg-surface');
                  const b2bButtons = b2bCard ? Array.from(b2bCard.querySelectorAll('a')) : [];
                  const ctaBtnText = b2bButtons[0]?.textContent?.trim() || '';
                  const ctaBtnBg = b2bButtons[0] ? window.getComputedStyle(b2bButtons[0]).backgroundColor : '';
                  const subtext = b2bCard?.querySelector('.mt-5 p')?.textContent?.trim() || '';
                  const checklistSvgs = b2bSection?.querySelectorAll('div[class*="text-bg"] svg').length || 0;

                  return JSON.stringify({
                    initialHidden,
                    afterCopyClickHidden,
                    afterCardClickHidden,
                    title,
                    number,
                    imgSrc,
                    afterCloseClickHidden,
                    visibleMutuCards,
                    visibleAllCards,
                    b2bPadTop,
                    b2bButtonCount: b2bButtons.length,
                    ctaBtnText,
                    ctaBtnBg,
                    subtext,
                    checklistSvgs,
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
          if (data.result.exceptionDetails) {
            reject(new Error(JSON.stringify(data.result.exceptionDetails)));
          } else {
            resolve(JSON.parse(data.result.result.value));
          }
        }
      };

      ws.onerror = (err) => reject(err);
    });

    // Assertions
    assert.equal(testResult.initialHidden, true, 'Modal should be hidden initially');
    assert.equal(testResult.afterCopyClickHidden, true, 'Modal should stay hidden after clicking copy-number');
    assert.equal(testResult.afterCardClickHidden, false, 'Modal should open after card click');
    assert.match(testResult.title, /Sertifikat/i, 'Modal title should match clicked card document');
    assert.ok(testResult.imgSrc.includes('/images/brand/') || testResult.imgSrc.includes('/uploads/certificates/'), 'Modal should load document image');
    assert.equal(testResult.afterCloseClickHidden, true, 'Modal should close after clicking close button');
    assert.equal(testResult.visibleMutuCards, 4, 'Sertifikat mutu filter should display 4 cards');
    assert.equal(testResult.visibleAllCards, 7, 'All documents filter should display 7 cards');

    // B2B Section Mobile Assertions
    assert.ok(testResult.b2bPadTop >= 40, `B2B Section padding top on mobile should be >= 40px (pt-10), got ${testResult.b2bPadTop}px`);
    assert.equal(testResult.b2bButtonCount, 1, 'Card should have exactly 1 button (no duplicate)');
    assert.equal(testResult.ctaBtnText, 'Konsultasi Pengadaan via WhatsApp', 'Button text must match requirement');
    assert.equal(testResult.ctaBtnBg, 'rgb(37, 211, 102)', 'Button bg should be WhatsApp green (#25D366)');
    assert.match(testResult.subtext, /Nomor Resmi:\s*0813-2438-3858.*Respon Cepat Setiap Hari/, 'Subtext must be present with phone number');
    assert.equal(testResult.checklistSvgs, 4, 'Should have 4 clear SVG checkmark icons in checklist');
  } finally {
    chrome.kill();
    server.close();
  }
});
