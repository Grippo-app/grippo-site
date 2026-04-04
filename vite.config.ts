import { defineConfig } from 'vite'

// VITE_BASE_URL:
//   '/'              — если есть кастомный домен (CNAME в public/)
//   '/grippo-site/'  — если деплой на grippo-app.github.io/grippo-site (без домена)
const base = process.env.VITE_BASE_URL ?? '/'

export default defineConfig({
  root: '.',
  base,
  publicDir: 'public',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
})
