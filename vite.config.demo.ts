import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const baseUrl = process.env.BASE_URL || '/'

export default defineConfig({
  plugins: [react()],
  base: baseUrl,
  build: {
    outDir: 'dist-demo',
  },
})
