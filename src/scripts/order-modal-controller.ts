/**
 * Client Controller: Order Modal Controller
 * Mengelola dialog interaktif modal pemesanan (`OrderModal.astro`):
 * - Membuka modal dan melakukan prefill data via event 'open-order-modal'
 * - Menangani klik elemen [data-order-trigger] di seluruh halaman
 * - Menutup modal via tombol tutup, tombol batal, atau backdrop dialog
 * - Integrasi non-blocking backend lead ingestion (POST /api/leads)
 * - Pembuatan URL dan pesan WhatsApp resmi sesuai kontrak produksi
 * - Reset state form dan dispatch event 'reset-peta-picker'
 */

import { buildOrderModalWhatsAppUrl } from '../services/whatsapp/orderModalMessage';
import { submitLead } from '../services/api/leadService';
import { waPhoneNumber } from '../data/company';
import { setFloatingWaSuppressed } from './floating-actions-controller';
import { getMinOrderByDate, isWeekend } from '../utils/date';
import { clampQuantity } from '../utils/pricing';
import type { OrderModalPrefill } from '../types/order';
import type { BackendLeadPayload } from '../types/api';

/**
 * Membuka URL WhatsApp secara aman dengan pencegahan pemblokiran popup browser (khususnya Safari / mobile).
 * Berjalan langsung secara sinkron dari trusted user gesture (event submit form).
 * Menggunakan strategi:
 * 1. window.open(waUrl, '_blank') tanpa argumen windowFeatures 'noopener' (karena per spesifikasi WHATWG,
 *    string 'noopener' memaksa return null meskipun sukses membuka jendela, menyebabkan deteksi popup blocker
 *    salah kaprah dan memicu fallback ganda).
 * 2. Jika berhasil, putus relasi openedWindow.opener = null secara programatis dan return.
 * 3. Jika window.open diblokir popup blocker (window null atau tertutup), fallback memicu elemen tautan <a> sintetis dengan target="_blank" dan rel="noopener noreferrer".
 * 4. Jika manipulasi DOM gagal, fallback ke navigasi langsung window.location.href = waUrl.
 */
export function openWhatsAppSafely(waUrl: string): void {
  let openedWindow: Window | null = null;

  try {
    openedWindow = window.open(waUrl, '_blank');
  } catch (err) {
    console.warn('[orderModalController] window.open failed:', err);
    openedWindow = null;
  }

  // Jika window.open berhasil membuka tab baru
  if (openedWindow && !openedWindow.closed && typeof openedWindow.closed !== 'undefined') {
    try {
      openedWindow.opener = null;
    } catch {
      // Abaikan jika browser membatasi mutasi window.opener
    }
    return;
  }

  // Fallback 1: Jika window.open diblokir popup blocker di browser mobile/Safari
  try {
    const link = document.createElement('a');
    link.href = waUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      link.remove();
    }, 150);
  } catch (linkErr) {
    // Fallback 2: Jika DOM manipulation gagal, navigasikan langsung ke waUrl
    console.warn('[orderModalController] Anchor fallback failed, falling back to window.location.href:', linkErr);
    window.location.href = waUrl;
  }
}

let orderModalAbortController: AbortController | null = null;
let isOrderModalLoaded = false;

/**
 * Hentikan dan bersihkan seluruh listener aktif modal pemesanan.
 */
export function teardownOrderModalController(): void {
  if (orderModalAbortController) {
    orderModalAbortController.abort();
    orderModalAbortController = null;
  }
  setFloatingWaSuppressed(false);
}

/**
 * Inisialisasi controller modal pemesanan WhatsApp.
 */
export function initOrderModalController(): void {
  teardownOrderModalController();

  const dialog = document.getElementById('order-modal') as HTMLDialogElement | null;
  const form = document.getElementById('order-form') as HTMLFormElement | null;
  const displayPackage = document.getElementById('display-package-name');
  const displayCustomDetails = document.getElementById('display-custom-details');
  const inputPackage = document.getElementById('input-package-name') as HTMLInputElement | null;
  const inputCustomDetails = document.getElementById('input-custom-details') as HTMLInputElement | null;
  const eventDateInput = document.getElementById('event-date') as HTMLInputElement | null;
  const portionInput = document.getElementById('portion-count') as HTMLInputElement | null;
  const portionMinHint = document.getElementById('portion-min-hint');
  const addressInput = document.getElementById('customer-address') as HTMLTextAreaElement | null;
  const latInput = document.getElementById('delivery-lat') as HTMLInputElement | null;
  const lngInput = document.getElementById('delivery-lng') as HTMLInputElement | null;

  if (!dialog || !form) return;

  orderModalAbortController = new AbortController();
  const { signal } = orderModalAbortController;

  if (eventDateInput) {
    eventDateInput.min = new Date().toISOString().split('T')[0];
  }

  let activeMinOrder = 20;
  let activeMinOrderWeekend = 40;
  let activeMaxOrder = 500;

  function syncModalMoQ(forcedPortion?: number): void {
    if (!portionInput) return;
    const dateVal = eventDateInput?.value;
    const currentMin = getMinOrderByDate(dateVal, activeMinOrder, activeMinOrderWeekend);
    portionInput.min = String(currentMin);
    portionInput.max = String(activeMaxOrder);

    if (portionMinHint) {
      if (!dateVal) {
        portionMinHint.textContent = `Minimal ${activeMinOrder} box (Hari Kerja) / ${activeMinOrderWeekend} box (Akhir Pekan), Maksimal ${activeMaxOrder} box`;
      } else {
        const isWk = isWeekend(dateVal);
        const dayTypeLabel = isWk ? 'Akhir Pekan' : 'Hari Kerja';
        portionMinHint.textContent = `Minimal ${currentMin} box (${dayTypeLabel}), Maksimal ${activeMaxOrder} box`;
      }
    }

    if (forcedPortion !== undefined) {
      portionInput.value = String(clampQuantity(forcedPortion, currentMin, activeMaxOrder));
    } else {
      const currentVal = parseInt(portionInput.value, 10);
      if (isNaN(currentVal) || currentVal < currentMin) {
        portionInput.value = String(currentMin);
      } else if (currentVal > activeMaxOrder) {
        portionInput.value = String(activeMaxOrder);
      }
    }
  }

  if (eventDateInput) {
    const handleDateChange = () => {
      syncModalMoQ();
    };
    eventDateInput.addEventListener('change', handleDateChange, { signal });
    eventDateInput.addEventListener('input', handleDateChange, { signal });
  }

  if (portionInput) {
    portionInput.addEventListener(
      'blur',
      () => {
        syncModalMoQ();
      },
      { signal }
    );
  }

  // Listener untuk membuka modal dengan data prefill
  window.addEventListener(
    'open-order-modal',
    ((e: CustomEvent<OrderModalPrefill>) => {
      const pkg = e.detail?.packageName || 'Snack Box Dzanis';
      const details = e.detail?.customDetails || '';
      const portions = e.detail?.portionCount;
      const eventDate = e.detail?.eventDate;
      activeMinOrder = e.detail?.minOrder || 20;
      activeMinOrderWeekend = e.detail?.minOrderWeekend || 40;
      activeMaxOrder = e.detail?.maxOrder || 500;

      if (displayPackage) displayPackage.textContent = pkg;
      if (inputPackage) inputPackage.value = pkg;
      if (inputCustomDetails) inputCustomDetails.value = details;

      if (displayCustomDetails) {
        if (details) {
          displayCustomDetails.textContent = details;
          displayCustomDetails.classList.remove('hidden');
        } else {
          displayCustomDetails.textContent = '';
          displayCustomDetails.classList.add('hidden');
        }
      }

      if (eventDate && eventDateInput) {
        eventDateInput.value = eventDate;
      }

      syncModalMoQ(portions);

      if (!dialog.open) {
        if (addressInput) addressInput.value = '';
        if (latInput) latInput.value = '';
        if (lngInput) lngInput.value = '';
        window.dispatchEvent(new CustomEvent('reset-peta-picker'));
        setFloatingWaSuppressed(true);
        dialog.showModal();
        window.dispatchEvent(new CustomEvent('order-modal-opened'));
      }
    }) as EventListener,
    { signal }
  );

  // Global trigger selector listener [data-order-trigger]
  document.addEventListener(
    'click',
    (e) => {
      const trigger = (e.target as HTMLElement).closest('[data-order-trigger]');
      if (trigger) {
        e.preventDefault();
        const packageName = trigger.getAttribute('data-package-name') || 'Snack Box Dzanis';
        window.dispatchEvent(new CustomEvent('open-order-modal', { detail: { packageName } }));
      }
    },
    { signal }
  );

  const closeModal = (): void => {
    if (dialog.open) dialog.close();
  };

  document.getElementById('modal-close-icon')?.addEventListener('click', closeModal, { signal });
  document.getElementById('modal-cancel-btn')?.addEventListener('click', closeModal, { signal });

  dialog.addEventListener(
    'click',
    (e) => {
      const r = dialog.getBoundingClientRect();
      if (e.clientY < r.top || e.clientY > r.bottom || e.clientX < r.left || e.clientX > r.right) {
        dialog.close();
      }
    },
    { signal }
  );

  dialog.addEventListener(
    'close',
    () => {
      activeMinOrder = 20;
      activeMinOrderWeekend = 40;
      activeMaxOrder = 500;
      setFloatingWaSuppressed(false);
      window.dispatchEvent(new CustomEvent('order-modal-closed'));
    },
    { signal }
  );

  // Handler Submit Form Pemesanan
  form.addEventListener(
    'submit',
    (e) => {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      const data = new FormData(form);
      const pkg = String(data.get('packageName') || 'Snack Box Dzanis');
      const details = String(data.get('customDetails') || '').trim();
      const name = String(data.get('customerName') || '').trim();
      const date = String(data.get('eventDate') || '');
      const currentMin = getMinOrderByDate(date, activeMinOrder, activeMinOrderWeekend);
      const rawCount = Number(data.get('portionCount')) || currentMin;
      const count = clampQuantity(rawCount, currentMin, activeMaxOrder);
      const address = String(data.get('customerAddress') || '').trim();
      const lat = String(data.get('deliveryLat') || '').trim();
      const lng = String(data.get('deliveryLng') || '').trim();
      const notes = String(data.get('notes') || '').trim();

      // Bangun URL WhatsApp resmi dan alihkan pelanggan langsung dari trusted user gesture
      const phone = dialog.dataset.phone || waPhoneNumber;
      const waUrl = buildOrderModalWhatsAppUrl(phone, {
        packageName: pkg,
        customDetails: details,
        customerName: name,
        eventDate: date,
        portionCount: count,
        customerAddress: address,
        deliveryLat: lat,
        deliveryLng: lng,
        notes,
      });

      // Non-blocking lead ingestion ke backend dzaniez-back (dieksekusi sinkron sebelum navigasi)
      const leadPayload: BackendLeadPayload = {
        client_name: name,
        whatsapp: '',
        email: null,
        event_type: pkg,
        event_date: date || null,
        guest_count: count,
        budget_range: null,
        selected_package: pkg,
        venue_address: address || null,
        notes: [
          details ? `Kustomisasi: ${details}` : '',
          lat && lng ? `Peta: ${lat},${lng}` : '',
          notes ? `Catatan: ${notes}` : '',
        ]
          .filter(Boolean)
          .join(' | ') || null,
        status: 'NEW',
      };

      submitLead(leadPayload).catch((err) => {
        console.warn('[orderModalController] Non-blocking submitLead failed:', err);
      });

      // Buka WhatsApp langsung dari trusted user gesture tanpa jeda async
      openWhatsAppSafely(waUrl);

      // Reset form dan state dialog
      form.reset();
      if (inputPackage) inputPackage.value = pkg;
      if (inputCustomDetails) inputCustomDetails.value = '';
      if (displayPackage) displayPackage.textContent = pkg;
      if (displayCustomDetails) {
        displayCustomDetails.textContent = '';
        displayCustomDetails.classList.add('hidden');
      }
      if (portionInput) {
        portionInput.value = portionInput.min || '20';
      }
      if (addressInput) addressInput.value = '';
      if (latInput) latInput.value = '';
      if (lngInput) lngInput.value = '';
      window.dispatchEvent(new CustomEvent('reset-peta-picker'));
      dialog.close();
    },
    { signal }
  );
}

// Lifecycle listeners untuk Astro Transitions
if (typeof window !== 'undefined') {
  document.addEventListener('astro:page-load', () => {
    isOrderModalLoaded = true;
    initOrderModalController();
  });

  document.addEventListener('astro:before-swap', () => {
    teardownOrderModalController();
  });

  if (document.readyState === 'loading') {
    document.addEventListener(
      'DOMContentLoaded',
      () => {
        if (!isOrderModalLoaded) {
          initOrderModalController();
        }
      },
      { once: true }
    );
  } else if (!isOrderModalLoaded) {
    initOrderModalController();
  }
}
