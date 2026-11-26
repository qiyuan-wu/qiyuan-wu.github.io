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
      // A post marked `draft: true` is shown by the dev server but must not
      // reach the published bundle at all, so the build swaps its text for an
      // empty draft before src/posts.js ever sees it.
      name: 'strip-draft-posts',
      apply: 'build',
      transform(code, id) {
        if (!/\/src\/posts\/[^/]+\.md\?raw$/.test(id)) return
        const front = code.match(/^export default "---\\n([\s\S]*?)\\n---/)
        if (front && /(^|\\n)draft:\s*true\b/.test(front[1]))
          return 'export default "---\\ndraft: true\\n---\\n"'
      },
    },
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
