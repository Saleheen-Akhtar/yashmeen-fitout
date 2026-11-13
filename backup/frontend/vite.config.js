import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
// Keeps the static <head> tags in index.html in sync with VITE_SITE_URL.
const DEFAULT_ORIGIN = 'https://yashmeen-fitout.vercel.app'
const siteUrlPlugin = (origin) => ({
  name: 'site-url-html',
  transformIndexHtml: (html) => (origin ? html.split(DEFAULT_ORIGIN).join(origin) : html),
})

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const origin = (env.VITE_SITE_URL || '').replace(/\/+$/, '')
  return {
  plugins: [react(), tailwindcss(), siteUrlPlugin(origin)],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    chunkSizeWarningLimit: 600,
    rolldownOptions: {
      output: {
        codeSplitting: {
          includeDependenciesRecursively: false,
          groups: [
            { name: 'vendor-react', priority: 30, test: /node_modules[\\/](react|react-dom|react-router-dom|react-router|scheduler)[\\/]/ },
            { name: 'vendor-gsap', priority: 20, test: /node_modules[\\/](gsap|@gsap|lenis)[\\/]/ },
            { name: 'vendor-motion', priority: 20, test: /node_modules[\\/]framer-motion[\\/]/ },
            { name: 'vendor-three', priority: 10, test: /node_modules[\\/]three[\\/]/ },
            { name: 'vendor-ckeditor', priority: 10, test: /node_modules[\\/]@ckeditor[\\/]/ },
          ],
        },
      },
    },
  },
  preview: {
    port: 4173,
    strictPort: true,
    proxy: {
      '/api': {
        target: process.env.BACKEND_URL || 'http://localhost:8000',
        changeOrigin: true,
      },
      '/uploads': {
        target: process.env.BACKEND_URL || 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: process.env.BACKEND_URL || 'http://localhost:8000',
        changeOrigin: true,
      },
      '/uploads': {
        target: process.env.BACKEND_URL || 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  }
  }
})
