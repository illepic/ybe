import { defineConfig } from 'astro/config';

import alpinejs from '@astrojs/alpinejs';

export default defineConfig({
  output: 'static',
  integrations: [alpinejs({ entrypoint: '/src/entrypoints/alpine.js' })],
  devToolbar: { enabled: false },
});