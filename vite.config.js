import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // 1. Tambahkan ini agar domain dari localhost.run tidak diblokir
    allowedHosts: ['.lhr.life', '.ngrok-free.app'], 
    proxy: {
      '/api': {
        // 2. GANTI localhost:8000 dengan URL Ngrok Laravel kamu
        // Contoh: 'https://a1b2-c3d4.ngrok-free.app'
        target: 'https://imagerial-josue-electrophonically.ngrok-free.dev/api',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api'), // Memastikan path tetap benar
      }
    }
  }
})