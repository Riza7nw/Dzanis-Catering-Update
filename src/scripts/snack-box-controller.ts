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
 * Dapatkan atau buat container grid untuk kategori snack di DOM.
 */
function getOrCreateCategoryGrid(root: HTMLElement, categoryName: string): HTMLElement {
  let grid = root.querySelector<HTMLElement>(`[data-category-grid="${categoryName}"]`);
  if (grid) return grid;

  // 1. Dapatkan / Buat Wrapper Kategori di DOM
  let wrapper = document.getElementById('snack-categories-wrapper');
  if (!wrapper) {
    wrapper = root.querySelector('#snack-categories-wrapper') || root.querySelector('.snack-categories-wrapper');
  }

  // 2. Buat Elemen Blok Kategori Baru
  const block = document.createElement('div');
  block.dataset.categoryBlock = categoryName;
  block.className = 'category-block hidden';
  block.innerHTML = `
    <div class="flex items-center gap-2.5 mb-4">
      <span class="size-2 rounded-full bg-accent"></span>
      <h3 class="font-heading text-lg font-semibold text-neutral-900">
        ${categoryName}
      </h3>
      <span class="text-xs text-neutral-500 font-mono category-header-count">(0 pilihan)</span>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3" data-category-grid="${categoryName}"></div>
  `;

  if (wrapper) {
    wrapper.appendChild(block);
  } else {
    root.appendChild(block);
  }

  // 3. Buat Tombol Tab Navigasi Kategori Baru jika belum ada
  const filterBar = root.querySelector('.category-filter-bar');
  if (filterBar && !root.querySelector(`[data-category-target="${categoryName}"]`)) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.setAttribute('aria-pressed', 'false');
    btn.dataset.categoryTarget = categoryName;
    btn.dataset.itemCount = '0';
    btn.className =
      'category-filter-btn group/catbtn relative shrink-0 rounded-full px-4 sm:px-5 py-2.5 min-h-[44px] text-xs font-semibold transition-all cursor-pointer border border-divider bg-surface text-neutral-700 hover:bg-neutral-200/70 aria-pressed:bg-accent aria-pressed:text-bg aria-pressed:border-accent shadow-xs flex items-center gap-1.5 touch-manipulation';
    btn.setAttribute('aria-label', `${categoryName} (0 pilihan)`);
    btn.innerHTML = `
      <span class="category-name">${categoryName}</span>
      <span class="text-[10px] opacity-70 category-pill-count">(0)</span>
      <span
        data-selected-count="${categoryName}"
        data-count="0"
        hidden
        class="ml-0.5 data-[count='0']:hidden inline-flex size-5 rounded-full bg-accent text-bg group-aria-pressed/catbtn:bg-white/25 group-aria-pressed/catbtn:text-white text-[10px] items-center justify-center font-bold"
        aria-hidden="true"
      >0</span>
      <span class="sr-only category-sr-count"></span>
    `;
    filterBar.appendChild(btn);
  }

  return block.querySelector<HTMLElement>(`[data-category-grid="${categoryName}"]`)!;
}

/**
 * Sinkronisasi data katalog snack items dari backend API (/api/snack-items).
 * Menyesuaikan harga, status ketersediaan (aktif/habis), penambahan, pemindahan kategori,
 * dan penghapusan item secara dinamis pada DOM.
 */
async function syncSnackCatalogFromBackend(
  root: HTMLElement,
  recalculate: () => void,
  setActiveCategory: (cat: string, scroll?: boolean) => void,
  getActiveCategory: () => string,
  signal: AbortSignal
): Promise<void> {
  const apiBase = getApiBaseUrl();

  function applyItemsToDOM(rawItems: BackendSnackItemDto[]) {
    if (!Array.isArray(rawItems)) return;

    // Peta normalisasi item dari backend berdasarkan nama (lowercase)
    const backendItemMap = new Map<string, BackendSnackItemDto>();
    rawItems.forEach((item) => {
      const key = (item.name || '').trim().toLowerCase();
      if (key) {
        backendItemMap.set(key, item);
      }
    });

    // 1. Rekonsiliasi elemen kartu snack yang sudah ada di DOM
    const existingCards = root.querySelectorAll<HTMLElement>('[data-snack-card]');
    existingCards.forEach((card) => {
      const cb = card.querySelector<HTMLInputElement>('input[name="snack-choice"]');
      const key = (cb?.dataset.nama || cb?.value || card.dataset.snackCard || '').trim().toLowerCase();

      // A. Item sudah dihapus di database backend -> hapus permanen dari DOM
      if (!backendItemMap.has(key)) {
        if (cb && cb.checked) {
          cb.checked = false;
        }
        card.remove();
        return;
      }

      // B. Item masih ada -> sinkronisasi harga, status, dan pemindahan kategori
      const item = backendItemMap.get(key)!;
      const newPrice = Number(item.price) || 0;
      const newCat = item.category || 'Lainnya';
      const isActive = Boolean(item.is_active);

      if (cb) {
        cb.dataset.price = String(newPrice);
        cb.dataset.kategori = newCat;
        cb.value = item.name;
        cb.dataset.nama = item.name;
      }

      const priceLabel = card.querySelector('.snack-item-price');

      // Periksa apakah kategori item berubah dan pindahkan kartu ke grid yang benar
      const currentGrid = card.closest('[data-category-grid]');
      if (currentGrid && currentGrid.getAttribute('data-category-grid') !== newCat) {
        const targetGrid = getOrCreateCategoryGrid(root, newCat);
        targetGrid.appendChild(card);
      }

      if (!isActive) {
        if (cb && cb.checked) {
          cb.checked = false;
        }
        if (cb) cb.disabled = true;
        card.classList.add('opacity-40', 'cursor-not-allowed', 'pointer-events-none');
        if (priceLabel) {
          priceLabel.textContent = `${formatRp(newPrice)} (Habis)`;
        }
      } else {
        if (cb) cb.disabled = false;
        card.classList.remove('opacity-40', 'cursor-not-allowed', 'pointer-events-none');
        if (priceLabel) {
          priceLabel.textContent = formatRp(newPrice);
        }
      }
    });

    // 2. Tambahkan item baru dari backend yang belum ada di HTML statis
    const currentKeys = new Set<string>();
    root.querySelectorAll<HTMLInputElement>('input[name="snack-choice"]').forEach((cb) => {
      const key = (cb.dataset.nama || cb.value || '').trim().toLowerCase();
      if (key) currentKeys.add(key);
    });

    rawItems.forEach((item) => {
      const key = (item.name || '').trim().toLowerCase();
      if (!key || currentKeys.has(key)) return;

      const targetGrid = getOrCreateCategoryGrid(root, item.category || 'Lainnya');
      const isActive = Boolean(item.is_active);
      const price = Number(item.price) || 0;

      const label = document.createElement('label');
      label.dataset.snackCard = item.name;
      label.className =
        'group relative flex items-center justify-between gap-3 p-3.5 min-h-[48px] rounded-2xl border border-divider bg-surface/50 hover:bg-surface hover:border-accent/40 cursor-pointer transition-all touch-manipulation has-[:checked]:border-accent has-[:checked]:bg-accent-200/25' +
        (!isActive ? ' opacity-40 cursor-not-allowed pointer-events-none' : '');
      label.innerHTML = `
        <div class="flex items-center gap-3 min-w-0">
          <input
            type="checkbox"
            name="snack-choice"
            value="${item.name}"
            data-nama="${item.name}"
            data-price="${price}"
            data-kategori="${item.category || 'Lainnya'}"
            ${!isActive ? 'disabled' : ''}
            class="size-5 rounded border-neutral-400 text-accent focus:ring-accent accent-accent cursor-pointer touch-manipulation"
          />
          <span class="text-sm font-medium text-neutral-900 truncate">
            ${item.name}
          </span>
        </div>
        <span class="snack-item-price text-xs font-semibold text-accent-700 whitespace-nowrap">
          ${formatRp(price)}${!isActive ? ' (Habis)' : ''}
        </span>
      `;
      targetGrid.appendChild(label);
      currentKeys.add(key);
    });

    // 3. Perbarui seluruh counter kategori dan sembunyikan kategori kosong
    const blocks = root.querySelectorAll<HTMLElement>('.category-block');
    blocks.forEach((block) => {
      const catName = block.dataset.categoryBlock || '';
      const grid = block.querySelector('[data-category-grid]');
      const cardsInGrid = grid?.querySelectorAll('[data-snack-card]') || [];
      const count = cardsInGrid.length;

      const filterBtn = root.querySelector<HTMLButtonElement>(`[data-category-target="${catName}"]`);
      const headerCount =
        block.querySelector<HTMLElement>('.category-header-count') ||
        block.querySelector<HTMLElement>('.font-mono');

      if (headerCount) {
        headerCount.textContent = `(${count} pilihan)`;
      }

      if (filterBtn) {
        filterBtn.dataset.itemCount = String(count);
        const pillCount =
          filterBtn.querySelector<HTMLElement>('.category-pill-count') ||
          filterBtn.querySelector<HTMLElement>('.text-\\[10px\\]');
        if (pillCount) {
          pillCount.textContent = `(${count})`;
        }
        filterBtn.setAttribute('aria-label', `${catName} (${count} pilihan)`);
      }

      if (count === 0) {
        block.dataset.emptyCategory = 'true';
        block.classList.add('hidden');
        if (filterBtn) filterBtn.classList.add('hidden');
      } else {
        delete block.dataset.emptyCategory;
        if (filterBtn) filterBtn.classList.remove('hidden');
      }
    });

    // 3.5 Tampilkan atau Sembunyikan Empty State jika seluruh jajanan kosong
    const emptyEl = document.getElementById('snack-catalog-empty');
    const filterNavWrap =
      document.getElementById('category-filter-nav-wrap') ||
      root.querySelector('.category-filter-bar')?.parentElement;
    const flowNav = document.getElementById('category-flow-nav');

    if (rawItems.length === 0) {
      if (emptyEl) {
        emptyEl.classList.remove('hidden');
        emptyEl.classList.add('flex');
      }
      filterNavWrap?.classList.add('hidden');
      flowNav?.classList.add('hidden');
    } else {
      if (emptyEl) {
        emptyEl.classList.add('hidden');
        emptyEl.classList.remove('flex');
      }
      filterNavWrap?.classList.remove('hidden');
    }

    // 4. Perbarui Total Counter di Header dan Tombol Tab "Semua"
    const activeCheckboxes = root.querySelectorAll<HTMLInputElement>(
      'input[name="snack-choice"]:not(:disabled)'
    );
    const totalActive = activeCheckboxes.length;
    const counterEl = document.getElementById('total-snack-counter');
    if (counterEl) {
      counterEl.textContent = String(totalActive);
    }

    const allBtn = root.querySelector<HTMLButtonElement>('[data-category-target="all"]');
    if (allBtn) {
      allBtn.dataset.itemCount = String(totalActive);
      const allPillCount =
        allBtn.querySelector<HTMLElement>('.category-pill-count') ||
        allBtn.querySelector<HTMLElement>('.text-\\[10px\\]');
      if (allPillCount) {
        allPillCount.textContent = `(${totalActive})`;
      }
      allBtn.setAttribute('aria-label', `Semua (${totalActive} pilihan)`);
    }

    // 5. Validasi kategori aktif saat ini
    const currentButtons = root.querySelectorAll<HTMLButtonElement>('.category-filter-btn:not(.hidden)');
    const validTargets = Array.from(currentButtons)
      .map((b) => b.dataset.categoryTarget || '')
      .filter((t) => t && t !== 'all');
    let currentActive = getActiveCategory();
    if (validTargets.length === 0) {
      setActiveCategory('all', false);
    } else if (currentActive !== 'all' && !validTargets.includes(currentActive)) {
      currentActive = validTargets[0] || 'all';
      setActiveCategory(currentActive, false);
    } else {
      setActiveCategory(currentActive, false);
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

  // 2. Fetch data termutakhir dari backend (Bypass Cache Browser dengan no-cache & timestamp unik)
  try {
    const headers: Record<string, string> = {
      ...getCommonApiHeaders(),
      Accept: 'application/json',
    };
    if (apiBase.includes('ngrok')) {
      headers['ngrok-skip-browser-warning'] = 'true';
    }

    const res = await fetch(`${apiBase}/api/snack-items?all=true&t=${Date.now()}`, {
      headers,
      cache: 'no-cache',
      signal: AbortSignal.timeout(DEFAULT_TIMEOUT_MS),
    });

    if (res.ok) {
      const data = await res.json();
      const rawItems: BackendSnackItemDto[] = Array.isArray(data?.items) ? data.items : [];
      sessionStorage.setItem(
        SNACK_CACHE_KEY,
        JSON.stringify({ timestamp: Date.now(), items: rawItems })
      );
      applyItemsToDOM(rawItems);
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

    // Category Switching Elements & Helpers
    const getCategoryButtons = () => root.querySelectorAll<HTMLButtonElement>('.category-filter-btn');
    const getCategoryBlocks = () => root.querySelectorAll<HTMLElement>('.category-block');
    const flowNav = document.getElementById('category-flow-nav');
    const nextBtn = document.getElementById('category-next-btn');
    const nextLabel = document.getElementById('category-next-label');
    const flowHint = document.getElementById('category-flow-hint');
    const summaryBar = document.getElementById('builder-summary-bar');

    const initialButtons = getCategoryButtons();
    const initialOrder = Array.from(initialButtons)
      .map((btn) => btn.dataset.categoryTarget || '')
      .filter((t) => t && t !== 'all');
    let activeCategory = initialOrder[0] || 'all';

    function setActiveCategory(target: string, shouldScroll = true): void {
      activeCategory = target;
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const behavior: ScrollBehavior = prefersReduced ? 'auto' : 'smooth';

      const buttons = getCategoryButtons();
      const blocks = getCategoryBlocks();
      const categoryOrder = Array.from(buttons)
        .filter((btn) => !btn.classList.contains('hidden'))
        .map((btn) => btn.dataset.categoryTarget || '')
        .filter((t) => t && t !== 'all');

      let activeBtn: HTMLButtonElement | null = null;
      buttons.forEach((btn) => {
        const isMatch = btn.dataset.categoryTarget === target;
        btn.setAttribute('aria-pressed', isMatch ? 'true' : 'false');
        if (isMatch) activeBtn = btn;
      });

      activeBtn?.scrollIntoView({ inline: 'center', block: 'nearest', behavior });

      if (target === 'all') {
        blocks.forEach((b) => {
          if (b.dataset.emptyCategory === 'true') {
            b.classList.add('hidden');
          } else {
            b.classList.remove('hidden');
          }
        });
        flowNav?.classList.add('hidden');
      } else {
        blocks.forEach((b) => {
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

    // Delegasi Klik Filter Tab Kategori pada root
    root.addEventListener(
      'click',
      (e) => {
        const target = e.target as HTMLElement | null;
        const btn = target?.closest<HTMLButtonElement>('.category-filter-btn');
        if (btn && root.contains(btn)) {
          const cat = btn.dataset.categoryTarget || 'all';
          setActiveCategory(cat, false);
        }
      },
      { signal }
    );

    nextBtn?.addEventListener(
      'click',
      () => {
        const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const behavior: ScrollBehavior = prefersReduced ? 'auto' : 'smooth';
        const buttons = getCategoryButtons();
        const categoryOrder = Array.from(buttons)
          .filter((btn) => !btn.classList.contains('hidden'))
          .map((btn) => btn.dataset.categoryTarget || '')
          .filter((t) => t && t !== 'all');
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

      const buttons = getCategoryButtons();
      buttons.forEach((btn) => {
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

    // Delegasi Event Change pada Checkbox Pilihan Snack (Mendukung item statis maupun dinamis)
    root.addEventListener(
      'change',
      (e) => {
        const target = e.target as HTMLInputElement | null;
        if (target && target.name === 'snack-choice') {
          recalculate();
          if (isLargeOrderMode) {
            updateSnackLargeOrderNotice();
          }
        }
      },
      { signal }
    );

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
    syncSnackCatalogFromBackend(root, recalculate, setActiveCategory, () => activeCategory, signal);
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
