import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8765',
        changeOrigin: true
      }
    }
  },
  preview: {
    port: 4173,
    proxy: {
      // 生产/preview 形态（systemd 托管 control-web.service）：客户端 baseUrl 为
      // 相对路径 /api，preview 模式须显式转发 control-api，否则看板/审批全 404
      '/api': {
        target: 'http://127.0.0.1:8765',
        changeOrigin: true
      }
    }
  },
  build: {
    rollupOptions: {
      output: {
        // FINDING-021：重型 vendor 分包（Scalar 由路由懒加载自动分离）。
        // 函数式按模块路径归组：保持 tree-shake 后的实际引入集，
        // 避免包入口全量打包拖入可选依赖（primereact.all → chart.js）
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          if (id.includes('/react-dom/') || id.includes('/react-router') || id.includes('/react/'))
            return 'react'
          if (id.includes('/primereact/') || id.includes('/primeicons/'))
            return 'primereact'
        }
      }
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setup.ts']
  }
})
