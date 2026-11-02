// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: "https://dzanis-catering-update.vercel.app",
  integrations: [sitemap()],
  server: {
    host: '0.0.0.0',
    port: 4321
  },
  vite: {
    plugins: [tailwindcss()],
  },
});