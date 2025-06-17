import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// Solution: Utiliser les casts pour éviter les conflits de type
export default defineConfig({
  plugins: [react() as any],
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
})
