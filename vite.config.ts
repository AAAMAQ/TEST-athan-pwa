/*import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
})
*/

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        navigateFallback: '/index.html',
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          // pages & assets
          {
            urlPattern: ({ request }) => request.mode === 'navigate',
            handler: 'NetworkFirst',
            options: { cacheName: 'pages' }
          },
          {
            urlPattern: ({ sameOrigin }) => sameOrigin,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'assets' }
          },
          // Quran API caching (offline after first fetch)
          {
            urlPattern: ({ url }) => url.origin.includes('api.alquran.cloud'),
            handler: 'NetworkFirst',
            options: { cacheName: 'quran-api', networkTimeoutSeconds: 3 }
          }
        ]
      },
      includeAssets: ['icons/icon-192.png', 'icons/icon-512.png'],
      manifest: {
        name: 'Athan PWA',
        short_name: 'Athan',
        start_url: '.',
        scope: '.',
        display: 'standalone',
        background_color: '#0d9488',
        theme_color: '#0d9488',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' }
        ]
      }
    })
  ],
  // If you deploy under a subpath (GitHub Pages), set:
  // base: '/athan-pwa/'
})