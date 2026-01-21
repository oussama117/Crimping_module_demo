import { resolve } from 'path'
import { defineConfig } from 'electron-vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  main: {
    resolve: {
      alias: {
        // This lets your Main process use @/types
        '@': resolve('src')
      }
    }
  },
  preload: {},
  renderer: {
    resolve: {
      alias: {
        // Keeps your existing renderer alias
        '@renderer': resolve('src/renderer/src'),
        // FIX: Points @ to the root src so it can find /types
        '@': resolve('src'),
        '@lib': resolve('src/renderer/src/lib')
      }
    },
    plugins: [tailwindcss(), react()]
  }
})
