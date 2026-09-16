import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'


function figmaAssetResolver() {
  return {
    name: 'figma-asset-resolver',
    resolveId(id) {
      if (id.startsWith('figma:asset/')) {
        const filename = id.replace('figma:asset/', '')
        return path.resolve(__dirname, 'src/assets', filename)
      }
    },
  }
}

// Le bundle vendored xlsx-style contient un `require("./cpexcel.js")` (tables de
// codepages) qui n'existe pas et n'est jamais exécuté côté navigateur. Vite 8
// (rolldown) échoue à le résoudre au build → on le remplace par un module vide.
function stubXlsxCpexcel() {
  const STUB_ID = '\0xlsx-cpexcel-stub'
  return {
    name: 'stub-xlsx-cpexcel',
    resolveId(id) {
      if (id === 'cpexcel.js' || id.endsWith('/cpexcel.js') || id === './cpexcel.js') {
        return STUB_ID
      }
    },
    load(id) {
      if (id === STUB_ID) return 'export default {}'
    },
  }
}

export default defineConfig({
  plugins: [
    figmaAssetResolver(),
    stubXlsxCpexcel(),
    react(),
    tailwindcss(),
  ],
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.VITE_API_PROXY || 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  preview: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.VITE_API_PROXY || 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src/app'),
    },
  },
})
