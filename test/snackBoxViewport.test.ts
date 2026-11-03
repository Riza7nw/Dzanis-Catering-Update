import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import type { AddressInfo } from 'node:net';

test('Mobile Viewport (375px): Zero horizontal overflow on /rakit-snack-box', async () => {
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

  const chromeDebugPort = port + 1200;
  const chrome = spawn('google-chrome', [
    '--headless=new',
    `--remote-debugging-port=${chromeDebugPort}`,
    `--user-data-dir=/tmp/chrome-snack-viewport-${port}`,
    '--window-size=375,812',
    baseUrl,
  ]);

  await new Promise((r) => setTimeout(r, 1500));

  try {
    const listRes = await fetch(`http://127.0.0.1:${chromeDebugPort}/json`);
    const tabs = await listRes.json();
    const targetTab = tabs.find((t: any) => t.type === 'page' && t.url.includes('rakit-snack-box')) || tabs[0];
    const ws = new WebSocket(targetTab.webSocketDebuggerUrl);

    const testResult = await new Promise<any>((resolve, reject) => {
      ws.onopen = () => {
        ws.send(JSON.stringify({ id: 1, method: 'Page.enable' }));
        ws.send(
          JSON.stringify({
            id: 2,
            method: 'Emulation.setDeviceMetricsOverride',
            params: { width: 375, height: 812, deviceScaleFactor: 2, mobile: true },
          })
        );
        ws.send(JSON.stringify({ id: 3, method: 'Page.reload' }));
      };

      ws.onmessage = (msg: any) => {
        const data = JSON.parse(msg.data.toString());
        if (data.method === 'Page.loadEventFired') {
          setTimeout(() => {
            ws.send(
              JSON.stringify({
                id: 10,
                method: 'Runtime.evaluate',
                params: {
                expression: `
                (() => {
                  const scrollWidth = document.documentElement.scrollWidth;
                  const clientWidth = document.documentElement.clientWidth;
                  const innerWidth = window.innerWidth;
                  const bodyScrollWidth = document.body.scrollWidth;
                  const bodyClientWidth = document.body.clientWidth;

                  // Navbar measurement
                  const header = document.querySelector('header');
                  const headerRect = header ? header.getBoundingClientRect() : null;

                  // Floating builder bar measurement
                  const summaryBar = document.getElementById('builder-summary-bar');
                  const summaryBarRect = summaryBar ? summaryBar.getBoundingClientRect() : null;

                  // Template card measurement
                  const firstCard = document.querySelector('.snack-template-card');
                  const firstCardRect = firstCard ? firstCard.getBoundingClientRect() : null;

                  // Carousel track
                  const snackGrid = document.getElementById('snack-grid');
                  const snackGridRect = snackGrid ? snackGrid.getBoundingClientRect() : null;

                  // Find any element whose bounding rect horizontally overflows the 375px viewport (excluding off-screen drawers)
                  const overflowingElements = [];
                  const allElements = document.querySelectorAll('*');
                  for (const el of allElements) {
                    if (el.id === 'mobile-nav-drawer' || el.closest('#mobile-nav-drawer') || el.id === 'mobile-drawer' || el.closest('#mobile-drawer')) continue;
                    const r = el.getBoundingClientRect();
                    if (r.width > clientWidth + 1 && !el.classList.contains('w-full') && el.tagName !== 'HTML' && el.tagName !== 'BODY') {
                      // Check if el is an unclipped horizontal scroller
                      const style = window.getComputedStyle(el);
                      const isScroller = style.overflowX === 'auto' || style.overflowX === 'scroll';
                      if (!isScroller) {
                        overflowingElements.push({
                          tag: el.tagName,
                          id: el.id,
                          className: el.className,
                          width: r.width,
                          right: r.right
                        });
                      }
                    }
                  }

                  // Attempt horizontal scroll to verify canvas is locked
                  window.scrollTo(200, 0);
                  document.documentElement.scrollLeft = 200;
                  const scrollX = window.scrollX;
                  const docScrollLeft = document.documentElement.scrollLeft;

                  return JSON.stringify({
                    scrollWidth,
                    clientWidth,
                    innerWidth,
                    bodyScrollWidth,
                    bodyClientWidth,
                    scrollX,
                    docScrollLeft,
                    headerWidth: headerRect ? headerRect.width : 0,
                    summaryBarWidth: summaryBarRect ? summaryBarRect.width : 0,
                    summaryBarBottom: summaryBarRect ? summaryBarRect.bottom : 0,
                    firstCardWidth: firstCardRect ? firstCardRect.width : 0,
                    snackGridWidth: snackGridRect ? snackGridRect.width : 0,
                    overflowingCount: overflowingElements.length,
                    overflowingElements: overflowingElements.slice(0, 5)
                  });
                })()
              `,
              },
            })
          );
        }, 500);
      }
      if (data.id === 10) {
        if (data.result.exceptionDetails) {
          reject(new Error(JSON.stringify(data.result.exceptionDetails)));
        } else {
          resolve(JSON.parse(data.result.result.value));
        }
      }
    };

    ws.onerror = (err) => reject(err);
  });

    // 1. Critical Requirement: document.documentElement.scrollWidth === document.documentElement.clientWidth
    assert.equal(
      testResult.scrollWidth,
      testResult.clientWidth,
      `Horizontal canvas overflow detected: scrollWidth (${testResult.scrollWidth}) !== clientWidth (${testResult.clientWidth})`
    );
    assert.equal(testResult.clientWidth, 375, 'Viewport clientWidth must be 375px');
    assert.equal(
      testResult.bodyScrollWidth,
      testResult.bodyClientWidth,
      `Body canvas overflow detected: bodyScrollWidth (${testResult.bodyScrollWidth}) !== bodyClientWidth (${testResult.bodyClientWidth})`
    );
    assert.equal(testResult.bodyScrollWidth, 375, 'Body scrollWidth must be 375px');
    assert.equal(testResult.scrollX, 0, 'Canvas must not scroll horizontally');
    assert.equal(testResult.docScrollLeft, 0, 'Document must not scroll horizontally');

    // 2. Navbar spans full mobile width without white gutter
    assert.equal(testResult.headerWidth, 375, 'Header must span exactly 375px');

    // 3. Floating summary bar spans full mobile width
    assert.equal(testResult.summaryBarWidth, 375, 'Summary bar must span exactly 375px');

    // 4. Carousel cards are constrained to <= 80vw (300px)
    assert.ok(testResult.firstCardWidth <= 300, `Card width (${testResult.firstCardWidth}) must be <= 300px`);

    // 5. No unclipped elements expanding beyond viewport
    assert.equal(
      testResult.overflowingCount,
      0,
      `Found overflowing elements: ${JSON.stringify(testResult.overflowingElements)}`
    );

    // 6. Multi-viewport validation across different mobile widths
    for (const w of [320, 360, 390]) {
      const vpResult = await new Promise<any>((resolve) => {
        let msgId = 100 + w;
        let evalId = 200 + w;
        const onMsg = (msg: any) => {
          const d = JSON.parse(msg.data.toString());
          if (d.method === 'Page.loadEventFired') {
            setTimeout(() => {
              ws.send(
                JSON.stringify({
                  id: evalId,
                  method: 'Runtime.evaluate',
                  params: {
                    expression: `JSON.stringify({
                      scrollWidth: document.documentElement.scrollWidth,
                      clientWidth: document.documentElement.clientWidth,
                      bodyScrollWidth: document.body.scrollWidth,
                      bodyClientWidth: document.body.clientWidth
                    })`,
                  },
                })
              );
            }, 300);
          }
          if (d.id === evalId) {
            ws.removeEventListener('message', onMsg);
            resolve(JSON.parse(d.result.result.value));
          }
        };
        ws.addEventListener('message', onMsg);
        ws.send(
          JSON.stringify({
            id: msgId,
            method: 'Emulation.setDeviceMetricsOverride',
            params: { width: w, height: 812, deviceScaleFactor: 2, mobile: true },
          })
        );
        ws.send(JSON.stringify({ id: msgId + 1, method: 'Page.reload' }));
      });

      assert.equal(
        vpResult.scrollWidth,
        w,
        `Viewport width ${w}px: document.documentElement.scrollWidth (${vpResult.scrollWidth}) must equal ${w}px`
      );
      assert.equal(
        vpResult.bodyScrollWidth,
        w,
        `Viewport width ${w}px: document.body.scrollWidth (${vpResult.bodyScrollWidth}) must equal ${w}px`
      );
    }
  } finally {
    chrome.kill();
    server.close();
  }
});
