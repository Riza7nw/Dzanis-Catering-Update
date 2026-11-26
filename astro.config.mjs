// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: "https://dzaniscatering.web.id",
  integrations: [
    sitemap({
      filter: (page) => !page.endsWith('/paket/') && !page.includes('/testing-menu'),
    }),
  ],
  server: {
    host: '0.0.0.0',
    port: 4321
  },
  vite: {
    plugins: [tailwindcss()],
  },
});