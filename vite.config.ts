import { defineConfig } from 'vite'
import { alphaTab } from '@coderline/alphatab/vite'
import react from '@vitejs/plugin-react'
import path from 'path'

const baseUrl = process.env.BASE_URL || '/'

export default defineConfig({
  plugins: [react(), alphaTab()],
  base: baseUrl,
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: '@import "/common/styles/definitions.scss";', // 预处理
      },
    },
  },
  build: {
    outDir: 'dist-demo',
    rollupOptions: {
      output: {
        chunkFileNames: 'chunks/[name]-[hash].js'
      }
    },
  },
  resolve: {
    alias: {
      '~chord': path.resolve(__dirname, './lib'),
      '~common': path.resolve(__dirname, './common'),
      '~': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 8383,
  },
})
