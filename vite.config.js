import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// vite.config.js
export default defineConfig({
  plugins: [vue()],
  server: {
    open: true, // Automatically opens default browser to http://localhost:5173
    proxy: {
      '/api': 'http://localhost:5000'
    }
  }
})
