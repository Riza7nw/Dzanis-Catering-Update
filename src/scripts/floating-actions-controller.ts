/**
 * Client Controller: Floating Actions & Modal Coexistence
 * 
 * Mengatur visibilitas, z-index, dan isolasi interaksi tombol mengambang
 * (khususnya tombol WhatsApp #floating-whatsapp-btn) saat modal/dialog terbuka:
 * - Menekan (suppress) tombol saat modal sertifikat, order modal, drawer navigasi, atau dialog lainnya terbuka
 * - Mengembalikan tombol secara mulus saat seluruh modal ditutup tanpa layout shift
 * - Mengisolasi fokus navigasi keyboard (tabindex="-1" dan aria-hidden="true")
 * - Mengamati mutasi kelas/atribut pada document.body secara reaktif
 */

let bodyMutationObserver: MutationObserver | null = null;
let isFloatingControllerInitialized = false;

/**
 * Mengecek apakah terdapat dialog/modal yang sedang aktif/terbuka di halaman.
 * @param checkDOMElementsOnly Jika true, hanya periksa elemen DOM konkret (abaikan flag body)
 */
export function isAnyModalOpen(checkDOMElementsOnly = false): boolean {
  if (typeof document === 'undefined') return false;

  // 1. Native HTMLDialogElement terbuka (OrderModal atau dialog lainnya)
  const openDialog = document.querySelector('dialog[open]');
  if (openDialog) {
    return true;
  }

  // 2. Modal Sertifikat (CertLightboxModal)
  const certModal = document.getElementById('cert-lightbox-modal');
  if (certModal && !certModal.classList.contains('hidden')) {
    return true;
  }

  // 3. Mobile Navigation Drawer (Navbar)
  const navDrawer = document.getElementById('mobile-nav-drawer');
  if (navDrawer && !navDrawer.classList.contains('translate-x-full')) {
    return true;
  }

  // 4. Package Selector Mobile Sheet Panel
  const pkgPanel = document.getElementById('pkg-selector-panel');
  if (pkgPanel && !pkgPanel.classList.contains('translate-y-full') && window.innerWidth < 768) {
    return true;
  }

  // 5. Generic modal dialog dengan atribut aria-modal="true"
  const genericAriaModal = document.querySelector(
    '[role="dialog"][aria-modal="true"]:not(#cert-lightbox-modal):not(#mobile-nav-drawer):not(#pkg-selector-panel):not(.hidden):not([hidden])'
  );
  if (genericAriaModal && window.getComputedStyle(genericAriaModal).display !== 'none') {
    return true;
  }

  // 6. Explicit Body Flags (hanya jika tidak dibatasi pada elemen DOM konkret)
  if (!checkDOMElementsOnly) {
    if (
      document.body.classList.contains('modal-open') ||
      document.body.classList.contains('drawer-open') ||
      document.body.getAttribute('data-modal-open') === 'true'
    ) {
      return true;
    }
  }

  return false;
}

/**
 * Mengatur suppression elemen floating global (khususnya #floating-whatsapp-btn).
 * @param suppressed Jika true, sembunyikan tombol dan putus fokus keyboard.
 */
export function setFloatingWaSuppressed(suppressed: boolean): void {
  if (typeof document === 'undefined') return;

  const btn = document.getElementById('floating-whatsapp-btn');

  if (suppressed) {
    if (btn) {
      btn.classList.add('opacity-0', 'pointer-events-none', 'scale-90');
      btn.setAttribute('tabindex', '-1');
      btn.setAttribute('aria-hidden', 'true');
    }
    if (!document.body.classList.contains('modal-open')) {
      document.body.classList.add('modal-open');
    }
    if (document.body.getAttribute('data-modal-open') !== 'true') {
      document.body.setAttribute('data-modal-open', 'true');
    }
  } else {
    // Hanya unsuppress jika TIDAK ada modal konkret lain yang masih aktif
    if (!isAnyModalOpen(true)) {
      if (btn) {
        btn.classList.remove('opacity-0', 'pointer-events-none', 'scale-90');
        btn.removeAttribute('tabindex');
        btn.removeAttribute('aria-hidden');
      }
      if (document.body.classList.contains('modal-open')) {
        document.body.classList.remove('modal-open');
      }
      if (document.body.classList.contains('drawer-open')) {
        document.body.classList.remove('drawer-open');
      }
      if (document.body.hasAttribute('data-modal-open')) {
        document.body.removeAttribute('data-modal-open');
      }
    }
  }
}

/**
 * Bersihkan listener dan observer controller.
 */
export function teardownFloatingActionsController(): void {
  if (bodyMutationObserver) {
    bodyMutationObserver.disconnect();
    bodyMutationObserver = null;
  }
  if (typeof document !== 'undefined' && !isAnyModalOpen(true)) {
    document.body.classList.remove('modal-open', 'drawer-open');
    document.body.removeAttribute('data-modal-open');
  }
  isFloatingControllerInitialized = false;
}

/**
 * Inisialisasi controller floating actions & observer.
 */
export function initFloatingActionsController(): void {
  if (typeof window === 'undefined') return;

  // Pasang API ke window untuk interoperabilitas skrip inline (misal CertLightboxModal)
  (window as any).setFloatingWaSuppressed = setFloatingWaSuppressed;
  (window as any).isAnyModalOpen = isAnyModalOpen;

  const btn = document.getElementById('floating-whatsapp-btn');
  if (!btn) return;

  // Sinkronisasi status awal
  const shouldSuppress = isAnyModalOpen(false);
  setFloatingWaSuppressed(shouldSuppress);

  // Amati perubahan atribut class dan data-modal-open pada body
  if (bodyMutationObserver) {
    bodyMutationObserver.disconnect();
  }

  bodyMutationObserver = new MutationObserver(() => {
    const modalActive = isAnyModalOpen(false);
    if (modalActive) {
      setFloatingWaSuppressed(true);
    } else {
      setFloatingWaSuppressed(false);
    }
  });

  bodyMutationObserver.observe(document.body, {
    attributes: true,
    attributeFilter: ['class', 'data-modal-open'],
  });

  isFloatingControllerInitialized = true;
}

// Lifecycle registration
if (typeof window !== 'undefined') {
  document.addEventListener('astro:page-load', () => {
    initFloatingActionsController();
  });

  document.addEventListener('astro:before-swap', () => {
    teardownFloatingActionsController();
  });

  if (document.readyState === 'loading') {
    document.addEventListener(
      'DOMContentLoaded',
      () => {
        if (!isFloatingControllerInitialized) {
          initFloatingActionsController();
        }
      },
      { once: true }
    );
  } else if (!isFloatingControllerInitialized) {
    initFloatingActionsController();
  }
}
