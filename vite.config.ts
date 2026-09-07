import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// ---------------------------------------------------------------------------
// GitHub Pages deploys a "project site" at https://<username>.github.io/<repo>/
// so every asset URL needs to be prefixed with "/<repo>/". Change REPO_NAME
// below to match your actual GitHub repository name before deploying.
//
// If you deploy to a *user/organization* site (https://<username>.github.io/)
// or to a custom domain, set REPO_NAME to '' instead.
// ---------------------------------------------------------------------------
const REPO_NAME = ''

export default defineConfig({
  base: process.env.VITE_BASE_PATH ?? (REPO_NAME ? `/${REPO_NAME}/` : '/'),
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  server: {
    port: 5173,
  },
})
