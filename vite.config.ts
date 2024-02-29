import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: '/src/index.ts',  // 设置库的入口文件
      name: 'MyLibrary',           // 设置库的名称
    },
    rollupOptions: {
      external: ['react', 'react-dom'], // 将 react 和 react-dom 设置为外部依赖项
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
      },
    },
  },
  server: {
    open: '/src/demo/index.html', // 设置 demo 的入口文件
  },
})
