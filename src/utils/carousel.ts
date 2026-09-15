/**
 * Utility: Snap Carousel Controller
 * Menyediakan kontrol interaktif untuk carousel berbasis CSS Scroll-Snap:
 * - Navigasi tombol panah kiri & kanan (auto-disable di batas awal/akhir)
 * - Mouse drag 1:1 di desktop dengan proteksi text selection & pencegahan click trigger saat drag
 * - Touch swipe native di mobile/tablet
 * - Indikator dots responsif (menyesuaikan view stops & card visible)
 * - Handling jumlah card non-kelipatan 3 (card terakhir rata kanan tanpa nyangkut)
 */

export interface SnapCarouselConfig {
  grid: HTMLElement;
  prevBtn: HTMLElement;
  nextBtn: HTMLElement;
  dotsContainer?: HTMLElement | null;
  dotAriaLabelPrefix?: string;
}

export interface SnapCarouselInstance {
  refresh: () => void;
  destroy: () => void;
  scrollToIndex: (index: number) => void;
}

export function setupSnapCarousel(config: SnapCarouselConfig): SnapCarouselInstance | null {
  const { grid, prevBtn, nextBtn, dotsContainer, dotAriaLabelPrefix = 'Lihat slide' } = config;
  if (!grid || !prevBtn || !nextBtn) return null;

  let isDown = false;
  let isDragging = false;
  let startX = 0;
  let scrollLeftStart = 0;
  let dragDistance = 0;
  let scrollTicking = false;

  function getMetrics() {
    const cards = Array.from(grid.querySelectorAll('article')) as HTMLElement[];
    if (cards.length === 0) return { cards, cardWidth: 0, gap: 20, visibleCount: 1, maxStops: 1 };

    const firstCard = cards[0];
    const cardWidth = firstCard.getBoundingClientRect().width;
    let gap = 20;
    if (cards.length > 1) {
      gap = cards[1].offsetLeft - (firstCard.offsetLeft + cardWidth);
      if (gap < 0 || isNaN(gap)) gap = 20;
    }

    const containerWidth = grid.clientWidth;
    const visibleCount = Math.max(1, Math.round((containerWidth + gap) / (cardWidth + gap)));
    const maxStops = Math.max(1, cards.length - visibleCount + 1);

    return { cards, cardWidth, gap, visibleCount, maxStops };
  }

  function getActiveIndex(): number {
    const { cardWidth, gap, maxStops } = getMetrics();
    const maxScroll = Math.max(0, grid.scrollWidth - grid.clientWidth);
    if (maxScroll <= 4 || maxStops <= 1) return 0;

    if (grid.scrollLeft >= maxScroll - 6) {
      return maxStops - 1;
    }
    const step = cardWidth + gap;
    if (step <= 0) return 0;
    const idx = Math.round(grid.scrollLeft / step);
    return Math.min(maxStops - 1, Math.max(0, idx));
  }

  function renderDots() {
    if (!dotsContainer) return;
    const { cards, maxStops } = getMetrics();
    const maxScroll = Math.max(0, grid.scrollWidth - grid.clientWidth);

    // Sembunyikan dots jika seluruh card muat dalam satu layar tanpa perlu scroll
    if (maxScroll <= 4 || cards.length <= 1 || maxStops <= 1) {
      dotsContainer.innerHTML = '';
      dotsContainer.classList.add('hidden');
      return;
    }

    dotsContainer.classList.remove('hidden');
    const activeIdx = getActiveIndex();

    dotsContainer.innerHTML = Array.from({ length: maxStops })
      .map(
        (_, idx) => `
      <button
        type="button"
        role="tab"
        aria-selected="${idx === activeIdx ? 'true' : 'false'}"
        aria-label="${dotAriaLabelPrefix} ${idx + 1}"
        data-dot-index="${idx}"
        class="h-2.5 rounded-full transition-all duration-300 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C04A27] ${
          idx === activeIdx
            ? 'w-7 bg-[#C04A27]'
            : 'w-2.5 bg-neutral-300 hover:bg-neutral-400'
        }"
      ></button>
    `
      )
      .join('');
  }

  function updateControls() {
    const tolerance = 4;
    const maxScroll = Math.max(0, grid.scrollWidth - grid.clientWidth);
    const isScrollable = maxScroll > tolerance;

    const prevButton = prevBtn as HTMLButtonElement;
    const nextButton = nextBtn as HTMLButtonElement;

    if (!isScrollable) {
      prevButton.disabled = true;
      nextButton.disabled = true;
      prevButton.classList.add('opacity-0', 'pointer-events-none');
      nextButton.classList.add('opacity-0', 'pointer-events-none');
      if (dotsContainer) dotsContainer.classList.add('hidden');
      return;
    }

    const atStart = grid.scrollLeft <= tolerance;
    const atEnd = grid.scrollLeft >= maxScroll - tolerance;

    prevButton.disabled = atStart;
    nextButton.disabled = atEnd;

    if (atStart) {
      prevButton.classList.add('opacity-0', 'pointer-events-none');
    } else {
      prevButton.classList.remove('opacity-0', 'pointer-events-none');
    }

    if (atEnd) {
      nextButton.classList.add('opacity-0', 'pointer-events-none');
    } else {
      nextButton.classList.remove('opacity-0', 'pointer-events-none');
    }

    // Update status dot aktif
    if (dotsContainer) {
      const activeIdx = getActiveIndex();
      const dotBtns = dotsContainer.querySelectorAll('button[data-dot-index]');
      dotBtns.forEach((btn, idx) => {
        const isActive = idx === activeIdx;
        btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
        if (isActive) {
          btn.className =
            'h-2.5 rounded-full transition-all duration-300 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C04A27] w-7 bg-[#C04A27]';
        } else {
          btn.className =
            'h-2.5 rounded-full transition-all duration-300 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C04A27] w-2.5 bg-neutral-300 hover:bg-neutral-400';
        }
      });
    }
  }

  function scrollStep(direction: 'prev' | 'next') {
    const { cardWidth, gap } = getMetrics();
    const step = cardWidth + gap;
    const maxScroll = Math.max(0, grid.scrollWidth - grid.clientWidth);
    if (step <= 0 || maxScroll <= 0) return;

    let targetLeft = 0;
    if (direction === 'next') {
      targetLeft = Math.min(maxScroll, grid.scrollLeft + step);
    } else {
      targetLeft = Math.max(0, grid.scrollLeft - step);
    }

    grid.scrollTo({ left: targetLeft, behavior: 'smooth' });
  }

  function scrollToIndex(index: number) {
    const { cardWidth, gap } = getMetrics();
    const maxScroll = Math.max(0, grid.scrollWidth - grid.clientWidth);
    const targetLeft = Math.min(maxScroll, index * (cardWidth + gap));
    grid.scrollTo({ left: targetLeft, behavior: 'smooth' });
  }

  const onPrevClick = () => scrollStep('prev');
  const onNextClick = () => scrollStep('next');

  prevBtn.addEventListener('click', onPrevClick);
  nextBtn.addEventListener('click', onNextClick);

  // Event delegation untuk klik dots
  const onDotsClick = (e: MouseEvent) => {
    const target = (e.target as HTMLElement).closest('button[data-dot-index]');
    if (!target) return;
    const index = parseInt(target.getAttribute('data-dot-index') || '0', 10);
    scrollToIndex(index);
  };
  if (dotsContainer) {
    dotsContainer.addEventListener('click', onDotsClick);
  }

  // Scroll event dengan rAF
  const onScroll = () => {
    if (!scrollTicking) {
      requestAnimationFrame(() => {
        updateControls();
        scrollTicking = false;
      });
      scrollTicking = true;
    }
  };
  grid.addEventListener('scroll', onScroll, { passive: true });

  // Window resize handler
  const onResize = () => {
    renderDots();
    updateControls();
  };
  window.addEventListener('resize', onResize);

  // Mouse drag handling
  const onMouseDown = (e: MouseEvent) => {
    if (e.button !== 0) return;
    if ((e.target as HTMLElement).closest('button, a, summary, input, select, textarea')) return;

    isDown = true;
    isDragging = false;
    dragDistance = 0;
    startX = e.pageX;
    scrollLeftStart = grid.scrollLeft;

    e.preventDefault();
  };

  const onMouseMove = (e: MouseEvent) => {
    if (!isDown) return;
    const deltaX = e.pageX - startX;
    dragDistance = Math.abs(deltaX);

    if (dragDistance > 5) {
      if (!isDragging) {
        isDragging = true;
        grid.classList.add('cursor-grabbing');
        document.body.classList.add('select-none');
        window.getSelection()?.removeAllRanges();
        grid.style.scrollBehavior = 'auto';
        grid.style.scrollSnapType = 'none';
      }
      grid.scrollLeft = scrollLeftStart - deltaX;
      window.getSelection()?.removeAllRanges();
    }
  };

  const onEndDrag = () => {
    if (!isDown) return;
    isDown = false;
    document.body.classList.remove('select-none');
    grid.classList.remove('cursor-grabbing');

    if (isDragging) {
      grid.style.scrollBehavior = 'smooth';
      grid.style.scrollSnapType = 'x mandatory';

      const { cardWidth, gap } = getMetrics();
      const maxScroll = Math.max(0, grid.scrollWidth - grid.clientWidth);
      const step = cardWidth + gap;

      if (step > 0 && maxScroll > 0) {
        const nearestIndex = Math.round(grid.scrollLeft / step);
        const targetLeft = Math.min(maxScroll, Math.max(0, nearestIndex * step));
        grid.scrollTo({ left: targetLeft, behavior: 'smooth' });
      }

      setTimeout(() => {
        isDragging = false;
        dragDistance = 0;
      }, 50);
    }
  };

  const onGridClick = (e: MouseEvent) => {
    if (isDragging || dragDistance > 5) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  grid.addEventListener('mousedown', onMouseDown);
  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mouseup', onEndDrag);
  window.addEventListener('mouseleave', onEndDrag);
  grid.addEventListener('click', onGridClick, true);

  renderDots();
  updateControls();

  return {
    refresh() {
      renderDots();
      updateControls();
    },
    scrollToIndex,
    destroy() {
      prevBtn.removeEventListener('click', onPrevClick);
      nextBtn.removeEventListener('click', onNextClick);
      if (dotsContainer) {
        dotsContainer.removeEventListener('click', onDotsClick);
      }
      grid.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      grid.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onEndDrag);
      window.removeEventListener('mouseleave', onEndDrag);
      grid.removeEventListener('click', onGridClick, true);
    },
  };
}
