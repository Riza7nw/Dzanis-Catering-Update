import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildServiceInquiryUrl,
  buildSnackTemplateWaUrl,
  type SnackTemplateData,
} from '../src/utils/whatsappFormatter.ts';

test('buildServiceInquiryUrl generates clean, URL-encoded WhatsApp message without bracket placeholders', () => {
  const serviceName = 'Prasmanan Kantor';
  const url = buildServiceInquiryUrl(serviceName);

  assert.ok(url.startsWith('https://wa.me/6281324383858?text='));
  assert.ok(!url.includes('[Isi'));
  assert.ok(!url.includes('%5BIsi'));

  const decoded = decodeURIComponent(url.split('text=')[1]);
  assert.match(decoded, /Halo Dzanis Catering, saya ingin konsultasi mengenai layanan \*Prasmanan Kantor\*/);
  assert.match(decoded, /Boleh minta info katalog paket dan pricelist lengkapnya\? Terima kasih\./);
});

test('buildServiceInquiryUrl supports custom phone numbers and special characters', () => {
  const serviceName = 'Booth & Food Cart (Festival / Acara)';
  const customPhone = '628999888777';
  const url = buildServiceInquiryUrl(serviceName, customPhone);

  assert.ok(url.startsWith(`https://wa.me/${customPhone}?text=`));
  const decoded = decodeURIComponent(url.split('text=')[1]);
  assert.ok(decoded.includes('*Booth & Food Cart (Festival / Acara)*'));
});

test('buildServiceInquiryUrl supports pre-filled custom message', () => {
  const customMsg = 'Halo Dzanis Catering, saya ingin konsultasi paket prasmanan (min. 50 pax) untuk acara...';
  const url = buildServiceInquiryUrl('Prasmanan', undefined, customMsg);

  assert.ok(url.startsWith('https://wa.me/6281324383858?text='));
  const decoded = decodeURIComponent(url.split('text=')[1]);
  assert.equal(decoded, customMsg);
});

test('buildServiceInquiryUrl and buildSnackTemplateWaUrl normalize domestic and formatted phone numbers', () => {
  const serviceUrl1 = buildServiceInquiryUrl('Nasi Kotak', '0813-2438-3858');
  assert.ok(serviceUrl1.startsWith('https://wa.me/6281324383858?text='));

  const serviceUrl2 = buildServiceInquiryUrl('Nasi Kotak', '+62 813-2438-3858');
  assert.ok(serviceUrl2.startsWith('https://wa.me/6281324383858?text='));

  const snackUrl = buildSnackTemplateWaUrl(
    { nama: 'Paket A', harga: 10000, items: [{ nama: 'Kue Soes' }] },
    '0813-2438-3858'
  );
  assert.ok(snackUrl.startsWith('https://wa.me/6281324383858?text='));
});


test('buildSnackTemplateWaUrl generates properly formatted itemized list and Indonesian rupiah', () => {
  const template: SnackTemplateData = {
    nama: 'Paket Hemat',
    harga: 12000,
    items: [
      { kategori: 'Kolom 1', nama: 'Arem-arem Ayam' },
      { kategori: 'Kolom 2', nama: 'Bolu Kukus Mekar' },
      { kategori: 'Kolom 3', nama: 'Air Mineral Gelas' },
    ],
  };

  const url = buildSnackTemplateWaUrl(template);
  assert.ok(url.startsWith('https://wa.me/6281324383858?text='));

  const decoded = decodeURIComponent(url.split('text=')[1]);
  assert.ok(decoded.includes('*Paket Hemat* (Rp12.000/box) dengan isian:'));
  assert.ok(decoded.includes('1. Kolom 1: Arem-arem Ayam'));
  assert.ok(decoded.includes('2. Kolom 2: Bolu Kukus Mekar'));
  assert.ok(decoded.includes('3. Kolom 3: Air Mineral Gelas'));
  assert.ok(decoded.includes('Boleh info ketersediaan slot tanggal dan minimal ordernya? Terima kasih.'));
  assert.ok(!decoded.includes('[Isi'));
});

test('buildSnackTemplateWaUrl handles items without explicit category', () => {
  const template: SnackTemplateData = {
    nama: 'Paket Custom Mini',
    harga: 15000,
    items: [
      { nama: 'Lemper Ayam Special' },
      { nama: 'Pastel Basah' },
    ],
  };

  const url = buildSnackTemplateWaUrl(template, '6281234567890');
  assert.ok(url.startsWith('https://wa.me/6281234567890?text='));

  const decoded = decodeURIComponent(url.split('text=')[1]);
  assert.ok(decoded.includes('1. Lemper Ayam Special'));
  assert.ok(decoded.includes('2. Pastel Basah'));
});

test('buildSnackTemplateWaUrl handles empty items gracefully', () => {
  const template: SnackTemplateData = {
    nama: 'Paket Kosong',
    harga: 0,
    items: [],
  };

  const url = buildSnackTemplateWaUrl(template);
  const decoded = decodeURIComponent(url.split('text=')[1]);
  assert.ok(decoded.includes('*Paket Kosong* (Rp0/box) dengan isian:'));
  assert.ok(decoded.includes('Boleh info ketersediaan slot tanggal dan minimal ordernya? Terima kasih.'));
});
