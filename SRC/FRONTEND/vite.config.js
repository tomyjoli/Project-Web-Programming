import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  build: {
    rollupOptions: {
      input: fileURLToPath(new URL('./frontend.html', import.meta.url)),
    },
  },
  server: {
    open: '/frontend.html',
    fs: {
      allow: [fileURLToPath(new URL('../..', import.meta.url))],
    },
  },
  preview: {
    open: '/frontend.html',
  },
})
