import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import type { AddressInfo } from 'node:net';

test('Floating WA & Modal Coexistence: Static contract verification', () => {
  // 1. AGENTS.md must contain the invariant
  const agentsPath = path.resolve('AGENTS.md');
  const agentsContent = fs.readFileSync(agentsPath, 'utf8');
  assert.match(agentsContent, /Floating Actions & Modal Coexistence Invariant/);
  assert.match(agentsContent, /Floating Button Suppression on Modal Open/);
  assert.match(agentsContent, /Stacking Context & Z-Index Contract/);
  assert.match(agentsContent, /Focus & Interaction Isolation/);
  assert.match(agentsContent, /tabindex="-1"/);

  // 2. Footer.astro must have z-40, no z-[300], and touch-manipulation
  const footerPath = path.resolve('src/components/organic/Footer.astro');
  const footerContent = fs.readFileSync(footerPath, 'utf8');
  assert.match(footerContent, /id="floating-whatsapp-btn"[^>]*class="[^"]*\bz-40\b/);
  assert.doesNotMatch(footerContent, /id="floating-whatsapp-btn"[^>]*class="[^"]*z-\[300\]/);
  assert.match(footerContent, /id="floating-whatsapp-btn"[^>]*class="[^"]*\btouch-manipulation\b/);

  // 3. OrderModal.astro must have z-[120] and touch-manipulation on close icon
  const orderModalPath = path.resolve('src/components/interactive/OrderModal.astro');
  const orderModalContent = fs.readFileSync(orderModalPath, 'utf8');
  assert.match(orderModalContent, /id="order-modal"[^>]*class="[^"]*z-\[120\]/);
  assert.match(orderModalContent, /id="modal-close-icon"[^>]*class="[^"]*\btouch-manipulation\b/);
  assert.match(orderModalContent, /id="modal-close-icon"[^>]*class="[^"]*min-h-\[44px\]/);

  // 4. CertLightboxModal.astro must have z-[120], 44px min-h touch buttons
  const certModalPath = path.resolve('src/components/sertifikat/CertLightboxModal.astro');
  const certModalContent = fs.readFileSync(certModalPath, 'utf8');
  assert.match(certModalContent, /id="cert-lightbox-modal"[^>]*class="[^"]*z-\[120\]/);
  assert.match(certModalContent, /id="cert-lightbox-download-link"[^>]*class="[^"]*\btouch-manipulation\b/);
  assert.match(certModalContent, /id="cert-lightbox-footer-close-btn"[^>]*class="[^"]*\btouch-manipulation\b/);

  // 5. global.css must have suppression rule including :has pseudo-classes and .btn touch-action
  const cssPath = path.resolve('src/styles/global.css');
  const cssContent = fs.readFileSync(cssPath, 'utf8');
  assert.match(cssContent, /body\.modal-open #floating-whatsapp-btn/);
  assert.match(cssContent, /body:has\(dialog\[open\]\) #floating-whatsapp-btn/);
  assert.match(cssContent, /visibility:\s*hidden\s*!important/);
  assert.match(cssContent, /touch-action:\s*manipulation/);

  // 6. Zero hardcoded phone fallback in order-modal-controller.ts
  const controllerPath = path.resolve('src/scripts/order-modal-controller.ts');
  const controllerContent = fs.readFileSync(controllerPath, 'utf8');
  assert.match(controllerContent, /const phone = dialog\.dataset\.phone \|\| waPhoneNumber;/);
  assert.doesNotMatch(controllerContent, /const phone = dialog\.dataset\.phone \|\| '6281324383858';/);

  // 7. Zero hardcoded phone fallbacks in whatsappFormatter.ts and company.ts
  const formatterPath = path.resolve('src/utils/whatsappFormatter.ts');
  const formatterContent = fs.readFileSync(formatterPath, 'utf8');
  assert.match(formatterContent, /import \{ waPhoneNumber \} from '\.\.\/data\/company(\.ts)?'/);
  assert.doesNotMatch(formatterContent, /fallbackPhone = '6281324383858'/);
  assert.doesNotMatch(formatterContent, /phone: string = '6281324383858'/);

  const companyPath = path.resolve('src/data/company.ts');
  const companyContent = fs.readFileSync(companyPath, 'utf8');
  assert.doesNotMatch(companyContent, /phoneHref:\s*"https:\/\/wa\.me\/6281324383858/);
});

test('Floating WA Suppression in Real Headless Chrome (Mobile Viewport 375x812 - CertLightboxModal)', async () => {
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

  const chromeDebugPort = port + 1100;
  const chrome = spawn('google-chrome', [
    '--headless=new',
    `--remote-debugging-port=${chromeDebugPort}`,
    `--user-data-dir=/tmp/chrome-test-cert-${port}`,
    '--window-size=375,812',
    baseUrl,
  ]);

  await new Promise((r) => setTimeout(r, 1500));

  try {
    const listRes = await fetch(`http://127.0.0.1:${chromeDebugPort}/json`);
    const tabs = await listRes.json();
    const targetTab = tabs.find((t: any) => t.url.includes('sertifikat')) || tabs[0];
    const ws = new WebSocket(targetTab.webSocketDebuggerUrl);

    const result = await new Promise<any>((resolve, reject) => {
      ws.onopen = () => {
        ws.send(JSON.stringify({ id: 1, method: 'Runtime.enable' }));
        setTimeout(() => {
          ws.send(
            JSON.stringify({
              id: 2,
              method: 'Runtime.evaluate',
              params: {
                awaitPromise: true,
                expression: `
                (async () => {
                  const floatingWa = document.getElementById('floating-whatsapp-btn');
                  const modal = document.getElementById('cert-lightbox-modal');
                  const firstCard = document.querySelector('.cert-card');
                  const closeBtn = document.getElementById('cert-lightbox-close-btn');

                  // Initial state checks
                  const initialZIndex = window.getComputedStyle(floatingWa).zIndex;
                  const initialOpacity = window.getComputedStyle(floatingWa).opacity;
                  const initialVisibility = window.getComputedStyle(floatingWa).visibility;
                  const initialTabindex = floatingWa.getAttribute('tabindex');
                  const initialAriaHidden = floatingWa.getAttribute('aria-hidden');

                  // Open Modal
                  firstCard.click();
                  await new Promise((r) => setTimeout(r, 350));

                  const modalOpenDisplay = window.getComputedStyle(modal).display;
                  const modalZIndex = window.getComputedStyle(modal).zIndex;
                  const bodyHasModalOpen = document.body.classList.contains('modal-open');
                  const hasOpacity0Class = floatingWa.classList.contains('opacity-0');
                  const hasPointerEventsNoneClass = floatingWa.classList.contains('pointer-events-none');
                  const suppressedOpacity = window.getComputedStyle(floatingWa).opacity;
                  const suppressedVisibility = window.getComputedStyle(floatingWa).visibility;
                  const suppressedPointerEvents = window.getComputedStyle(floatingWa).pointerEvents;
                  const suppressedTabindex = floatingWa.getAttribute('tabindex');
                  const suppressedAriaHidden = floatingWa.getAttribute('aria-hidden');

                  // Verify modal buttons are visible and unobstructed
                  const downloadLink = document.getElementById('cert-lightbox-download-link');
                  const footerCloseBtn = document.getElementById('cert-lightbox-footer-close-btn');
                  const downloadLinkVisible = downloadLink && window.getComputedStyle(downloadLink).display !== 'none';
                  const footerCloseBtnVisible = footerCloseBtn && window.getComputedStyle(footerCloseBtn).display !== 'none';

                  // Close Modal
                  closeBtn.click();
                  await new Promise((r) => setTimeout(r, 350));

                  const modalClosedDisplay = window.getComputedStyle(modal).display;
                  const bodyHasModalOpenAfterClose = document.body.classList.contains('modal-open');
                  const restoredTabindex = floatingWa.getAttribute('tabindex');
                  const restoredAriaHidden = floatingWa.getAttribute('aria-hidden');
                  const restoredPointerEvents = window.getComputedStyle(floatingWa).pointerEvents;
                  const restoredOpacity = window.getComputedStyle(floatingWa).opacity;
                  const restoredVisibility = window.getComputedStyle(floatingWa).visibility;

                  return JSON.stringify({
                    initialZIndex,
                    initialOpacity,
                    initialVisibility,
                    initialTabindex,
                    initialAriaHidden,
                    modalOpenDisplay,
                    modalZIndex,
                    bodyHasModalOpen,
                    hasOpacity0Class,
                    hasPointerEventsNoneClass,
                    suppressedOpacity,
                    suppressedVisibility,
                    suppressedPointerEvents,
                    suppressedTabindex,
                    suppressedAriaHidden,
                    downloadLinkVisible,
                    footerCloseBtnVisible,
                    modalClosedDisplay,
                    bodyHasModalOpenAfterClose,
                    restoredTabindex,
                    restoredAriaHidden,
                    restoredPointerEvents,
                    restoredOpacity,
                    restoredVisibility,
                  });
                })()
                `,
              },
            })
          );
        }, 600);
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

    // 1. Initial State Assertions
    assert.equal(result.initialZIndex, '40', 'Floating WA initial z-index must be 40 per contract');
    assert.equal(result.initialOpacity, '1', 'Floating WA initial opacity should be 1');
    assert.equal(result.initialVisibility, 'visible', 'Floating WA initial visibility should be visible');
    assert.equal(result.initialTabindex, null, 'Floating WA initial tabindex should be null (focusable)');
    assert.equal(result.initialAriaHidden, null, 'Floating WA initial aria-hidden should be null');

    // 2. Modal Open State Assertions
    assert.equal(result.modalOpenDisplay, 'flex', 'Modal must be open and displayed as flex');
    assert.equal(result.modalZIndex, '120', 'Modal z-index must be 120 (higher than floating WA z-40)');
    assert.equal(result.bodyHasModalOpen, true, 'Body must have modal-open class when modal is open');
    assert.equal(result.suppressedOpacity, '0', 'Floating WA opacity must be 0 when modal is open');
    assert.equal(result.suppressedVisibility, 'hidden', 'Floating WA visibility must be hidden when modal is open');
    assert.equal(result.suppressedPointerEvents, 'none', 'Floating WA pointer-events must be none when modal is open');
    assert.equal(result.suppressedTabindex, '-1', 'Floating WA tabindex must be -1 when modal is open');
    assert.equal(result.suppressedAriaHidden, 'true', 'Floating WA aria-hidden must be true when modal is open');
    assert.equal(result.downloadLinkVisible, true, 'Modal Buka Berkas CTA must be visible');
    assert.equal(result.footerCloseBtnVisible, true, 'Modal Tutup button must be visible');

    // 3. Modal Closed State Assertions
    assert.equal(result.modalClosedDisplay, 'none', 'Modal must be hidden after closing');
    assert.equal(result.bodyHasModalOpenAfterClose, false, 'Body must not have modal-open class after modal closes');
    assert.equal(result.restoredTabindex, null, 'Floating WA tabindex must be restored after modal closes');
    assert.equal(result.restoredAriaHidden, null, 'Floating WA aria-hidden must be restored after modal closes');
    assert.notEqual(result.restoredPointerEvents, 'none', 'Floating WA pointer-events must be restored after modal closes');
  } finally {
    chrome.kill();
    server.close();
  }
});

test('Floating WA Suppression in Real Headless Chrome (Mobile Viewport 375x812 - OrderModal on Homepage)', async () => {
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
  const baseUrl = `http://127.0.0.1:${port}/`;

  const chromeDebugPort = port + 1200;
  const chrome = spawn('google-chrome', [
    '--headless=new',
    `--remote-debugging-port=${chromeDebugPort}`,
    `--user-data-dir=/tmp/chrome-test-order-${port}`,
    '--window-size=375,812',
    baseUrl,
  ]);

  await new Promise((r) => setTimeout(r, 1500));

  try {
    const listRes = await fetch(`http://127.0.0.1:${chromeDebugPort}/json`);
    const tabs = await listRes.json();
    const targetTab = tabs.find((t: any) => t.url.includes(`:${port}`)) || tabs.find((t: any) => t.type === 'page') || tabs[0];
    const ws = new WebSocket(targetTab.webSocketDebuggerUrl);

    const result = await new Promise<any>((resolve, reject) => {
      ws.onopen = () => {
        ws.send(JSON.stringify({ id: 1, method: 'Runtime.enable' }));
        setTimeout(() => {
          ws.send(
            JSON.stringify({
              id: 2,
              method: 'Runtime.evaluate',
              params: {
                awaitPromise: true,
                expression: `
                (async () => {
                  for (let i = 0; i < 30; i++) {
                    if (document.getElementById('floating-whatsapp-btn')) break;
                    await new Promise((r) => setTimeout(r, 100));
                  }
                  const floatingWa = document.getElementById('floating-whatsapp-btn');
                  if (!floatingWa) throw new Error('floating-whatsapp-btn not found in DOM');
                  const orderDialog = document.getElementById('order-modal');
                  const orderTrigger = document.querySelector('[data-order-trigger]') || document.querySelector('a[href*="#paket"]');
                  const cancelBtn = document.getElementById('modal-cancel-btn');

                  // Initial state
                  const initialZIndex = window.getComputedStyle(floatingWa).zIndex;
                  const initialOpacity = window.getComputedStyle(floatingWa).opacity;

                  // Trigger order modal opening
                  window.dispatchEvent(new CustomEvent('open-order-modal', {
                    detail: { packageName: 'Paket Hemat 20k' }
                  }));
                  await new Promise((r) => setTimeout(r, 350));

                  const isDialogOpen = orderDialog.hasAttribute('open');
                  const dialogZIndex = window.getComputedStyle(orderDialog).zIndex;
                  const suppressedOpacity = window.getComputedStyle(floatingWa).opacity;
                  const suppressedVisibility = window.getComputedStyle(floatingWa).visibility;
                  const suppressedPointerEvents = window.getComputedStyle(floatingWa).pointerEvents;
                  const suppressedTabindex = floatingWa.getAttribute('tabindex');
                  const suppressedAriaHidden = floatingWa.getAttribute('aria-hidden');

                  // Modal actions
                  const cancelBtnVisible = cancelBtn && window.getComputedStyle(cancelBtn).display !== 'none';
                  const submitBtn = orderDialog.querySelector('button[type="submit"]');
                  const submitBtnVisible = submitBtn && window.getComputedStyle(submitBtn).display !== 'none';

                  // Close modal
                  cancelBtn.click();
                  await new Promise((r) => setTimeout(r, 350));

                  const isDialogClosed = !orderDialog.hasAttribute('open');
                  const restoredTabindex = floatingWa.getAttribute('tabindex');
                  const restoredAriaHidden = floatingWa.getAttribute('aria-hidden');
                  const restoredOpacity = window.getComputedStyle(floatingWa).opacity;
                  const restoredVisibility = window.getComputedStyle(floatingWa).visibility;

                  return JSON.stringify({
                    initialZIndex,
                    initialOpacity,
                    isDialogOpen,
                    dialogZIndex,
                    suppressedOpacity,
                    suppressedVisibility,
                    suppressedPointerEvents,
                    suppressedTabindex,
                    suppressedAriaHidden,
                    cancelBtnVisible,
                    submitBtnVisible,
                    isDialogClosed,
                    restoredTabindex,
                    restoredAriaHidden,
                    restoredOpacity,
                    restoredVisibility,
                  });
                })()
                `,
              },
            })
          );
        }, 600);
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
    assert.equal(result.initialZIndex, '40', 'Initial z-index is 40');
    assert.equal(result.isDialogOpen, true, 'Order modal opens');
    assert.equal(result.dialogZIndex, '120', 'Order modal has z-index 120 (above floating WA z-40)');
    assert.equal(result.suppressedOpacity, '0', 'Floating WA suppressed with opacity 0');
    assert.equal(result.suppressedVisibility, 'hidden', 'Floating WA suppressed with visibility hidden');
    assert.equal(result.suppressedPointerEvents, 'none', 'Floating WA suppressed with pointer-events none');
    assert.equal(result.suppressedTabindex, '-1', 'Floating WA tabindex is -1');
    assert.equal(result.suppressedAriaHidden, 'true', 'Floating WA aria-hidden is true');
    assert.equal(result.cancelBtnVisible, true, 'Modal cancel button is visible');
    assert.equal(result.submitBtnVisible, true, 'Modal submit button is visible');

    // Restoration
    assert.equal(result.isDialogClosed, true, 'Order modal closes');
    assert.equal(result.restoredTabindex, null, 'Floating WA tabindex restored to null');
    assert.equal(result.restoredAriaHidden, null, 'Floating WA aria-hidden restored to null');
    assert.equal(result.restoredVisibility, 'visible', 'Floating WA visibility restored to visible');
  } finally {
    chrome.kill();
    server.close();
  }
});
