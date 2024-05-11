import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { alphaTab } from '@coderline/alphatab/vite'
import dts from 'vite-plugin-dts'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    alphaTab(),
    dts({
      entryRoot: './lib',
    }),
  ],
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: '@import "/common/styles/definitions.scss";', // 预处理
      },
    },
  },
  build: {
    lib: {
      entry: '/lib/index.ts',
      name: 'buitar-editor',
    },
    rollupOptions: {
      external: ['react', 'react-dom', '@coderline/alphatab', 'abcjs'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          '@coderline/alphatab': 'alphaTab',
          'abcjs': 'abcjs',
        },
      },
    },
  },
  resolve: {
    alias: {
      '~chord': path.resolve(__dirname, './lib'),
      '~common': path.resolve(__dirname, './common'),
    },
  },
})
