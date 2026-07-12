import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFileSync } from 'node:fs'
import { resolve } from 'node:path'

// User/org GitHub Pages site (qiyuan-wu.github.io) is served from the domain
// root, so base stays '/'. Build output goes to dist/ (the default).
export default defineConfig({
  plugins: [
    react(),
    {
      // GitHub Pages serves 404.html for any path it doesn't recognize. Making
      // it a copy of index.html lets client-side routes like /games load on a
      // direct visit or refresh instead of 404ing.
      name: 'spa-404-fallback',
      closeBundle() {
        const dist = resolve(process.cwd(), 'dist')
        try {
          copyFileSync(resolve(dist, 'index.html'), resolve(dist, '404.html'))
        } catch {
          /* dist/index.html not present (e.g. non-build command) — ignore */
        }
      },
    },
  ],
})
