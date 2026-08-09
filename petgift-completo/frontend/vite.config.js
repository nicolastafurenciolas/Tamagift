import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// Nota: este manifest de PWA es para la app "de creación" en sí (la que usa
// el novio para armar el regalo). Cada regalo individual (/p/:slug) tiene su
// PROPIO manifest dinámico servido por el backend, con el ícono y nombre de
// esa mascota -- ver src/pages/GiftPage.jsx para eso.
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/icon-192.png', 'icons/icon-512.png'],
      manifest: {
        name: 'PetGift — Crea el regalo',
        short_name: 'PetGift',
        description: 'Crea una mascota virtual personalizada como regalo para tu pareja',
        theme_color: '#D8697F',
        background_color: '#FBF1EC',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
    }),
  ],
});
