import { defineConfig } from 'electron-vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  main: {
    build: {
      lib: {
        entry: 'src/electron/index.js'
      },
      rollupOptions: {
        external: ['better-sqlite3']
      }
    }
  },
  preload: {
    build: {
      lib: {
        entry: 'src/preload/index.js'
      }
    }
  },
  renderer: {
    entry: 'src/renderer/main.jsx',
    root: 'src/renderer',
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src/shared')
      }
    }
  }
})
