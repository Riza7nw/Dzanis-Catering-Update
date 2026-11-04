## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)

## Contact & WhatsApp SSOT Guidelines

- **Single Source of Truth (SSOT)**: Always import contact and phone numbers from `src/data/company.ts`. Never hardcode raw phone numbers or WhatsApp links in components or pages.
  - Official Raw / E.164 Number: `6281324383858`
  - Official Display Number: `+62 813-2438-3858` (or `0813-2438-3858`)
- **Zero `tel:` Scheme**: Never use `tel:+62...` links on buttons or contact numbers. In the Indonesian catering context, direct customers to WhatsApp URLs (`https://wa.me/6281324383858?text=...`) using `buildWhatsAppUrl` from `src/services/whatsapp/waUrl.ts` or company contact helpers.

## Mobile UX & Responsiveness Standards

- **Bottom Clearance**: On pages with floating action bars or floating WhatsApp buttons, apply ample bottom clearance (`pb-36 sm:pb-28 lg:pb-16`) to the main page container to prevent blocking the bottom content and footer.
- **Horizontal Overflow Prevention**: Apply `max-w-full overflow-x-hidden` (or `overflow-x-clip`) to page containers. Avoid unconstrained negative margins on horizontal carousels and tab bars.
- **Touch Responsiveness**: Interactive touch targets (counters, tabs, action buttons) must include `touch-manipulation` to eliminate the 300ms mobile tap latency, with a minimum touch area of 44x44px (`min-h-[44px] min-w-[44px]`).

### Floating Actions & Modal Coexistence Invariant
- **Floating Button Suppression on Modal Open**:
  - Ketika komponen dialog/modal (seperti `CertLightboxModal.astro`, `OrderModal.astro`, drawer navigasi, atau modal lainnya) dalam status terbuka (`open`/`active`), elemen floating global (khususnya tombol WhatsApp mengambang `#floating-whatsapp-btn`) **wajib disembunyikan** (`display: none` atau `opacity: 0; pointer-events: none; aria-hidden: true;`).
  - Tidak boleh ada elemen floating yang menutupi tombol aksi modal (`Buka Berkas`, CTA tutup, atau pagination) pada viewport mobile (< 768px).
- **Stacking Context & Z-Index Contract**:
  - Modal backdrop dan dialog modal harus memiliki level z-index terisolasi yang lebih tinggi daripada seluruh floating CTAs dan sticky navigation header/bar (misal: backdrop `z-50`, modal container `z-50` / `z-[120]`, sementara floating CTA berada di `z-40` dan wajib suppress).
- **Focus & Interaction Isolation**:
  - Tombol yang disembunyikan akibat modal terbuka tidak boleh menerima fokus navigasi keyboard (`tabindex="-1"` / `aria-hidden="true"`).

## Anti-Slop & SSR-First Principles

- **SSR-First Rendering**: Never leave empty container roots that rely solely on client JavaScript `innerHTML` for primary content. Always pre-render initial markup via Astro SSR for optimal LCP, zero CLS, and SEO crawlers.
- **Centralized Lightboxes/Modals**: Avoid duplicating modal dialogs across multiple components. Maintain a single, accessible modal component per domain (such as `CertLightboxModal.astro` for legal certs, `OrderModal.astro` for ordering).

