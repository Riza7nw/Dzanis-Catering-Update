/**
 * Client Controller: Snack Box Controller
 * Mengelola interaktivitas halaman / komponen Rakit Snack Box:
 * - Sinkronisasi data real-time dengan backend API (/api/snack-items) & SWR Cache
 * - Builder kustom snack box (counter box, tab filter kategori dengan horizontal scroll, badge counter)
 * - Kalkulasi subtotal, harga per box, dan estimasi total dinamis
 * - Dispatch event 'open-order-modal' dengan data racikan lengkap
 */

import {
  buildSnackBoxCustomDetails,
  buildSnackBoxPackageName,
} from '../services/whatsapp/snackBoxMessage';
import { buildLargeOrderWhatsAppUrl } from '../services/whatsapp/waUrl';
import { waPhoneNumber } from '../data/company';
import { getApiBaseUrl, getCommonApiHeaders, DEFAULT_TIMEOUT_MS } from '../services/api/apiConfig';
import type { OrderModalPrefill } from '../types/order';

const SNACK_CACHE_KEY = 'dzanis_snack_items_cache';
let teardowns: Array<() => void> = [];
let isSnackBoxLoaded = false;

function formatRp(num: number): string {
  return 'Rp' + (Number(num) || 0).toLocaleString('id-ID');
}

interface BackendSnackItemDto {
  id: string;
  name: string;
  category: string;
  price: number;
  is_active: number | boolean;
  sort_order?: number;
}

/**
 * Sinkronisasi data katalog snack items dari backend API (/api/snack-items).
 * Menyesuaikan harga, status ketersediaan (aktif/habis), dan item baru secara dinamis di DOM.
 */
async function syncSnackCatalogFromBackend(
  root: HTMLElement,
  recalculate: () => void,
  signal: AbortSignal
): Promise<void> {
  const apiBase = getApiBaseUrl();
  const counterEl = document.getElementById('total-snack-counter');

  function applyItemsToDOM(rawItems: BackendSnackItemDto[]) {
    if (!Array.isArray(rawItems) || rawItems.length === 0) return;

    let activeCount = 0;
    const existingCheckboxes = new Map<string, HTMLInputElement>();
    root.querySelectorAll<HTMLInputElement>('input[name="snack-choice"]').forEach((cb) => {
      const key = (cb.dataset.nama || cb.value || '').trim().toLowerCase();
      if (key) existingCheckboxes.set(key, cb);
    });

    rawItems.forEach((item) => {
      const itemKey = (item.name || '').trim().toLowerCase();
      const isActive = Boolean(item.is_active);
      if (isActive) activeCount++;

      const cb = existingCheckboxes.get(itemKey);
      if (cb) {
        // 1. Update harga dinamis
        const newPrice = Number(item.price) || 0;
        cb.dataset.price = String(newPrice);
        const card = cb.closest('label');
        const priceLabel = card?.querySelector('.snack-item-price');
        if (priceLabel) {
          priceLabel.textContent = formatRp(newPrice);
        }

        // 2. Update status ketersediaan
        if (!isActive) {
          if (cb.checked) {
            cb.checked = false;
          }
          cb.disabled = true;
          card?.classList.add('opacity-40', 'cursor-not-allowed', 'pointer-events-none');
          if (priceLabel) {
            priceLabel.textContent = `${formatRp(newPrice)} (Habis)`;
          }
        } else {
          cb.disabled = false;
          card?.classList.remove('opacity-40', 'cursor-not-allowed', 'pointer-events-none');
        }
      } else if (isActive) {
        // 3. Item baru dari backend yang belum ada di HTML statis
        const grid = root.querySelector(`[data-category-grid="${item.category}"]`);
        if (grid) {
          const label = document.createElement('label');
          label.dataset.snackCard = item.name;
          label.className =
            'group relative flex items-center justify-between gap-3 p-3.5 min-h-[48px] rounded-2xl border border-divider bg-surface/50 hover:bg-surface hover:border-accent/40 cursor-pointer transition-all touch-manipulation has-[:checked]:border-accent has-[:checked]:bg-accent-200/25';
          label.innerHTML = `
            <div class="flex items-center gap-3 min-w-0">
              <input
                type="checkbox"
                name="snack-choice"
                value="${item.name}"
                data-nama="${item.name}"
                data-price="${item.price}"
                data-kategori="${item.category}"
                class="size-5 rounded border-neutral-400 text-accent focus:ring-accent accent-accent cursor-pointer touch-manipulation"
              />
              <span class="text-sm font-medium text-neutral-900 truncate">
                ${item.name}
              </span>
            </div>
            <span class="snack-item-price text-xs font-semibold text-accent-700 whitespace-nowrap">
              ${formatRp(item.price)}
            </span>
          `;
          grid.appendChild(label);
          const newCb = label.querySelector<HTMLInputElement>('input[name="snack-choice"]');
          if (newCb) {
            newCb.addEventListener('change', () => recalculate(), { signal });
            existingCheckboxes.set(itemKey, newCb);
          }
        }
      }
    });

    if (counterEl && activeCount > 0) {
      counterEl.textContent = String(activeCount);
    }

    recalculate();
  }

  // SWR: 1. Baca cache lokal instan (0ms)
  try {
    const cached = sessionStorage.getItem(SNACK_CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed?.items)) {
        applyItemsToDOM(parsed.items);
      }
    }
  } catch {}

  // 2. Fetch data termutakhir dari backend
  try {
    const headers: Record<string, string> = {
      ...getCommonApiHeaders(),
      Accept: 'application/json',
    };
    if (apiBase.includes('ngrok')) {
      headers['ngrok-skip-browser-warning'] = 'true';
    }

    const res = await fetch(`${apiBase}/api/snack-items`, {
      headers,
      signal: AbortSignal.timeout(DEFAULT_TIMEOUT_MS),
    });

    if (res.ok) {
      const data = await res.json();
      const rawItems: BackendSnackItemDto[] = Array.isArray(data?.items) ? data.items : [];
      if (rawItems.length > 0) {
        sessionStorage.setItem(
          SNACK_CACHE_KEY,
          JSON.stringify({ timestamp: Date.now(), items: rawItems })
        );
        applyItemsToDOM(rawItems);
      }
    }
  } catch (err) {
    // Non-blocking fallback diam bila backend sedang offline / maintenance
    console.warn('[snackBoxController] Sync snack items from backend offline:', (err as Error)?.message || err);
  }
}

/**
 * Inisialisasi logika builder snack box kustom.
 */
export function initSnackBoxPage(): (() => void) | null {
  if (!document.getElementById('rakit')) return null;

  const ac = new AbortController();
  const { signal } = ac;

  // 1. Hash Scroll Navigation (untuk tautan #custom atau #snack-builder)
  function handleHashScroll(): void {
    const hash = window.location.hash;
    if (hash === '#custom' || hash === '#snack-builder') {
      const target = document.getElementById('panel-custom') || document.getElementById('snack-builder');
      target?.scrollIntoView({ behavior: 'smooth' });
    }
  }

  if (window.location.hash) {
    setTimeout(handleHashScroll, 120);
  }
  window.addEventListener('hashchange', handleHashScroll, { signal });

  // 2. Full Custom Builder from Scratch
  const root = document.getElementById('snack-builder');
  if (root) {
    let boxCount = 20;
    const minBoxes = 20;
    const maxBoxes = 500;
    const stepBoxes = 1;

    const boxInput = document.getElementById('builder-box-count') as HTMLInputElement | null;
    const boxMinusBtn = document.getElementById('builder-box-minus') as HTMLButtonElement | null;
    const boxPlusBtn = document.getElementById('builder-box-plus') as HTMLButtonElement | null;

    const itemCountDisplay = document.getElementById('summary-item-count');
    const subtotalDisplay = document.getElementById('summary-subtotal');
    const totalDisplay = document.getElementById('summary-total');
    const orderBtn = document.getElementById('builder-order-btn') as HTMLButtonElement | null;
    const largeNotice = document.getElementById('snack-builder-large-notice');
    const largeWaLink = document.getElementById('snack-builder-wa-admin-link') as HTMLAnchorElement | null;
    let isLargeOrderMode = false;
    let largeOrderPortion: number | null = null;

    function updateSnackLargeOrderNotice(inputQty?: number): void {
      if (!largeNotice) return;

      if (inputQty !== undefined) {
        if (inputQty > maxBoxes) {
          isLargeOrderMode = true;
          largeOrderPortion = inputQty;
        } else if (inputQty > 0) {
          isLargeOrderMode = false;
          largeOrderPortion = null;
        }
      } else if (!isLargeOrderMode) {
        const val = parseInt(boxInput?.value || '0', 10);
        if (val > maxBoxes) {
          isLargeOrderMode = true;
          largeOrderPortion = val;
        }
      }

      if (isLargeOrderMode) {
        if (largeWaLink) {
          const currentCheckboxes = root?.querySelectorAll<HTMLInputElement>('input[name="snack-choice"]') || [];
          const checkedCount = Array.from(currentCheckboxes).filter((cb) => cb.checked).length;
          const pkg = checkedCount > 0 ? buildSnackBoxPackageName(checkedCount) : 'Snack Box Custom Dzanis';
          const portionToUse = largeOrderPortion || parseInt(boxInput?.value || '0', 10);
          largeWaLink.href = buildLargeOrderWhatsAppUrl(waPhoneNumber, {
            packageName: pkg,
            portionCount: portionToUse,
          });
        }
        largeNotice.classList.remove('hidden');
      } else {
        largeNotice.classList.add('hidden');
      }
    }

    // Category Switching Elements
    const categoryButtons = root.querySelectorAll<HTMLButtonElement>('.category-filter-btn');
    const categoryBlocks = root.querySelectorAll<HTMLElement>('.category-block');
    const flowNav = document.getElementById('category-flow-nav');
    const nextBtn = document.getElementById('category-next-btn');
    const nextLabel = document.getElementById('category-next-label');
    const flowHint = document.getElementById('category-flow-hint');
    const summaryBar = document.getElementById('builder-summary-bar');

    const categoryOrder = Array.from(categoryButtons)
      .map((btn) => btn.dataset.categoryTarget || '')
      .filter((t) => t && t !== 'all');
    let activeCategory = categoryOrder[0] || 'all';

    function setActiveCategory(target: string, shouldScroll = true): void {
      activeCategory = target;
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const behavior: ScrollBehavior = prefersReduced ? 'auto' : 'smooth';

      let activeBtn: HTMLButtonElement | null = null;
      for (const btn of categoryButtons) {
        const isMatch = btn.dataset.categoryTarget === target;
        btn.setAttribute('aria-pressed', isMatch ? 'true' : 'false');
        if (isMatch) activeBtn = btn;
      }

      activeBtn?.scrollIntoView({ inline: 'center', block: 'nearest', behavior });

      if (target === 'all') {
        categoryBlocks.forEach((b) => b.classList.remove('hidden'));
        flowNav?.classList.add('hidden');
      } else {
        categoryBlocks.forEach((b) => {
          const match = b.dataset.categoryBlock === target;
          b.classList.toggle('hidden', !match);
        });

        const currentIdx = categoryOrder.indexOf(target);
        if (currentIdx !== -1 && currentIdx < categoryOrder.length - 1) {
          const nextCategory = categoryOrder[currentIdx + 1];
          if (nextLabel) nextLabel.textContent = `Lanjut ke: ${nextCategory} →`;
          if (flowHint) flowHint.textContent = `Langkah ${currentIdx + 1} dari ${categoryOrder.length}`;
          flowNav?.classList.remove('hidden');
        } else {
          if (nextLabel) nextLabel.textContent = `Lihat Ringkasan Pesanan ↓`;
          if (flowHint) flowHint.textContent = `Kategori Terakhir (${categoryOrder.length} dari ${categoryOrder.length})`;
          flowNav?.classList.remove('hidden');
        }
      }

      if (shouldScroll) {
        root?.scrollIntoView({ behavior, block: 'start' });
      }
    }

    categoryButtons.forEach((btn) => {
      btn.addEventListener(
        'click',
        () => {
          const target = btn.dataset.categoryTarget || 'all';
          setActiveCategory(target, false);
        },
        { signal }
      );
    });

    nextBtn?.addEventListener(
      'click',
      () => {
        const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const behavior: ScrollBehavior = prefersReduced ? 'auto' : 'smooth';
        const currentIdx = categoryOrder.indexOf(activeCategory);

        if (currentIdx === -1 || currentIdx >= categoryOrder.length - 1) {
          summaryBar?.scrollIntoView({ behavior, block: 'nearest' });
        } else {
          const nextCat = categoryOrder[currentIdx + 1];
          setActiveCategory(nextCat, true);
        }
      },
      { signal }
    );

    interface SelectedSnackItem {
      nama: string;
      harga: number;
    }

    function recalculate(): { selectedItems: SelectedSnackItem[]; subtotal: number; total: number } {
      let subtotal = 0;
      const selectedItems: SelectedSnackItem[] = [];
      const categoryCounts: Record<string, number> = {};
      const currentCheckboxes = root?.querySelectorAll<HTMLInputElement>('input[name="snack-choice"]') || [];

      currentCheckboxes.forEach((cb) => {
        if (cb.checked) {
          const price = Number(cb.dataset.price || 0);
          const name = cb.dataset.nama || cb.value;
          subtotal += price;
          selectedItems.push({ nama: name, harga: price });

          const cat = cb.dataset.kategori || '';
          if (cat) {
            categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
          }
        }
      });

      categoryButtons.forEach((btn) => {
        const target = btn.dataset.categoryTarget || '';
        const count = target === 'all' ? selectedItems.length : categoryCounts[target] || 0;
        const badge = btn.querySelector<HTMLElement>('[data-selected-count]');
        const srCount = btn.querySelector<HTMLElement>('.category-sr-count');
        const itemCount = btn.dataset.itemCount || '';

        if (badge) {
          badge.dataset.count = String(count);
          badge.textContent = String(count);
          badge.hidden = count === 0;
        }

        if (srCount) {
          srCount.textContent = count > 0 ? `, ${count} dipilih` : '';
        }

        const label = target === 'all' ? 'Semua' : target;
        btn.setAttribute(
          'aria-label',
          count > 0
            ? `${label} (${itemCount} pilihan, ${count} dipilih)`
            : `${label} (${itemCount} pilihan)`
        );
      });

      const total = subtotal * boxCount;

      if (itemCountDisplay) itemCountDisplay.textContent = `${selectedItems.length} macam`;
      if (subtotalDisplay) subtotalDisplay.textContent = formatRp(subtotal);
      if (totalDisplay) totalDisplay.textContent = formatRp(total);
      if (orderBtn) orderBtn.disabled = selectedItems.length === 0;

      return { selectedItems, subtotal, total };
    }

    function syncBoxUI(): void {
      if (boxInput) {
        boxInput.value = String(boxCount);
      }
      if (boxMinusBtn) {
        boxMinusBtn.disabled = boxCount <= minBoxes;
      }
      if (boxPlusBtn) {
        boxPlusBtn.disabled = boxCount >= maxBoxes;
      }
    }

    boxMinusBtn?.addEventListener(
      'click',
      () => {
        if (isLargeOrderMode) {
          isLargeOrderMode = false;
          largeOrderPortion = null;
          updateSnackLargeOrderNotice(boxCount);
          return;
        }
        if (boxCount > minBoxes) {
          boxCount -= stepBoxes;
          syncBoxUI();
          updateSnackLargeOrderNotice(boxCount);
          recalculate();
        }
      },
      { signal }
    );

    boxPlusBtn?.addEventListener(
      'click',
      () => {
        if (boxCount < maxBoxes) {
          boxCount += stepBoxes;
          syncBoxUI();
          updateSnackLargeOrderNotice(boxCount);
          recalculate();
        } else {
          updateSnackLargeOrderNotice(boxCount + 1);
        }
      },
      { signal }
    );

    boxInput?.addEventListener(
      'input',
      () => {
        const val = parseInt(boxInput.value, 10);
        updateSnackLargeOrderNotice(val);
        if (!isNaN(val) && val >= minBoxes) {
          boxCount = Math.min(val, maxBoxes);
          if (boxMinusBtn) boxMinusBtn.disabled = boxCount <= minBoxes;
          if (boxPlusBtn) boxPlusBtn.disabled = boxCount >= maxBoxes;
          recalculate();
        }
      },
      { signal }
    );

    function handleBoxInputBlurOrChange(): void {
      if (!boxInput) return;
      let val = parseInt(boxInput.value, 10);
      if (isNaN(val) || val < minBoxes) {
        val = minBoxes;
        isLargeOrderMode = false;
        largeOrderPortion = null;
        updateSnackLargeOrderNotice(val);
      } else if (val > maxBoxes) {
        updateSnackLargeOrderNotice(val);
        val = maxBoxes;
      } else if (!isLargeOrderMode) {
        updateSnackLargeOrderNotice(val);
      }
      boxCount = val;
      syncBoxUI();
      recalculate();
    }

    boxInput?.addEventListener('blur', handleBoxInputBlurOrChange, { signal });
    boxInput?.addEventListener('change', handleBoxInputBlurOrChange, { signal });
    boxInput?.addEventListener(
      'keydown',
      (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          boxInput.blur();
        }
      },
      { signal }
    );

    // Pasang listener awal pada checkbox bawaan HTML
    const initialCheckboxes = root.querySelectorAll<HTMLInputElement>('input[name="snack-choice"]');
    initialCheckboxes.forEach((cb) => {
      cb.addEventListener(
        'change',
        () => {
          recalculate();
          if (isLargeOrderMode) {
            updateSnackLargeOrderNotice();
          }
        },
        { signal }
      );
    });

    orderBtn?.addEventListener(
      'click',
      () => {
        if (isLargeOrderMode || (boxInput && parseInt(boxInput.value, 10) > maxBoxes)) {
          if (boxInput && parseInt(boxInput.value, 10) > maxBoxes) {
            const val = parseInt(boxInput.value, 10);
            boxInput.value = String(maxBoxes);
            updateSnackLargeOrderNotice(val);
          }
          largeNotice?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          largeWaLink?.focus();
          return;
        }

        if (boxInput) {
          let val = parseInt(boxInput.value, 10);
          if (isNaN(val) || val < minBoxes) {
            val = minBoxes;
          }
          boxCount = val;
          syncBoxUI();
        }

        const { selectedItems, subtotal, total } = recalculate();
        if (selectedItems.length === 0) return;

        const packageName = buildSnackBoxPackageName(selectedItems.length);
        const customDetails = buildSnackBoxCustomDetails(selectedItems, {
          subtotal,
          total,
          boxCount,
        });

        const modalPayload: OrderModalPrefill = {
          packageName,
          portionCount: boxCount,
          customDetails,
          minOrder: minBoxes,
          minOrderWeekend: 40,
          maxOrder: maxBoxes,
        };

        window.dispatchEvent(
          new CustomEvent('open-order-modal', {
            detail: modalPayload,
          })
        );
      },
      { signal }
    );

    // Inisialisasi awal UI
    syncBoxUI();
    setActiveCategory(activeCategory, false);
    recalculate();

    // 🚀 Jalankan sinkronisasi data termutakhir dari backend secara asinkron
    syncSnackCatalogFromBackend(root, recalculate, signal);
  }

  return () => ac.abort();
}

/**
 * Teardown seluruh controller snack box.
 */
export function teardownSnackBoxController(): void {
  teardowns.forEach((fn) => fn());
  teardowns = [];
}

/**
 * Inisialisasi utama controller snack box.
 */
export function initSnackBoxController(): void {
  teardownSnackBoxController();
  const pageTeardown = initSnackBoxPage();

  teardowns = [pageTeardown].filter(
    (fn): fn is () => void => typeof fn === 'function'
  );
}

// Lifecycle listeners untuk Astro Transitions
if (typeof window !== 'undefined') {
  document.addEventListener('astro:page-load', () => {
    isSnackBoxLoaded = true;
    initSnackBoxController();
  });

  document.addEventListener('astro:before-swap', () => {
    teardownSnackBoxController();
  });

  if (document.readyState === 'loading') {
    document.addEventListener(
      'DOMContentLoaded',
      () => {
        if (!isSnackBoxLoaded) {
          initSnackBoxController();
        }
      },
      { once: true }
    );
  } else if (!isSnackBoxLoaded) {
    initSnackBoxController();
  }
}
