import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      devOptions: {
        enabled: true // <--- INI PENTING BIAR MUNCUL PAS LOCALHOST
      },
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'CMS Snack Iseng',
        short_name: 'Snack Iseng',
        description: 'Aplikasi Manajemen Snack Iseng Gacor',
        theme_color: '#ffffff',
        background_color: '#f97316',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        orientation: 'portrait',
        icons: [
          {
            src: 'pwa-192.png', // Nanti siapin gambar ini di folder public
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512.png', // Nanti siapin gambar ini di folder public
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
})