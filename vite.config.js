import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Forest Guardian',
        short_name: 'ForestGuard',
        description: 'Platform pelaporan deforestasi Indonesia',
        theme_color: '#1b3a2b',
        background_color: '#1b3a2b',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
        ]
      }
    })
  ],
  server: {
    port: 5173,
    allowedHosts: ['.lhr.life', '.ngrok-free.app'],
    proxy: {
      '/api': {
        target: 'https://imagerial-josue-electrophonically.ngrok-free.dev/api',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api'),
      }
    }
  }
})