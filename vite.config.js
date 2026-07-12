import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// User/org GitHub Pages site (qiyuan-wu.github.io) is served from the domain
// root, so base stays '/'. Build output goes to dist/ (the default).
export default defineConfig({
  plugins: [react()],
})
