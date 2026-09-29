import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  base: '/AeroTimer/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon.ico', 'logo192.png', 'logo512.png', 'Rubik-OFL.txt'],
      manifest: {
        id: '/AeroTimer/',
        name: 'AeroTimer',
        short_name: 'AeroTimer',
        description: 'AeroPress recipes and step-by-step brew timers, available offline.',
        start_url: '/AeroTimer/',
        scope: '/AeroTimer/',
        display: 'standalone',
        theme_color: '#2D3436',
        background_color: '#ffffff',
        icons: [
          { src: 'logo192.png', sizes: '192x192', type: 'image/png' },
          { src: 'logo512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        navigateFallback: 'index.html',
        cleanupOutdatedCaches: true,
      },
    }),
  ],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    restoreMocks: true,
  },
});
