export interface CarouselOptions {
  root: HTMLElement;
  grid: HTMLElement;
  cardSelector: string;
  prevBtn?: HTMLButtonElement | null;
  nextBtn?: HTMLButtonElement | null;
  dotsContainer?: HTMLElement | null;
  itemLabel?: string;
}

const DRAG_THRESHOLD = 5;         // px
const EDGE_TOLERANCE = 2;         // px
const FLICK_VELOCITY = 0.4;       // px/ms
const VELOCITY_WINDOW = 100;      // ms, jendela sampel
const VELOCITY_STALE = 80;        // ms, sampel terakhir lebih tua dari ini → v = 0
const SCROLL_IDLE = 100;          // ms tanpa event scroll = dianggap selesai
const SCROLL_IDLE_INITIAL = 200;  // ms idle awal untuk memberi jeda browser memulai smooth scroll

// Pastikan Tailwind v4 scanner mendeteksi string literal utuh:
// 'select-none' 'cursor-grabbing' 'md:cursor-grabbing' 'data-[dragging=true]:cursor-grabbing'
// 'h-11' 'px-2' 'h-2.5' 'w-7' 'w-2.5' 'bg-accent' 'bg-neutral-300' 'hover:bg-neutral-400'

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(val, max));
}

export function createCarousel(opts: CarouselOptions): () => void {
  const { root, grid, cardSelector, prevBtn, nextBtn, dotsContainer, itemLabel = 'paket' } = opts;
  const ac = new AbortController();
  const { signal } = ac;

  let cards: HTMLElement[] = [];
  let currentIndex = 0;
  let visibleCount = 1;
  let maxStops = 1;
  let lastWidth = 0;
  let isAnimating = false;
  let pendingResnap = false;

  // Settle & idle detection
  let settleToken = 0;
  let idleTimer: ReturnType<typeof setTimeout> | 0 = 0;
  let settleAbort: AbortController | null = null;

  // Pointer & drag state
  let isPointerDown = false;
  let isDragging = false;
  let didDrag = false;
  let pointerId = -1;
  let startX = 0;
  let startScroll = 0;
  let startIndex = 0;
  let samples: Array<{ x: number; t: number }> = [];

  // Dots element cache
  let dotButtons: HTMLButtonElement[] = [];

  // Coalesced RAF execution
  const rafMap = new Map<string, number>();
  function rafOnce(key: string, fn: () => void) {
    if (rafMap.has(key)) return;
    rafMap.set(
      key,
      requestAnimationFrame(() => {
        rafMap.delete(key);
        fn();
      })
    );
  }
  function cancelAllRaf() {
    rafMap.forEach((id) => cancelAnimationFrame(id));
    rafMap.clear();
  }

  function measure(): boolean {
    cards = Array.from(grid.querySelectorAll<HTMLElement>(cardSelector));
    const cs = getComputedStyle(grid);
    const contentWidth = grid.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    if (cards.length === 0 || contentWidth <= 0) return false;
    const gap = parseFloat(cs.columnGap) || 0;
    const step = cards.length > 1 ? cards[1].offsetLeft - cards[0].offsetLeft : cards[0].offsetWidth + gap;
    visibleCount = Math.max(1, Math.round((contentWidth + gap) / step));
    maxStops = Math.max(1, cards.length - visibleCount + 1);
    return true;
  }

  const maxScroll = () => Math.max(0, grid.scrollWidth - grid.clientWidth);
  const leftFor = (i: number) => Math.min(maxScroll(), cards[i] ? cards[i].offsetLeft - cards[0].offsetLeft : 0);

  function nearestIndex(left: number): number {
    if (left >= maxScroll() - EDGE_TOLERANCE) return maxStops - 1;
    let best = 0;
    for (let i = 1; i < maxStops; i++) {
      if (Math.abs(leftFor(i) - left) < Math.abs(leftFor(best) - left)) {
        best = i;
      }
    }
    return best;
  }

  function cancelSettle() {
    settleToken++;
    if (idleTimer) {
      clearTimeout(idleTimer);
      idleTimer = 0;
    }
    settleAbort?.abort();
    settleAbort = null;
  }

  function restoreSnap() {
    grid.style.scrollSnapType = '';
    grid.style.scrollBehavior = '';
  }

  function finishAnimation() {
    isAnimating = false;
    restoreSnap();
    currentIndex = nearestIndex(grid.scrollLeft);
    render();
    if (pendingResnap) {
      pendingResnap = false;
      goTo(currentIndex, { instant: true });
    }
  }

  function goTo(i: number, { instant = false } = {}) {
    cancelSettle();
    currentIndex = clamp(i, 0, maxStops - 1);
    const target = leftFor(currentIndex);
    const smooth = !instant && !matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Jalur instan: set scrollBehavior = 'auto' & scrollSnapType = 'none' sebelum scrollTo,
    // lalu restoreSnap() agar class motion-safe:scroll-smooth tidak memaksakan animasi.
    if (!smooth || Math.abs(grid.scrollLeft - target) < 1) {
      grid.style.scrollSnapType = 'none';
      grid.style.scrollBehavior = 'auto';
      grid.scrollTo({ left: target, behavior: 'auto' });
      isAnimating = false;
      restoreSnap();
      render();
      return;
    }

    // Jalur smooth: snap mati sampai scroll benar-benar diam
    grid.style.scrollSnapType = 'none';
    grid.style.scrollBehavior = 'auto';
    isAnimating = true;
    render();

    const token = settleToken;
    settleAbort = new AbortController();
    const done = () => {
      if (token !== settleToken) return;
      cancelSettle();
      finishAnimation();
    };
    const armIdle = (delay = SCROLL_IDLE) => {
      if (idleTimer) clearTimeout(idleTimer);
      idleTimer = window.setTimeout(done, delay);
    };

    grid.addEventListener('scroll', () => armIdle(SCROLL_IDLE), {
      passive: true,
      signal: settleAbort.signal,
    });
    if ('onscrollend' in window) {
      grid.addEventListener('scrollend', done, { once: true, signal: settleAbort.signal });
    }
    armIdle(SCROLL_IDLE_INITIAL);
    grid.scrollTo({ left: target, behavior: 'smooth' });
  }

  function interruptAnimation() {
    if (!isAnimating) return;
    cancelSettle();
    isAnimating = false;
    restoreSnap();
    currentIndex = nearestIndex(grid.scrollLeft);
    render();
    // Batalkan pendingResnap saat interupsi agar tidak menarik paksa posisi scroll pengguna
    pendingResnap = false;
  }

  function renderDots() {
    if (!dotsContainer) return;
    dotsContainer.innerHTML = '';
    dotButtons = [];
    if (maxStops <= 1) return;

    for (let i = 0; i < maxStops; i++) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'h-11 px-2 flex items-center cursor-pointer rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent';
      btn.setAttribute('aria-label', `Ke ${itemLabel} ${i + 1} dari ${maxStops}`);

      const span = document.createElement('span');
      span.className = 'block h-2.5 w-2.5 rounded-full bg-neutral-300 hover:bg-neutral-400 transition-all duration-300';
      btn.appendChild(span);

      btn.addEventListener('click', () => goTo(i), { signal });
      dotsContainer.appendChild(btn);
      dotButtons.push(btn);
    }
  }

  function render() {
    root.dataset.scrollable = String(maxStops > 1);

    if (prevBtn) {
      if (currentIndex <= 0) {
        prevBtn.setAttribute('aria-disabled', 'true');
      } else {
        prevBtn.removeAttribute('aria-disabled');
      }
    }

    if (nextBtn) {
      if (currentIndex >= maxStops - 1) {
        nextBtn.setAttribute('aria-disabled', 'true');
      } else {
        nextBtn.removeAttribute('aria-disabled');
      }
    }

    dotButtons.forEach((btn, idx) => {
      const span = btn.firstElementChild as HTMLElement | null;
      if (idx === currentIndex) {
        btn.setAttribute('aria-current', 'true');
        if (span) {
          span.className = 'block h-2.5 w-7 rounded-full bg-accent transition-all duration-300';
        }
      } else {
        btn.removeAttribute('aria-current');
        if (span) {
          span.className = 'block h-2.5 w-2.5 rounded-full bg-neutral-300 hover:bg-neutral-400 transition-all duration-300';
        }
      }
    });
  }

  function endDrag() {
    if (!isPointerDown) return;
    isPointerDown = false;
    if (!isDragging) return;
    isDragging = false;
    if (grid.hasPointerCapture(pointerId)) {
      grid.releasePointerCapture(pointerId);
    }
    grid.dataset.dragging = 'false';
    grid.classList.remove('select-none', 'cursor-grabbing', 'md:cursor-grabbing');

    const now = performance.now();
    const first = samples[0];
    const last = samples[samples.length - 1];
    let v = 0; // px/ms, + = mouse ke kanan
    if (first && last && last.t > first.t && now - last.t <= VELOCITY_STALE) {
      v = (last.x - first.x) / (last.t - first.t);
    }

    pendingResnap = false;
    let target = nearestIndex(grid.scrollLeft);
    if (Math.abs(v) > FLICK_VELOCITY && target === startIndex) {
      target += v < 0 ? 1 : -1;
    }
    goTo(target);
    setTimeout(() => {
      didDrag = false;
    }, 0);
  }

  // 1. Inisialisasi awal DOM geometry & state
  if (measure()) {
    lastWidth = grid.clientWidth;
    currentIndex = nearestIndex(grid.scrollLeft);
    renderDots();
    render();
  }

  // 2. Setup ResizeObserver untuk merespons perubahan ukuran viewport
  const ro = new ResizeObserver(() =>
    rafOnce('resize', () => {
      const w = grid.clientWidth;
      if (Math.abs(w - lastWidth) < 1) return;
      lastWidth = w;
      const keep = currentIndex;
      const prevStops = maxStops;
      if (!measure()) return;
      if (maxStops !== prevStops) renderDots();
      currentIndex = Math.min(keep, maxStops - 1);
      if (isDragging || isAnimating) {
        pendingResnap = true;
        return;
      }
      goTo(currentIndex, { instant: true });
    })
  );
  ro.observe(grid);

  // 3. Event listeners navigasi tombol panah
  prevBtn?.addEventListener(
    'click',
    () => {
      if (prevBtn.getAttribute('aria-disabled') === 'true') return;
      goTo(currentIndex - 1);
    },
    { signal }
  );

  nextBtn?.addEventListener(
    'click',
    () => {
      if (nextBtn.getAttribute('aria-disabled') === 'true') return;
      goTo(currentIndex + 1);
    },
    { signal }
  );

  // 4. Deteksi interupsi gesture touch & trackpad horizontal
  grid.addEventListener('touchstart', interruptAnimation, { passive: true, signal });
  grid.addEventListener(
    'wheel',
    (e) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY) || e.shiftKey) {
        interruptAnimation();
      }
    },
    { passive: true, signal }
  );

  // 5. Mouse pointer drag & flick
  grid.addEventListener(
    'pointerdown',
    (e) => {
      didDrag = false;
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      if ((e.target as Element).closest('button, a, input, select, textarea, summary, label')) return;
      interruptAnimation();
      isPointerDown = true;
      pointerId = e.pointerId;
      startX = e.clientX;
      startScroll = grid.scrollLeft;
      startIndex = currentIndex;
      samples = [{ x: e.clientX, t: performance.now() }];
    },
    { signal }
  );

  grid.addEventListener(
    'pointermove',
    (e) => {
      if (!isPointerDown || e.pointerId !== pointerId) return;
      if (!(e.buttons & 1)) return endDrag();
      const dx = e.clientX - startX;
      if (!isDragging) {
        if (Math.abs(dx) <= DRAG_THRESHOLD) return;
        isDragging = didDrag = true;
        grid.setPointerCapture(pointerId);
        grid.style.scrollSnapType = 'none';
        grid.style.scrollBehavior = 'auto';
        grid.dataset.dragging = 'true';
        grid.classList.add('select-none', 'cursor-grabbing', 'md:cursor-grabbing');
        window.getSelection()?.removeAllRanges();
      }
      grid.scrollLeft = startScroll - dx;
      const now = performance.now();
      samples.push({ x: e.clientX, t: now });
      samples = samples.filter((s) => now - s.t <= VELOCITY_WINDOW);
    },
    { signal }
  );

  ['pointerup', 'pointercancel', 'lostpointercapture'].forEach((t) =>
    grid.addEventListener(t, () => endDrag(), { signal })
  );

  grid.addEventListener(
    'click',
    (e) => {
      if (didDrag) {
        e.preventDefault();
        e.stopPropagation();
        didDrag = false;
      }
    },
    { capture: true, signal }
  );

  grid.addEventListener('dragstart', (e) => e.preventDefault(), { signal });

  // 6. Scroll tracking untuk sinkronisasi state saat pengguna scroll manual/swipe
  grid.addEventListener(
    'scroll',
    () =>
      rafOnce('scroll', () => {
        if (!isDragging && !isAnimating) {
          currentIndex = nearestIndex(grid.scrollLeft);
        }
        render();
      }),
    { passive: true, signal }
  );

  // 7. Navigasi keyboard aksesibel
  grid.addEventListener(
    'keydown',
    (e) => {
      if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
      const map: Record<string, number> = {
        ArrowLeft: currentIndex - 1,
        ArrowRight: currentIndex + 1,
        Home: 0,
        End: maxStops - 1,
      };
      if (!(e.key in map)) return;
      e.preventDefault();
      goTo(map[e.key]);
    },
    { signal }
  );

  // 8. Auto-scroll saat elemen di dalam kartu menerima fokus
  grid.addEventListener(
    'focusin',
    (e) => {
      const el = e.target as HTMLElement;
      if (el === grid || !el.matches(':focus-visible')) return;
      const card = el.closest<HTMLElement>(cardSelector);
      if (!card) return;
      const idx = cards.indexOf(card);
      if (idx !== -1 && (idx < currentIndex || idx >= currentIndex + visibleCount)) {
        goTo(Math.min(idx, maxStops - 1));
      }
    },
    { signal }
  );

  return () => {
    ac.abort();
    cancelSettle();
    ro.disconnect();
    cancelAllRaf();
    restoreSnap();
    grid.dataset.dragging = 'false';
    grid.classList.remove('select-none', 'cursor-grabbing', 'md:cursor-grabbing');
  };
}
