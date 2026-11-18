import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_FALLBACK_PHONE,
  DEFAULT_FALLBACK_DISPLAY,
  normalizePhoneNumber,
  formatPhoneDisplay,
  replaceWaLinkPhone,
  replaceTelLinkPhone,
  applyPhoneToDom
} from '../src/scripts/contact-sync.ts';

test('📞 contact-sync: normalizePhoneNumber menangani berbagai variasi format nomor', () => {
  // Nomor standar internasional
  assert.equal(normalizePhoneNumber('6281324383858'), '6281324383858');
  // Format domestik awalan 0
  assert.equal(normalizePhoneNumber('081324383858'), '6281324383858');
  // Format dengan tanda strip dan spasi
  assert.equal(normalizePhoneNumber('0813-2438-3858'), '6281324383858');
  assert.equal(normalizePhoneNumber('+62 813-2438-3858'), '6281324383858');
  // Nomor baru / custom
  assert.equal(normalizePhoneNumber('089876543210'), '6289876543210');
  // Fallback default saat kosong
  assert.equal(normalizePhoneNumber(''), DEFAULT_FALLBACK_PHONE);
  assert.equal(normalizePhoneNumber(null as unknown as string), DEFAULT_FALLBACK_PHONE);
});

test('📞 contact-sync: formatPhoneDisplay memformat tampilan nomor telepon Indonesia', () => {
  assert.equal(formatPhoneDisplay('6281324383858'), '0813-2438-3858');
  assert.equal(formatPhoneDisplay('081324383858'), '0813-2438-3858');
  assert.equal(formatPhoneDisplay('628123456789'), '0812-3456-789');
  assert.equal(formatPhoneDisplay(''), DEFAULT_FALLBACK_DISPLAY);
});

test('📞 contact-sync: replaceWaLinkPhone mengganti nomor tujuan WhatsApp dengan tetap mempertahankan teks pesan', () => {
  const originalUrl = 'https://wa.me/6281324383858?text=Halo%20Dzanis%20Catering%2C%20mau%20pesan';
  const newPhone = '089876543210';
  const replaced = replaceWaLinkPhone(originalUrl, newPhone);

  assert.equal(replaced, 'https://wa.me/6289876543210?text=Halo%20Dzanis%20Catering%2C%20mau%20pesan');

  // URL wa.me tanpa query
  assert.equal(replaceWaLinkPhone('https://wa.me/6281324383858', newPhone), 'https://wa.me/6289876543210');

  // URL api.whatsapp.com
  const apiWaUrl = 'https://api.whatsapp.com/send?phone=6281324383858&text=Halo';
  assert.equal(replaceWaLinkPhone(apiWaUrl, newPhone), 'https://api.whatsapp.com/send?phone=6289876543210&text=Halo');
});

test('📞 contact-sync: replaceTelLinkPhone mengganti nomor pada tautan tel:', () => {
  assert.equal(replaceTelLinkPhone('tel:081324383858', '6289876543210'), 'tel:089876543210');
  assert.equal(replaceTelLinkPhone('tel:+6281324383858', '089876543210'), 'tel:089876543210');
});

test('📞 contact-sync: applyPhoneToDom memperbarui link, atribut data, dan teks nomor pada DOM simulasi', () => {
  const linkWa = {
    href: 'https://wa.me/6281324383858?text=Tes',
    dataset: {} as Record<string, string>,
    attributes: { href: 'https://wa.me/6281324383858?text=Tes' } as Record<string, string>,
    getAttribute(k: string) { return this.attributes[k]; },
    setAttribute(k: string, v: string) { this.attributes[k] = v; this.href = v; }
  };

  const modalEl = {
    dataset: { phone: '6281324383858' } as Record<string, string>,
    attributes: {} as Record<string, string>,
    getAttribute(k: string) { return this.attributes[k]; },
    setAttribute(k: string, v: string) { this.attributes[k] = v; }
  };

  const displayEl = {
    textContent: '0813-2438-3858',
    dataset: { contactPhoneDisplay: '' } as Record<string, string>,
    attributes: {} as Record<string, string>,
    getAttribute(k: string) { return this.attributes[k]; },
    setAttribute(k: string, v: string) { this.attributes[k] = v; }
  };

  // Pasang mock document
  const originalDoc = globalThis.document;
  const originalWindow = globalThis.window;

  let eventDispatched = false;
  globalThis.window = {
    dispatchEvent(evt: Event) {
      if ((evt as CustomEvent).type === 'dzanis:contact-updated') {
        eventDispatched = true;
      }
      return true;
    }
  } as unknown as Window & typeof globalThis;

  globalThis.document = {
    querySelectorAll(selector: string) {
      if (selector.includes('wa.me')) {
        return [linkWa] as unknown as NodeListOf<HTMLAnchorElement>;
      }
      if (selector.includes('[data-phone]')) {
        return [modalEl] as unknown as NodeListOf<HTMLElement>;
      }
      if (selector.includes('[data-contact-phone-display]')) {
        return [displayEl] as unknown as NodeListOf<HTMLElement>;
      }
      return [] as unknown as NodeListOf<HTMLElement>;
    }
  } as unknown as Document;

  try {
    applyPhoneToDom('089876543210', '0898-7654-3210');

    assert.equal(linkWa.getAttribute('href'), 'https://wa.me/6289876543210?text=Tes');
    assert.equal(modalEl.dataset.phone, '6289876543210');
    assert.equal(displayEl.textContent, '0898-7654-3210');
    assert.equal(eventDispatched, true);
  } finally {
    globalThis.document = originalDoc;
    globalThis.window = originalWindow;
  }
});
