/**
 * Client Controller: Package Order Controller
 * Mengelola interaktivitas halaman detail paket nasi kotak (`/paket/[slug]`):
 * - Pemilihan mode pesanan (Default vs Racik Menu Sendiri)
 * - Pilihan radio menu utama & checkbox lauk pendamping dengan batas min/max
 * - Kalkulator porsi, perhitungan subtotal, dan date picker tanggal acara
 * - Sinkronisasi URL query parameter (?mode=custom) dan hash (#racik / #custom)
 * - Accordion komposisi menu standar
 * - Pembuatan payload kustomisasi dan dispatch event 'open-order-modal'
 */

import { clampQuantity, calculatePackageTotal } from '../utils/pricing';
import { formatRupiah } from '../utils/currency';
import {
  buildNasiKotakCustomDetails,
  buildNasiKotakWhatsAppMessage,
} from '../services/whatsapp/nasiKotakMessage';
import type { OrderModalPrefill } from '../types/order';

export interface PackageConfig {
  basePrice: number;
  packageName: string;
  minOrder: number;
  phone: string;
  hasMenuSelection: boolean;
  sideDishesMin: number;
  sideDishesMax: number;
  defaultMainMenu: string;
  defaultSideDishes: string[];
  minEventDateString: string;
}

let detailPageAbortController: AbortController | null = null;
let isDetailPageLoaded = false;

/**
 * Inisialisasi logika kalkulator porsi, pemilih menu kustom, dan pembuatan order.
 */
function initPortionCalculator(config: PackageConfig, signal: AbortSignal): void {
  const input = document.getElementById('portion-input') as HTMLInputElement | null;
  const display = document.getElementById('subtotal-display');
  const btn = document.getElementById('wa-checkout-btn') as HTMLElement | null;
  const eventDateInput = document.getElementById('event-date-input') as HTMLInputElement | null;

  if (!input || !display || !btn) return;
  const checkoutBtn = btn;
  const portionInput = input;

  const {
    basePrice,
    packageName,
    minOrder,
    hasMenuSelection,
    sideDishesMin,
    sideDishesMax,
    defaultMainMenu,
    defaultSideDishes,
    minEventDateString,
  } = config;

  // Order Mode State: 'default' | 'custom'
  let orderMode: 'default' | 'custom' = 'default';
  const btnOrderDefault = document.getElementById('btn-order-default');
  const btnOrderCustom = document.getElementById('btn-order-custom');
  const iconOrderDefault = document.getElementById('icon-order-default');
  const iconOrderCustom = document.getElementById('icon-order-custom');
  const badgeOrderDefault = document.getElementById('badge-order-default');
  const badgeOrderCustom = document.getElementById('badge-order-custom');
  const customMenuChevron = document.getElementById('custom-menu-chevron');
  const customMenuCollapsible = document.getElementById('custom-menu-collapsible') as HTMLElement | null;
  const defaultPresetBox = document.getElementById('default-preset-box');

  let selectedMainMenu = defaultMainMenu;
  let selectedSideDishes = Array.isArray(defaultSideDishes) ? [...defaultSideDishes] : [];
  let selectedEventDate: string | null = null;

  function calculateClampedQty(): number {
    return clampQuantity(portionInput.value, minOrder);
  }

  function syncActiveCustomInputs(): void {
    const activeRadio = document.querySelector('input[name="main-menu"]:checked') as HTMLInputElement | null;
    if (activeRadio) {
      selectedMainMenu = activeRadio.value;
    }
    const checkedCheckboxes = document.querySelectorAll('input[name="side-dishes"]:checked') as NodeListOf<HTMLInputElement>;
    selectedSideDishes = Array.from(checkedCheckboxes).map((cb) => cb.value);

    const sideCount = document.getElementById('side-count');
    if (sideCount && sideDishesMax) {
      sideCount.textContent = `${selectedSideDishes.length} / ${sideDishesMax} pilihan`;
    }
  }

  function setOrderMode(mode: 'default' | 'custom', updateUrl = true): void {
    if (mode === 'default') {
      orderMode = 'default';

      // Button Default Active
      btnOrderDefault?.setAttribute('aria-pressed', 'true');
      btnOrderDefault?.classList.add('border-accent', 'bg-accent/8', 'text-neutral-900', 'shadow-2xs');
      btnOrderDefault?.classList.remove('border-neutral-200/90', 'bg-white', 'text-neutral-900');
      if (iconOrderDefault) {
        iconOrderDefault.className =
          'size-9 rounded-xl bg-accent text-white flex items-center justify-center flex-none font-bold shadow-xs transition-colors';
      }
      badgeOrderDefault?.classList.remove('hidden');

      // Button Custom Inactive
      btnOrderCustom?.setAttribute('aria-pressed', 'false');
      btnOrderCustom?.setAttribute('aria-expanded', 'false');
      btnOrderCustom?.classList.remove('border-accent', 'bg-accent/8', 'text-neutral-900', 'shadow-2xs');
      btnOrderCustom?.classList.add('border-neutral-200/90', 'bg-white', 'text-neutral-900');
      if (iconOrderCustom) {
        iconOrderCustom.className =
          'size-9 rounded-xl bg-surface border border-neutral-200 text-neutral-600 flex items-center justify-center flex-none group-hover:border-accent/40 group-hover:text-accent transition-colors';
      }
      badgeOrderCustom?.classList.add('hidden');

      // Collapsible closed
      customMenuChevron?.classList.remove('rotate-180');
      if (customMenuCollapsible) {
        customMenuCollapsible.setAttribute('data-buka', 'false');
        customMenuCollapsible.style.gridTemplateRows = '0fr';
      }

      // Preset box shown
      defaultPresetBox?.classList.remove('hidden');

      if (updateUrl) {
        const nextUrl = new URL(window.location.href);
        let changed = false;
        if (nextUrl.searchParams.has('mode')) {
          nextUrl.searchParams.delete('mode');
          changed = true;
        }
        if (nextUrl.hash === '#racik' || nextUrl.hash === '#custom') {
          nextUrl.hash = '';
          changed = true;
        }
        if (changed) {
          window.history.replaceState(null, '', nextUrl.pathname + (nextUrl.search ? nextUrl.search : '') + nextUrl.hash);
        }
      }

      updateCheckout();
    } else if (mode === 'custom') {
      orderMode = 'custom';

      // Button Custom Active
      btnOrderCustom?.setAttribute('aria-pressed', 'true');
      btnOrderCustom?.setAttribute('aria-expanded', 'true');
      btnOrderCustom?.classList.add('border-accent', 'bg-accent/8', 'text-neutral-900', 'shadow-2xs');
      btnOrderCustom?.classList.remove('border-neutral-200/90', 'bg-white', 'text-neutral-900');
      if (iconOrderCustom) {
        iconOrderCustom.className =
          'size-9 rounded-xl bg-accent text-white flex items-center justify-center flex-none font-bold shadow-xs transition-colors';
      }
      badgeOrderCustom?.classList.remove('hidden');

      // Button Default Inactive
      btnOrderDefault?.setAttribute('aria-pressed', 'false');
      btnOrderDefault?.classList.remove('border-accent', 'bg-accent/8', 'text-neutral-900', 'shadow-2xs');
      btnOrderDefault?.classList.add('border-neutral-200/90', 'bg-white', 'text-neutral-900');
      if (iconOrderDefault) {
        iconOrderDefault.className =
          'size-9 rounded-xl bg-surface border border-neutral-200 text-neutral-600 flex items-center justify-center flex-none group-hover:border-accent/40 group-hover:text-accent transition-colors';
      }
      badgeOrderDefault?.classList.add('hidden');

      // Collapsible open
      customMenuChevron?.classList.add('rotate-180');
      if (customMenuCollapsible) {
        customMenuCollapsible.setAttribute('data-buka', 'true');
        customMenuCollapsible.style.gridTemplateRows = '1fr';
      }
      defaultPresetBox?.classList.add('hidden');

      syncActiveCustomInputs();
      updateSummary();
      updateCheckout();

      if (updateUrl) {
        const nextUrl = new URL(window.location.href);
        if (nextUrl.searchParams.get('mode') !== 'custom') {
          nextUrl.searchParams.set('mode', 'custom');
          window.history.replaceState(null, '', nextUrl.pathname + nextUrl.search + nextUrl.hash);
        }
      }
    }
  }

  if (btnOrderDefault) {
    btnOrderDefault.addEventListener(
      'click',
      () => {
        setOrderMode('default', true);
        portionInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      },
      { signal }
    );
  }

  if (btnOrderCustom) {
    btnOrderCustom.addEventListener(
      'click',
      () => {
        setOrderMode('custom', true);
      },
      { signal }
    );
  }

  // Sync from URL (Single Source of Truth)
  function syncModeFromUrl(updateUrl = false): void {
    const urlParams = new URLSearchParams(window.location.search);
    const urlMode = urlParams.get('mode');
    const hash = window.location.hash;

    if (urlMode === 'custom' || hash === '#racik' || hash === '#custom') {
      setOrderMode('custom', updateUrl);
    } else {
      setOrderMode('default', updateUrl);
    }
  }

  window.addEventListener(
    'popstate',
    () => {
      syncModeFromUrl(false);
    },
    { signal }
  );

  if (hasMenuSelection) {
    const mainMenuRadios = document.querySelectorAll<HTMLInputElement>('input[name="main-menu"]');
    const sideDishCheckboxes = document.querySelectorAll<HTMLInputElement>('input[name="side-dishes"]');

    mainMenuRadios.forEach((radio) => {
      radio.addEventListener(
        'change',
        (e) => {
          const target = e.target as HTMLInputElement;
          if (target.checked) {
            selectedMainMenu = target.value;
            updateSummary();
            updateCheckout();
          }
        },
        { signal }
      );
    });

    sideDishCheckboxes.forEach((checkbox) => {
      checkbox.addEventListener(
        'change',
        (e) => {
          const target = e.target as HTMLInputElement;
          const maxSelections = parseInt(target.dataset.max || '0', 10);
          const allCheckboxes = document.querySelectorAll<HTMLInputElement>('input[name="side-dishes"]');
          const checkedCount = Array.from(allCheckboxes).filter((cb) => cb.checked).length;

          if (target.checked && checkedCount > maxSelections) {
            target.checked = false;
            alert(`Maksimal pilihan adalah ${maxSelections} lauk pendamping`);
            return;
          }

          selectedSideDishes = Array.from(allCheckboxes)
            .filter((cb) => cb.checked)
            .map((cb) => cb.value);

          const sideCount = document.getElementById('side-count');
          if (sideCount) {
            sideCount.textContent = `${checkedCount} / ${maxSelections} pilihan`;
          }

          updateSummary();
          updateCheckout();
        },
        { signal }
      );
    });
  }

  function updateSummary(): void {
    const summaryMain = document.getElementById('menu-summary-main');
    const summarySides = document.getElementById('menu-summary-sides');
    const validationIndicator = document.getElementById('validation-indicator');

    if (summaryMain && selectedMainMenu) {
      summaryMain.textContent = `Menu: ${selectedMainMenu}`;
    }

    if (summarySides && selectedSideDishes.length > 0) {
      summarySides.textContent = `Lauk: ${selectedSideDishes.join(', ')}`;
    } else if (summarySides) {
      summarySides.textContent = 'Lauk: — (Belum dipilih)';
    }

    if (validationIndicator) {
      if (selectedSideDishes.length >= sideDishesMin && selectedSideDishes.length <= sideDishesMax && selectedMainMenu) {
        validationIndicator.textContent = '✓ Pilihan Siap';
        validationIndicator.className = 'text-xs font-semibold text-accent-700';
      } else {
        validationIndicator.textContent = `Pilih min. ${sideDishesMin} lauk`;
        validationIndicator.className = 'text-xs font-semibold text-amber-600';
      }
    }
  }

  function validateMenuSelection(): { valid: boolean } {
    if (!hasMenuSelection || orderMode === 'default') {
      return { valid: true };
    }

    const errors: string[] = [];

    if (!selectedMainMenu) {
      errors.push('Pilih satu menu utama');
    }

    if (selectedSideDishes.length < sideDishesMin) {
      errors.push(`Pilih minimal ${sideDishesMin} lauk pendamping`);
    }

    if (selectedSideDishes.length > sideDishesMax) {
      errors.push(`Maksimal ${sideDishesMax} lauk pendamping`);
    }

    if (errors.length > 0) {
      const errorMsg = errors.join('\n');
      alert(
        'Mohon lengkapi racikan menu Anda:\n\n' +
          errorMsg +
          '\n\nAtau klik tombol "Pesan Paket Default" jika ingin menggunakan racikan menu standar.'
      );
      return { valid: false };
    }

    return { valid: true };
  }

  function updateCheckout(): void {
    const qty = calculateClampedQty();
    const total = calculatePackageTotal(qty, basePrice);

    if (display) {
      display.textContent = formatRupiah(total);
    }

    const rawMessage = buildNasiKotakWhatsAppMessage({
      packageName,
      qty,
      total,
      hasMenuSelection,
      orderMode,
      defaultMainMenu,
      defaultSideDishes,
      selectedMainMenu,
      selectedSideDishes,
      selectedEventDate: selectedEventDate || undefined,
    });

    checkoutBtn.dataset.waMessage = rawMessage;
  }

  checkoutBtn.addEventListener(
    'click',
    (e) => {
      e.preventDefault();

      if (hasMenuSelection) {
        const validation = validateMenuSelection();
        if (!validation.valid) {
          return;
        }
      }

      if (eventDateInput && !eventDateInput.value) {
        alert('Mohon pilih tanggal acara minimal hari berikutnya.');
        eventDateInput.focus();
        return;
      }

      if (eventDateInput && eventDateInput.value) {
        const selectedDate = new Date(`${eventDateInput.value}T00:00:00`);
        const minSelectableDate = minEventDateString ? new Date(`${minEventDateString}T00:00:00`) : null;

        if (minSelectableDate && selectedDate < minSelectableDate) {
          alert('Tanggal acara tidak bisa dipilih hari ini atau hari sebelumnya. Minimal pilih tanggal besok.');
          eventDateInput.focus();
          return;
        }
      }

      const qty = calculateClampedQty();
      const customMenuDetails = buildNasiKotakCustomDetails({
        packageName,
        qty,
        total: calculatePackageTotal(qty, basePrice),
        hasMenuSelection,
        orderMode,
        defaultMainMenu,
        defaultSideDishes,
        selectedMainMenu,
        selectedSideDishes,
      });

      const modalPayload: OrderModalPrefill = {
        packageName,
        customDetails: customMenuDetails,
        portionCount: qty,
        eventDate: eventDateInput?.value || '',
        minOrder,
      };

      // Dispatch event untuk membuka OrderModal dengan seluruh data ter-prefill
      window.dispatchEvent(
        new CustomEvent('open-order-modal', {
          detail: modalPayload,
        })
      );
    },
    { signal }
  );

  portionInput.addEventListener('input', updateCheckout, { signal });

  portionInput.addEventListener(
    'blur',
    () => {
      let val = parseInt(portionInput.value, 10);
      if (isNaN(val) || val < minOrder) {
        portionInput.value = minOrder.toString();
        updateCheckout();
      }
    },
    { signal }
  );

  if (eventDateInput) {
    eventDateInput.addEventListener(
      'change',
      (e) => {
        const target = e.target as HTMLInputElement;
        selectedEventDate = target.value;
        updateCheckout();
      },
      { signal }
    );
  }

  // Initial state sync from URL / defaults
  syncModeFromUrl(false);
  updateCheckout();
  if (hasMenuSelection) {
    updateSummary();
  }
}

/**
 * Inisialisasi akordeon komposisi menu bawaan.
 */
function initCompositionToggle(signal: AbortSignal): void {
  const btn = document.getElementById('composition-toggle-btn');
  const content = document.getElementById('composition-content') as HTMLElement | null;
  const chevron = document.getElementById('composition-chevron');
  if (!btn || !content || !chevron) return;

  btn.addEventListener(
    'click',
    () => {
      const isExpanded = btn.getAttribute('aria-expanded') === 'true';
      const nextState = !isExpanded;

      btn.setAttribute('aria-expanded', String(nextState));

      if (nextState) {
        content.setAttribute('data-buka', 'true');
        content.style.gridTemplateRows = '1fr';
        chevron.classList.add('rotate-180');
      } else {
        content.setAttribute('data-buka', 'false');
        content.style.gridTemplateRows = '0fr';
        chevron.classList.remove('rotate-180');
      }
    },
    { signal }
  );
}

/**
 * Hentikan dan bersihkan seluruh listener aktif controller halaman detail.
 */
export function teardownPackageOrderController(): void {
  if (detailPageAbortController) {
    detailPageAbortController.abort();
    detailPageAbortController = null;
  }
}

/**
 * Inisialisasi controller halaman detail paket katering.
 */
export function initPackageOrderController(): void {
  teardownPackageOrderController();

  const root = document.getElementById('package-detail-root');
  if (!root) return;

  const basePrice = Number(root.dataset.basePrice) || 0;
  const packageName = root.dataset.packageName || '';
  const minOrder = Number(root.dataset.minOrder) || 1;
  const phone = root.dataset.phone || '';
  const hasMenuSelection = root.dataset.hasMenuSelection === 'true';
  const sideDishesMin = Number(root.dataset.sideDishesMin) || 0;
  const sideDishesMax = Number(root.dataset.sideDishesMax) || 0;
  const defaultMainMenu = root.dataset.defaultMainMenu || '';
  let defaultSideDishes: string[] = [];
  try {
    defaultSideDishes = JSON.parse(root.dataset.defaultSideDishes || '[]');
  } catch {
    defaultSideDishes = [];
  }
  const minEventDateString = root.dataset.minEventDate || '';

  const config: PackageConfig = {
    basePrice,
    packageName,
    minOrder,
    phone,
    hasMenuSelection,
    sideDishesMin,
    sideDishesMax,
    defaultMainMenu,
    defaultSideDishes,
    minEventDateString,
  };

  detailPageAbortController = new AbortController();
  const { signal } = detailPageAbortController;

  initPortionCalculator(config, signal);
  initCompositionToggle(signal);
}

// Lifecycle listeners untuk Astro Transitions
if (typeof window !== 'undefined') {
  document.addEventListener('astro:page-load', () => {
    isDetailPageLoaded = true;
    initPackageOrderController();
  });

  document.addEventListener('astro:before-swap', () => {
    teardownPackageOrderController();
  });

  if (document.readyState === 'loading') {
    document.addEventListener(
      'DOMContentLoaded',
      () => {
        if (!isDetailPageLoaded) {
          initPackageOrderController();
        }
      },
      { once: true }
    );
  } else if (!isDetailPageLoaded) {
    initPackageOrderController();
  }
}
