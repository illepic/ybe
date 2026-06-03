import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';

import alpinejs from '@astrojs/alpinejs';

import sitemap from '@astrojs/sitemap';

import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  output: 'static',
  site: 'https://yacoltburn.bike',
  integrations: [alpinejs({ entrypoint: '/src/entrypoints/alpine.js' }), sitemap()],
  devToolbar: { enabled: false },

  vite: {
    plugins: [tailwindcss()],
  },
});
