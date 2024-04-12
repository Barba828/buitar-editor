import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

const baseUrl = process.env.BASE_URL || '/'

export default defineConfig({
  plugins: [react()],
  base: baseUrl,
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: '@import "/lib/styles/definitions.scss";', // 预处理
      },
    },
  },
  build: {
    outDir: 'dist-demo',
  },
  resolve: {
    alias: {
      '~chord': path.resolve(__dirname, './lib'),
      '~common': path.resolve(__dirname, './common'),
    },
  },
})
