import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

test('CertHero mobile layout density verification', () => {
  const heroPath = path.resolve('src/components/sertifikat/CertHero.astro');
  const heroContent = fs.readFileSync(heroPath, 'utf8');

  // 1. Mobile padding reduction
  assert.match(heroContent, /pt-8 pb-8 sm:pt-12 sm:pb-12/);

  // 2. Heading text size on mobile
  assert.match(heroContent, /text-2xl sm:text-4xl/);

  // 3. Lead text on mobile
  assert.match(heroContent, /text-xs sm:text-base leading-relaxed text-neutral-700/);

  // 4. Trust metric status pills
  assert.match(heroContent, /Halal BPJPH/);
  assert.match(heroContent, /SLHS Dinkes/);
  assert.match(heroContent, /NIB OSS/);
  assert.match(heroContent, /Terverifikasi/);

  // 5. Column 5 verification card
  assert.match(heroContent, /lg:col-span-5/);
  assert.match(heroContent, /rounded-3xl border border-divider bg-surface/);
});

test('CertShowcaseGrid mobile layout density and interactive card verification', () => {
  const gridPath = path.resolve('src/components/sertifikat/CertShowcaseGrid.astro');
  const gridContent = fs.readFileSync(gridPath, 'utf8');

  // 1. Section padding and header tightening
  assert.match(gridContent, /py-5 sm:py-8/);
  assert.match(gridContent, /text-xs font-bold uppercase/);

  // 2. 2-column compact grid layout on mobile
  assert.match(gridContent, /grid grid-cols-2 gap-2\.5 sm:grid-cols-2 lg:grid-cols-3/);

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

  // Check that trust metric pills exist in compiled output
  assert.match(html, /Halal BPJPH Kemenag/);

  // Check that the verification card exists in compiled output
  assert.match(html, /Kartu Verifikasi Usaha/);

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
      assert.ok(parsed.documentUrl !== undefined, 'Document must have a documentUrl field');
    }, `Failed to parse data-cert at index ${count}`);
    count++;
  }

  assert.ok(count >= 5, `Expected at least 5 certificate cards, found ${count}`);
});

test('CertB2BProcurementCta layout, safe padding, and single primary CTA verification', () => {
  const ctaPath = path.resolve('src/components/sertifikat/CertB2BProcurementCta.astro');
  const ctaContent = fs.readFileSync(ctaPath, 'utf8');

  // 1. Safe vertical padding on section
  assert.match(ctaContent, /py-8 sm:py-14 bg-bg/);
  assert.match(ctaContent, /max-w-\[1280px\] px-4 sm:px-6 lg:px-14/, 'Inner container must maintain site-wide max-w and alignment');

  // 2. Responsive checklist grid
  assert.match(ctaContent, /grid grid-cols-1 sm:grid-cols-2 gap-2\.5 sm:gap-3/);

  // 3. 4 checklist items
  assert.match(ctaContent, /Kwitansi Resmi Bermeterai/);
  assert.match(ctaContent, /Surat Pesanan Kerja \(SPK\) &amp; BAST/);
  assert.match(ctaContent, /Faktur Pajak &amp; NPWP Terdaftar/);
  assert.match(ctaContent, /Pengantaran Tepat Waktu se-Ciayumajakuning/);

  // 4. Single WhatsApp Primary CTA
  assert.match(ctaContent, /Konsultasi via WhatsApp/);
  assert.match(ctaContent, /btn btn-primary/);
  assert.match(ctaContent, /min-h-\[48px\]/);

  // 5. Informative subtext under button
  assert.match(ctaContent, /Nomor Resmi:/);
  assert.match(ctaContent, /Respon Cepat Setiap Hari/);
});

test('Built HTML contains CertB2BProcurementCta safe padding and single CTA', () => {
  const distPath = path.resolve('dist/sertifikat/index.html');
  const html = fs.readFileSync(distPath, 'utf8');

  // Section safe padding
  assert.match(html, /py-8 sm:py-14 bg-bg/);

  // Single button and no duplicate
  assert.match(html, /Konsultasi via WhatsApp/);

  // Subtext with phone number
  assert.match(html, /Nomor Resmi: <strong class="text-text font-semibold"( data-contact-phone-display)?>0813-2438-3858<\/strong> &bull; Respon Cepat Setiap Hari/);
});

