import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vuetify({ autoImport: true }),
  ],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  server: {
    open: false,
    https: false,
    hot: true,
    host: false, // ************  npm run dev -- --host ************
    port: 3002,
    proxy: {
      '/api': {
          target: 'http://127.0.0.1:2590/admin',
          changeOrigin: true,
          ws: true,
          rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
