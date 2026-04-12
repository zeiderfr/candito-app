import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs'

// Generate a single build version used by BOTH the JS bundle and version.json
const BUILD_VERSION = process.env.VITE_APP_VERSION || Date.now().toString()

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'sync-version-json',
      // Write version.json at build time so it matches __APP_VERSION__ exactly
      writeBundle() {
        fs.writeFileSync(
          'dist/version.json',
          JSON.stringify({ version: BUILD_VERSION })
        )
      }
    }
  ],
  define: {
    __APP_VERSION__: JSON.stringify(BUILD_VERSION),
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})
