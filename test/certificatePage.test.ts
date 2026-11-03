import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

test('CertHero mobile layout density verification', () => {
  const heroPath = path.resolve('src/components/sertifikat/CertHero.astro');
  const heroContent = fs.readFileSync(heroPath, 'utf8');

  // 1. Mobile padding reduction
  assert.match(heroContent, /py-5 px-4 sm:py-12/);

  // 2. Heading text size on mobile
  assert.match(heroContent, /text-2xl font-bold.*sm:text-4xl/);

  // 3. Lead text line clamping on mobile
  assert.match(heroContent, /text-xs sm:text-base.*line-clamp-2 sm:line-clamp-none/);

  // 4. Trust metric bar with 3 columns horizontal (anti-stacking)
  assert.match(heroContent, /grid grid-cols-3 gap-2 sm:gap-3/);
  assert.match(heroContent, /Halal BPJPH/);
  assert.match(heroContent, /SLHS Dinkes/);
  assert.match(heroContent, /NIB OSS/);
  assert.match(heroContent, /Terverifikasi/);

  // 5. Desktop-only ID matrix card to prevent mobile vertical stacking
  assert.match(heroContent, /hidden lg:block rounded-3xl/);
});

test('CertShowcaseGrid mobile layout density and interactive card verification', () => {
  const gridPath = path.resolve('src/components/sertifikat/CertShowcaseGrid.astro');
  const gridContent = fs.readFileSync(gridPath, 'utf8');

  // 1. Section padding and header tightening
  assert.match(gridContent, /py-5 sm:py-12/);
  assert.match(gridContent, /text-xl sm:text-3xl/);

  // 2. 2-column compact grid layout on mobile
  assert.match(gridContent, /grid grid-cols-2 gap-2.5 sm:grid-cols-2 lg:grid-cols-3/);

  // 3. Proportional framed thumbnail (aspect-[4/3])
  assert.match(gridContent, /aspect-\[4\/3\]/);

  // 4. Compact metadata & clamped title
  assert.match(gridContent, /font-heading text-xs sm:text-base.*line-clamp-1/);
  assert.match(gridContent, /font-mono text-\[9px\] sm:text-xs/);

  // 5. Clean data-cert attribute and accessible role="button" (NO broken inline onclick with &quot; entity bugs)
  assert.match(gridContent, /data-cert=\{payloadStr\}/);
  assert.match(gridContent, /role="button"/);
  assert.match(gridContent, /data-copy-number="true"/);
  assert.doesNotMatch(gridContent, /onclick=\{`window\.openCertLightbox.*replace/);

  // 6. Accessible button styling with touch manipulation
  assert.match(gridContent, /min-h-\[36px\] sm:min-h-\[44px\]/);
});

test('Built HTML contains mobile-dense classes and valid JSON data-cert in dist/sertifikat/index.html', () => {
  const distPath = path.resolve('dist/sertifikat/index.html');
  assert.ok(fs.existsSync(distPath), 'dist/sertifikat/index.html must exist');

  const html = fs.readFileSync(distPath, 'utf8');

  // Check that mobile 2-column grid exists in compiled output
  assert.match(html, /grid grid-cols-2 gap-2\.5/);

  // Check that 3-column trust metric bar exists in compiled output
  assert.match(html, /grid grid-cols-3 gap-2/);

  // Check that the bulky ID matrix has hidden lg:block in compiled output
  assert.match(html, /hidden lg:block rounded-3xl/);

  // Check that NO broken inline onclick with &amp;quot; exists
  assert.doesNotMatch(html, /onclick="window\.openCertLightbox\(\{&amp;quot;/);

  // Extract all data-cert attributes and verify they parse as valid JSON
  const dataCertRegex = /data-cert="([^"]+)"/g;
  let match;
  let count = 0;
  while ((match = dataCertRegex.exec(html)) !== null) {
    const rawAttr = match[1]
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, '&')
      .replace(/&#39;/g, "'")
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>');

    assert.doesNotThrow(() => {
      const parsed = JSON.parse(rawAttr);
      assert.ok(parsed.title, 'Document must have a title');
      assert.ok(parsed.documentUrl, 'Document must have a documentUrl');
    }, `Failed to parse data-cert at index ${count}`);
    count++;
  }

  assert.ok(count >= 5, `Expected at least 5 certificate cards, found ${count}`);
});

test('CertB2BProcurementCta layout, safe padding, and single primary CTA verification', () => {
  const ctaPath = path.resolve('src/components/sertifikat/CertB2BProcurementCta.astro');
  const ctaContent = fs.readFileSync(ctaPath, 'utf8');

  // 1. Safe vertical & horizontal padding on section
  assert.match(ctaContent, /pt-10 pb-8 sm:pt-16 sm:pb-14 px-4 sm:px-6/);
  assert.match(ctaContent, /max-w-\[1280px\] lg:px-14/, 'Inner container must maintain site-wide max-w and desktop px-14 alignment');

  // 2. Responsive checklist grid (1 col mobile, 2 col sm)
  assert.match(ctaContent, /grid grid-cols-1 sm:grid-cols-2 gap-2\.5 max-w-xl mx-auto mb-6 text-sm text-bg\/95/);

  // 3. 4 checklist items with clear SVG icons
  assert.match(ctaContent, /Kwitansi Resmi Bermeterai/);
  assert.match(ctaContent, /Surat Pesanan Kerja \(SPK\) \/ MOU/);
  assert.match(ctaContent, /Faktur Pajak &amp; NPWP Badan/);
  assert.match(ctaContent, /Berita Acara Serah Terima \(BAST\)/);
  const checkSvgCount = (ctaContent.match(/<svg[^>]*stroke-width="2\.5"[^>]*>/g) || []).length;
  assert.equal(checkSvgCount, 4, 'Should have 4 checklist SVG icons');

  // 4. Single WhatsApp Primary CTA
  assert.match(ctaContent, /Konsultasi Pengadaan via WhatsApp/);
  assert.match(ctaContent, /bg-\[#25D366\]/);
  assert.match(ctaContent, /hover:bg-\[#20ba5a\]/);
  assert.match(ctaContent, /min-h-\[48px\] touch-manipulation/);

  // 5. Duplicate button removed
  assert.doesNotMatch(ctaContent, /Konsultasi Cepat/);
  assert.doesNotMatch(ctaContent, /Telepon Langsung/);

  // 6. Informative subtext under button
  assert.match(ctaContent, /text-xs text-text-muted text-center mt-2\.5/);
  assert.match(ctaContent, /Nomor Resmi:/);
  assert.match(ctaContent, /Respon Cepat Setiap Hari/);
});

test('Built HTML contains CertB2BProcurementCta safe padding and single CTA', () => {
  const distPath = path.resolve('dist/sertifikat/index.html');
  const html = fs.readFileSync(distPath, 'utf8');

  // Section safe padding
  assert.match(html, /pt-10 pb-8 sm:pt-16 sm:pb-14 px-4 sm:px-6/);

  // 1-to-2 column checklist grid
  assert.match(html, /grid grid-cols-1 sm:grid-cols-2 gap-2\.5/);

  // Single button and no duplicate
  assert.match(html, /Konsultasi Pengadaan via WhatsApp/);
  assert.doesNotMatch(html, /Konsultasi Cepat/);

  // Subtext with phone number
  assert.match(html, /Nomor Resmi: <span class="font-semibold text-text">0813-2438-3858<\/span> • Respon Cepat Setiap Hari/);
});

