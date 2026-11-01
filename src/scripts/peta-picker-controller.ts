/**
 * Client Controller: Peta Picker Controller
 * Mengelola peta interaktif penentuan titik pengantaran katering:
 * - Lazy dynamic import library Leaflet (0 KB beban pada critical path halaman awal)
 * - Injeksi stylesheet Leaflet mandiri (/vendor/leaflet/leaflet.css) tanpa CDN unpkg
 * - Pin marker terakota katering dengan pulse animasi dan drag & drop
 * - Reverse Geocoding (Nominatim OpenStreetMap) dengan debouncing rate-limit 400 ms
 * - Fitur pencarian lokasi jalan/desa/kecamatan dengan pembatasan area Ciayumajakuning
 * - Deteksi GPS perangkat (Geolocation API) dengan validasi akurasi routing ISP
 * - Pengelolaan lifecycle dialog modal dan Astro Transitions tanpa kebocoran listener
 */

import { reverseGeocode, searchAddress } from '../services/api/geocodingService';

export interface UserLocationResult {
  lat: number;
  lng: number;
  accuracy: number;
}

interface MapInstanceState {
  map: import('leaflet').Map | null;
  marker: import('leaflet').Marker | null;
  abortController: AbortController | null;
  searchAbortController: AbortController | null;
  cancelDebouncedReverseGeocode: (() => void) | null;
  cancelDebouncedSearch: (() => void) | null;
  observer: MutationObserver | null;
  isInitialized: boolean;
  isLoadingLeaflet: boolean;
  hasAutoLocated: boolean;
  userHasModifiedPoint: boolean;
}

let leafletModule: typeof import('leaflet') | null = null;
let lifecycleAbortController: AbortController | null = null;
let isPetaPickerLoaded = false;

const state: MapInstanceState = {
  map: null,
  marker: null,
  abortController: null,
  searchAbortController: null,
  cancelDebouncedReverseGeocode: null,
  cancelDebouncedSearch: null,
  observer: null,
  isInitialized: false,
  isLoadingLeaflet: false,
  hasAutoLocated: false,
  userHasModifiedPoint: false,
};

// Koordinat operasional default: Majalengka / Ciayumajakuning
const DEFAULT_LAT = -6.836;
const DEFAULT_LNG = 108.227;
const DEFAULT_ZOOM = 13;

/**
 * Helper utilitas debounce murni dengan dukungan pembatalan (cancel).
 * Digunakan untuk membatasi frekuensi pemanggilan reverse-geocoding dan pencarian alamat.
 * @param fn Fungsi target yang akan didebounce.
 * @param waitMs Waktu jeda penundaan dalam milidetik (default: 400 ms).
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  waitMs = 400
): ((...args: Parameters<T>) => void) & { cancel: () => void } {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const debounced = (...args: Parameters<T>) => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      timeoutId = null;
      fn(...args);
    }, waitMs);
  };

  debounced.cancel = () => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  return debounced;
}

/**
 * Injeksi stylesheet Leaflet ke dalam <head> secara dinamis jika belum tersedia.
 * Menggunakan stylesheet mandiri (self-hosted) dari /vendor/leaflet/leaflet.css
 */
export function injectLeafletCss(): void {
  if (typeof document === 'undefined') return;
  if (!document.getElementById('leaflet-core-css')) {
    const link = document.createElement('link');
    link.id = 'leaflet-core-css';
    link.rel = 'stylesheet';
    link.href = '/vendor/leaflet/leaflet.css';
    document.head.appendChild(link);
  }
}

/**
 * Memuat library Leaflet secara dinamis (lazy load chunk via Vite).
 * Menjamin stylesheet selalu terinjeksi pada Astro View Transitions.
 */
export async function loadLeafletModule(): Promise<typeof import('leaflet')> {
  injectLeafletCss();
  if (leafletModule) {
    if ((leafletModule as any).Icon?.Default) {
      (leafletModule as any).Icon.Default.imagePath = '/vendor/leaflet/images/';
    }
    return leafletModule;
  }

  const L = await import('leaflet');
  leafletModule = (L as any).default || L;
  if ((leafletModule as any).Icon?.Default) {
    (leafletModule as any).Icon.Default.imagePath = '/vendor/leaflet/images/';
  }
  return leafletModule!;
}

/**
 * Cek apakah koordinat berada di dalam batas wajar area layanan Ciayumajakuning & Jawa Barat sekitarnya.
 */
function isWithinOperationalArea(lat: number, lng: number): boolean {
  return lat >= -7.45 && lat <= -6.20 && lng >= 107.75 && lng <= 109.05;
}

function createCustomIcon(L: typeof import('leaflet')) {
  const html = `
    <div class="dz-pin-container">
      <div class="dz-pin-pulse"></div>
      <svg viewBox="0 0 32 42" width="34" height="44" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 3px 5px rgba(42,39,31,0.35));">
        <path d="M16 0C7.163 0 0 7.163 0 16c0 11.5 16 26 16 26s16-14.5 16-26c0-8.837-7.163-16-16-16z" fill="#b04a22"/>
        <path d="M16 2C8.268 2 2 8.268 2 16c0 10.2 14 23.3 14 23.3S30 26.2 30 16C30 8.268 23.732 2 16 2z" fill="#8a3a1a" opacity="0.35"/>
        <circle cx="16" cy="15" r="6" fill="#fffcf6"/>
        <circle cx="16" cy="15" r="3" fill="#b04a22"/>
      </svg>
    </div>
  `;
  return L.divIcon({
    html,
    className: 'dz-custom-marker',
    iconSize: [34, 44],
    iconAnchor: [17, 44],
    popupAnchor: [0, -44],
  });
}

function updateStatus(type: 'idle' | 'loading' | 'success' | 'warning', message: string): void {
  const statusText = document.getElementById('peta-status-text');
  const statusIcon = document.getElementById('peta-status-icon');
  const statusContainer = document.getElementById('peta-geocoding-status');
  if (!statusText || !statusIcon || !statusContainer) return;

  statusText.textContent = message;

  if (type === 'loading') {
    statusIcon.innerHTML = `
      <svg class="size-3.5 animate-spin text-accent" viewBox="0 0 24 24" fill="none">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
      </svg>
    `;
    statusContainer.className = 'flex items-center gap-1.5 text-xs text-accent font-medium transition-colors';
  } else if (type === 'success') {
    statusIcon.textContent = '✓';
    statusContainer.className = 'flex items-center gap-1.5 text-xs text-emerald-700 font-medium transition-colors';
  } else if (type === 'warning') {
    statusIcon.textContent = '⚠️';
    statusContainer.className = 'flex items-center gap-1.5 text-xs text-amber-700 font-medium transition-colors';
  } else {
    statusIcon.textContent = '📍';
    statusContainer.className = 'flex items-center gap-1.5 text-xs text-neutral-600 transition-colors';
  }
}

function showAccuracyWarning(show: boolean): void {
  const warning = document.getElementById('peta-accuracy-warning');
  if (!warning) return;
  if (show) {
    warning.classList.remove('hidden');
  } else {
    warning.classList.add('hidden');
  }
}

function updateCoordinatesDisplay(lat: number, lng: number): void {
  const wrapper = document.querySelector('.peta-picker-wrapper') as HTMLElement | null;
  const latInputId = wrapper?.dataset.latInput || 'delivery-lat';
  const lngInputId = wrapper?.dataset.lngInput || 'delivery-lng';

  const latInput = document.getElementById(latInputId) as HTMLInputElement | null;
  const lngInput = document.getElementById(lngInputId) as HTMLInputElement | null;

  if (latInput) latInput.value = lat.toFixed(6);
  if (lngInput) lngInput.value = lng.toFixed(6);

  // Update preview link
  const previewWrap = document.getElementById('peta-preview-link-wrap');
  const previewLink = document.getElementById('peta-preview-link') as HTMLAnchorElement | null;
  if (previewWrap && previewLink) {
    previewLink.href = `https://www.google.com/maps?q=${lat.toFixed(6)},${lng.toFixed(6)}`;
    previewWrap.classList.remove('hidden');
  }
}

function clearCoordinatesDisplay(): void {
  const wrapper = document.querySelector('.peta-picker-wrapper') as HTMLElement | null;
  const latInputId = wrapper?.dataset.latInput || 'delivery-lat';
  const lngInputId = wrapper?.dataset.lngInput || 'delivery-lng';

  const latInput = document.getElementById(latInputId) as HTMLInputElement | null;
  const lngInput = document.getElementById(lngInputId) as HTMLInputElement | null;

  if (latInput) latInput.value = '';
  if (lngInput) lngInput.value = '';

  const previewWrap = document.getElementById('peta-preview-link-wrap');
  const previewLink = document.getElementById('peta-preview-link') as HTMLAnchorElement | null;
  if (previewWrap) previewWrap.classList.add('hidden');
  if (previewLink) previewLink.href = '#';
}

export const debouncedReverseGeocode = debounce((lat: number, lng: number) => {
  performReverseGeocoding(lat, lng);
}, 400);

state.cancelDebouncedReverseGeocode = () => debouncedReverseGeocode.cancel();

async function performReverseGeocoding(lat: number, lng: number): Promise<void> {
  const wrapper = document.querySelector('.peta-picker-wrapper') as HTMLElement | null;
  const targetTextareaId = wrapper?.dataset.targetTextarea || 'customer-address';
  const textarea = document.getElementById(targetTextareaId) as HTMLTextAreaElement | null;

  if (state.abortController) {
    state.abortController.abort();
  }
  state.abortController = new AbortController();

  updateStatus('loading', 'Mencari alamat dari titik peta...');

  try {
    const address = await reverseGeocode(lat, lng, state.abortController.signal);

    if (address && textarea) {
      textarea.value = address;
      // Trigger event input dan change agar form validation langsung mendeteksi nilainya
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
      textarea.dispatchEvent(new Event('change', { bubbles: true }));
      updateStatus('success', 'Alamat terisi dari titik peta (silakan lengkapi jika ada patokan).');
    } else {
      updateStatus('warning', 'Titik tersimpan. Silakan ketik nama jalan / blok secara manual.');
    }
  } catch (err: any) {
    if (err?.name === 'AbortError') return;
    console.warn('[petaPickerController] Reverse geocode warning:', err);
    updateStatus(
      'warning',
      'Gagal memuat nama jalan otomatis. Titik koordinat tetap tersimpan, silakan ketik alamat manual.'
    );
  }
}

function handlePointSelection(lat: number, lng: number, shouldGeocode = true): void {
  updateCoordinatesDisplay(lat, lng);

  if (!shouldGeocode) return;

  // Berikan feedback visual instan selagi jeda debounce 400 ms berjalan
  updateStatus('loading', 'Menyiapkan pencarian alamat...');

  // Terapkan debounce 400 ms guna mencegah rate limiting (HTTP 429) Nominatim
  debouncedReverseGeocode(lat, lng);
}

/**
 * Fitur Pencarian Lokasi menggunakan Nominatim Search API
 */
async function performSearch(query: string): Promise<void> {
  const trimmed = query.trim();
  if (!trimmed) return;

  const resultsContainer = document.getElementById('peta-search-results');
  const btnSearchLabel = document.getElementById('btn-search-label');
  if (!resultsContainer) return;

  if (state.searchAbortController) {
    state.searchAbortController.abort();
  }
  state.searchAbortController = new AbortController();

  if (btnSearchLabel) btnSearchLabel.textContent = '...';
  updateStatus('loading', `Mencari lokasi: "${trimmed}"...`);

  resultsContainer.innerHTML = `
    <div class="px-3 py-2 text-xs text-neutral-500 flex items-center gap-2">
      <svg class="size-3.5 animate-spin text-accent" viewBox="0 0 24 24" fill="none">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
      </svg>
      <span>Mencari lokasi di peta...</span>
    </div>
  `;
  resultsContainer.classList.remove('hidden');

  try {
    const items = await searchAddress(trimmed, state.searchAbortController.signal);

    if (!Array.isArray(items) || items.length === 0) {
      resultsContainer.innerHTML = `
        <div class="px-3 py-2.5 text-xs text-neutral-600">
          Lokasi tidak ditemukan. Coba ketik nama desa, jalan, atau kecamatan yang lebih spesifik.
        </div>
      `;
      updateStatus('warning', 'Lokasi tidak ditemukan. Coba kata kunci lain.');
      return;
    }

    resultsContainer.innerHTML = '';
    items.forEach((item) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className =
        'w-full text-left px-3 py-2 rounded-lg hover:bg-[var(--color-surface)] text-xs text-neutral-800 transition flex flex-col gap-0.5 cursor-pointer border-b border-neutral-100 last:border-b-0';

      const titleSpan = document.createElement('span');
      titleSpan.className = 'font-semibold text-neutral-900';
      titleSpan.textContent = item.name;

      const descSpan = document.createElement('span');
      descSpan.className = 'text-[11px] text-neutral-500 truncate w-full';
      descSpan.textContent = item.displayName;

      btn.appendChild(titleSpan);
      btn.appendChild(descSpan);

      btn.addEventListener('click', () => {
        state.userHasModifiedPoint = true;
        // Batalkan reverse geocoding tertunda agar tidak menimpa hasil pilihan pencarian
        debouncedReverseGeocode.cancel();
        if (state.abortController) {
          state.abortController.abort();
          state.abortController = null;
        }

        const lat = item.lat;
        const lng = item.lng;
        resultsContainer.classList.add('hidden');

        const searchInput = document.getElementById('peta-search-input') as HTMLInputElement | null;
        if (searchInput) searchInput.value = item.name;

        // Pindahkan peta & marker
        if (state.map && state.marker) {
          state.map.setView([lat, lng], 16, { animate: true });
          state.marker.setLatLng([lat, lng]);
        }

        // Update hidden inputs dan textarea form
        updateCoordinatesDisplay(lat, lng);

        const wrapper = document.querySelector('.peta-picker-wrapper') as HTMLElement | null;
        const targetTextareaId = wrapper?.dataset.targetTextarea || 'customer-address';
        const textarea = document.getElementById(targetTextareaId) as HTMLTextAreaElement | null;
        if (textarea) {
          textarea.value = item.displayName;
          textarea.dispatchEvent(new Event('input', { bubbles: true }));
          textarea.dispatchEvent(new Event('change', { bubbles: true }));
        }

        showAccuracyWarning(false);
        updateStatus('success', `✓ Titik peta dipindahkan ke: ${item.name}`);
      });

      resultsContainer.appendChild(btn);
    });

    updateStatus('idle', `Ditemukan ${items.length} hasil pencarian. Klik salah satu untuk memilih.`);
  } catch (err: any) {
    if (err?.name === 'AbortError') return;
    console.warn('[petaPickerController] Search error:', err);
    resultsContainer.innerHTML = `
      <div class="px-3 py-2 text-xs text-amber-800">
        Gagal mencari lokasi. Periksa koneksi internet Anda atau geser pin langsung pada peta.
      </div>
    `;
    updateStatus('warning', 'Gagal memuat hasil pencarian.');
  } finally {
    if (btnSearchLabel) btnSearchLabel.textContent = 'Cari';
  }
}

function setupSearchFeature(signal: AbortSignal): void {
  const searchInput = document.getElementById('peta-search-input') as HTMLInputElement | null;
  const btnSearch = document.getElementById('btn-peta-search') as HTMLButtonElement | null;
  const clearBtn = document.getElementById('peta-search-clear') as HTMLButtonElement | null;
  const resultsContainer = document.getElementById('peta-search-results');

  if (!searchInput || !btnSearch) return;

  // Debounce 400 ms pada input event pencarian alamat manual guna mencegah rate limiting Nominatim
  const debouncedSearch = debounce((query: string) => {
    const trimmed = query.trim();
    if (trimmed.length >= 3) {
      performSearch(trimmed);
    } else if (!trimmed && resultsContainer) {
      resultsContainer.classList.add('hidden');
    }
  }, 400);

  state.cancelDebouncedSearch = () => debouncedSearch.cancel();

  const execute = () => {
    debouncedSearch.cancel();
    if (searchInput.value.trim()) {
      performSearch(searchInput.value);
    }
  };

  // KRUSIAL: Cegah submit form utama saat menekan tombol Enter pada search input
  searchInput.addEventListener(
    'keydown',
    (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        execute();
      } else if (e.key === 'Escape') {
        debouncedSearch.cancel();
        resultsContainer?.classList.add('hidden');
      }
    },
    { signal }
  );

  searchInput.addEventListener(
    'input',
    () => {
      const val = searchInput.value;
      if (clearBtn) {
        if (val.length > 0) {
          clearBtn.classList.remove('hidden');
          clearBtn.classList.add('flex');
        } else {
          clearBtn.classList.add('hidden');
          clearBtn.classList.remove('flex');
        }
      }

      if (val.trim().length >= 3) {
        debouncedSearch(val);
      } else {
        debouncedSearch.cancel();
        if (resultsContainer) resultsContainer.classList.add('hidden');
      }
    },
    { signal }
  );

  if (clearBtn) {
    clearBtn.addEventListener(
      'click',
      () => {
        debouncedSearch.cancel();
        searchInput.value = '';
        clearBtn.classList.add('hidden');
        clearBtn.classList.remove('flex');
        resultsContainer?.classList.add('hidden');
        searchInput.focus();
      },
      { signal }
    );
  }

  btnSearch.addEventListener(
    'click',
    (e) => {
      e.preventDefault();
      execute();
    },
    { signal }
  );

  // Sembunyikan dropdown hasil pencarian bila klik di luar
  document.addEventListener(
    'click',
    (e) => {
      const target = e.target as HTMLElement;
      if (
        !target.closest('#peta-search-results') &&
        !target.closest('#peta-search-input') &&
        !target.closest('#btn-peta-search')
      ) {
        resultsContainer?.classList.add('hidden');
      }
    },
    { signal }
  );
}

/**
 * Mendeteksi posisi geolokasi perangkat pengguna menggunakan Geolocation API.
 * Dibungkus dalam Promise yang aman tanpa melempar unhandled rejection.
 *
 * @param options Konfigurasi PositionOptions (default: highAccuracy true, timeout 6000ms, maximumAge 60000ms)
 * @returns Promise<UserLocationResult | null> Data koordinat atau null jika ditolak/gagal/tidak didukung
 */
export function detectUserLocation(
  options: PositionOptions = { enableHighAccuracy: true, timeout: 6000, maximumAge: 60000 }
): Promise<UserLocationResult | null> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
      resolve(null);
      return;
    }

    try {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (!pos || !pos.coords) {
            resolve(null);
            return;
          }
          resolve({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
          });
        },
        (error) => {
          console.warn('[petaPickerController] Geolocation access denied or unavailable:', error?.message || error);
          resolve(null);
        },
        options
      );
    } catch (err) {
      console.warn('[petaPickerController] Geolocation API unexpected error:', err);
      resolve(null);
    }
  });
}

/**
 * Menerapkan posisi pengguna ke peta, marker, dan input pemesanan.
 * Mendukung mode auto-detection (silent fallback) dan manual click (dengan visual feedback).
 *
 * @param isManual boolean true jika dipicu dari klik tombol 'Gunakan Lokasi Saya'
 */
export async function applyUserGeolocation(isManual = false): Promise<void> {
  if (isManual) {
    showAccuracyWarning(false);
    updateStatus('loading', 'Mendeteksi posisi perangkat...');
  }

  try {
    const coords = await detectUserLocation(
      isManual
        ? { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
        : { enableHighAccuracy: true, timeout: 6000, maximumAge: 60000 }
    );

    // Pastikan lifecycle controller masih aktif dan peta masih ada di DOM
    if (
      !state.map ||
      !state.marker ||
      !lifecycleAbortController ||
      lifecycleAbortController.signal.aborted
    ) {
      return;
    }

    // Jika auto-detect dan pengguna sudah memilih titik lain secara manual, abaikan
    if (!isManual && state.userHasModifiedPoint) {
      return;
    }

    if (coords) {
      const { lat, lng, accuracy } = coords;
      const inArea = isWithinOperationalArea(lat, lng);

      if (!inArea || accuracy > 15000) {
        showAccuracyWarning(true);
      } else {
        showAccuracyWarning(false);
      }

      state.marker.setLatLng([lat, lng]);
      state.map.setView([lat, lng], 16, { animate: true });
      state.hasAutoLocated = true;

      // Picu fungsi debounced reverseGeocode dan update koordinat form
      handlePointSelection(lat, lng, true);

      // Dispatch event koordinat ke form pemesanan jika diperlukan
      window.dispatchEvent(
        new CustomEvent('peta-point-selected', {
          detail: {
            lat,
            lng,
            accuracy,
            source: isManual ? 'manual-gps' : 'auto-gps',
          },
        })
      );

      updateStatus('success', 'Lokasi terdeteksi dari GPS perangkat.');
    } else {
      // JIKA GAGAL / DITOLAK (Permission Denied, Timeout, atau Unavailable):
      if (isManual) {
        updateStatus(
          'warning',
          'Tidak dapat mengakses lokasi perangkat. Pastikan izin lokasi diizinkan atau cari alamat di atas.'
        );
      } else {
        // Silent fallback: tetap gunakan titik default katering yang sudah ter-render
        // tanpa menampilkan alert atau peringatan yang mengganggu pengguna
        console.info('[petaPickerController] Geolocation silent fallback to default coordinates.');
      }
    }
  } catch (err) {
    console.warn('[petaPickerController] Error in applyUserGeolocation:', err);
    if (isManual) {
      updateStatus('warning', 'Gagal mendeteksi lokasi perangkat.');
    }
  }
}

function setupGeolocation(signal: AbortSignal): void {
  const btnGeolocate = document.getElementById('btn-geolocate');
  if (btnGeolocate) {
    btnGeolocate.addEventListener(
      'click',
      () => {
        applyUserGeolocation(true);
      },
      { signal }
    );
  }

  const btnCloseWarning = document.getElementById('btn-close-accuracy-warning');
  if (btnCloseWarning) {
    btnCloseWarning.addEventListener(
      'click',
      () => {
        showAccuracyWarning(false);
      },
      { signal }
    );
  }
}

/**
 * Setup listener pada textarea agar jika pengguna mengetik alamat manual,
 * proses reverse geocoding tertunda tidak menimpa ketikan pengguna.
 */
function setupManualTextareaProtection(signal: AbortSignal): void {
  const wrapper = document.querySelector('.peta-picker-wrapper') as HTMLElement | null;
  const targetTextareaId = wrapper?.dataset.targetTextarea || 'customer-address';
  const textarea = document.getElementById(targetTextareaId) as HTMLTextAreaElement | null;

  if (textarea) {
    textarea.addEventListener(
      'input',
      () => {
        state.userHasModifiedPoint = true;
        debouncedReverseGeocode.cancel();
        if (state.abortController) {
          state.abortController.abort();
          state.abortController = null;
        }
      },
      { signal }
    );
  }
}

/**
 * Inisialisasi peta Leaflet secara lazy saat container dibuka.
 */
async function initMap(): Promise<void> {
  const container = document.getElementById('peta-picker-canvas');
  if (!container || state.isInitialized || state.isLoadingLeaflet) return;

  state.isLoadingLeaflet = true;

  try {
    const L = await loadLeafletModule();

    // Pastikan container masih ada di DOM dan controller belum di-teardown
    if (!document.getElementById('peta-picker-canvas') || !lifecycleAbortController || lifecycleAbortController.signal.aborted) {
      state.isLoadingLeaflet = false;
      return;
    }

    const map = L.map(container, {
      center: [DEFAULT_LAT, DEFAULT_LNG],
      zoom: DEFAULT_ZOOM,
      zoomControl: true,
      attributionControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    const icon = createCustomIcon(L);
    const marker = L.marker([DEFAULT_LAT, DEFAULT_LNG], {
      icon,
      draggable: true,
      autoPan: true,
    }).addTo(map);

    // Event saat pin digeser (drag) maupun saat dilepas (dragend) dibungkus debounce 400 ms
    marker.on('drag', () => {
      state.userHasModifiedPoint = true;
      const position = marker.getLatLng();
      showAccuracyWarning(false);
      handlePointSelection(position.lat, position.lng, true);
    });

    marker.on('dragend', () => {
      state.userHasModifiedPoint = true;
      const position = marker.getLatLng();
      showAccuracyWarning(false);
      handlePointSelection(position.lat, position.lng, true);
    });

    map.on('click', (e: import('leaflet').LeafletMouseEvent) => {
      state.userHasModifiedPoint = true;
      marker.setLatLng(e.latlng);
      showAccuracyWarning(false);
      handlePointSelection(e.latlng.lat, e.latlng.lng, true);
    });

    state.map = map;
    state.marker = marker;
    state.isInitialized = true;

    setupGeolocation(lifecycleAbortController.signal);
    setupSearchFeature(lifecycleAbortController.signal);
    setupManualTextareaProtection(lifecycleAbortController.signal);
    clearCoordinatesDisplay();

    // Trigger perbaikan ukuran kanvas
    setTimeout(() => {
      if (state.map) {
        state.map.invalidateSize();
      }
    }, 150);

    // Otomatis deteksi lokasi perangkat pengguna secara asynchronous tanpa memblokir render peta
    if (!state.hasAutoLocated && !state.userHasModifiedPoint) {
      applyUserGeolocation(false);
    }
  } catch (err) {
    console.error('[petaPickerController] Gagal memuat Leaflet secara dinamis:', err);
    updateStatus('warning', 'Gagal memuat peta. Silakan ketik alamat pengantaran secara manual.');
  } finally {
    state.isLoadingLeaflet = false;
  }
}

function setupModalObserver(signal: AbortSignal): void {
  const wrapper = document.querySelector('.peta-picker-wrapper') as HTMLElement | null;
  const modalId = wrapper?.dataset.modalId || 'order-modal';
  const dialog = document.getElementById(modalId) as HTMLDialogElement | null;

  if (!dialog) return;

  const onModalOpen = () => {
    if (!state.isInitialized) {
      initMap();
    } else {
      setTimeout(() => {
        if (state.map) {
          state.map.invalidateSize();
        }
      }, 150);
      if (!state.hasAutoLocated && !state.userHasModifiedPoint) {
        applyUserGeolocation(false);
      }
    }
  };

  window.addEventListener('order-modal-opened', onModalOpen, { signal });
  window.addEventListener(
    'open-order-modal',
    () => {
      setTimeout(onModalOpen, 50);
    },
    { signal }
  );

  window.addEventListener(
    'reset-peta-picker',
    () => {
      debouncedReverseGeocode.cancel();
      if (state.cancelDebouncedSearch) state.cancelDebouncedSearch();
      if (state.abortController) {
        state.abortController.abort();
        state.abortController = null;
      }
      if (state.searchAbortController) {
        state.searchAbortController.abort();
        state.searchAbortController = null;
      }
      clearCoordinatesDisplay();
      showAccuracyWarning(false);
      state.userHasModifiedPoint = false;
      state.hasAutoLocated = false;
      if (state.map && state.marker) {
        state.map.setView([DEFAULT_LAT, DEFAULT_LNG], DEFAULT_ZOOM);
        state.marker.setLatLng([DEFAULT_LAT, DEFAULT_LNG]);
      }
      const searchInput = document.getElementById('peta-search-input') as HTMLInputElement | null;
      if (searchInput) searchInput.value = '';
      const clearBtn = document.getElementById('peta-search-clear');
      if (clearBtn) {
        clearBtn.classList.add('hidden');
        clearBtn.classList.remove('flex');
      }
      const resultsContainer = document.getElementById('peta-search-results');
      if (resultsContainer) resultsContainer.classList.add('hidden');
      updateStatus('idle', 'Geser pin merah atau cari alamat untuk menentukan titik antar.');
    },
    { signal }
  );

  if (state.observer) state.observer.disconnect();
  state.observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'attributes' && mutation.attributeName === 'open' && dialog.open) {
        onModalOpen();
      }
    }
  });

  state.observer.observe(dialog, { attributes: true });

  if (dialog.open) {
    onModalOpen();
  }
}

/**
 * Teardown seluruh resource peta, timer debounce, network request, dan observer.
 */
export function teardownPetaPickerController(): void {
  debouncedReverseGeocode.cancel();
  if (state.cancelDebouncedSearch) {
    state.cancelDebouncedSearch();
    state.cancelDebouncedSearch = null;
  }
  if (state.abortController) {
    state.abortController.abort();
    state.abortController = null;
  }
  if (state.searchAbortController) {
    state.searchAbortController.abort();
    state.searchAbortController = null;
  }
  if (lifecycleAbortController) {
    lifecycleAbortController.abort();
    lifecycleAbortController = null;
  }
  if (state.observer) {
    state.observer.disconnect();
    state.observer = null;
  }
  if (state.map) {
    state.map.remove();
    state.map = null;
  }
  state.marker = null;
  state.isInitialized = false;
  state.isLoadingLeaflet = false;
  state.hasAutoLocated = false;
  state.userHasModifiedPoint = false;
}

/**
 * Inisialisasi controller pemilih peta interaktif.
 */
export function initPetaPickerController(): void {
  teardownPetaPickerController();
  lifecycleAbortController = new AbortController();
  setupModalObserver(lifecycleAbortController.signal);
}

// Lifecycle listeners untuk Astro Transitions
if (typeof window !== 'undefined') {
  document.addEventListener('astro:page-load', () => {
    isPetaPickerLoaded = true;
    initPetaPickerController();
  });

  document.addEventListener('astro:before-swap', teardownPetaPickerController);

  if (document.readyState === 'loading') {
    document.addEventListener(
      'DOMContentLoaded',
      () => {
        if (!isPetaPickerLoaded) {
          initPetaPickerController();
        }
      },
      { once: true }
    );
  } else if (!isPetaPickerLoaded) {
    initPetaPickerController();
  }
}
