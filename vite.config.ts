import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          if (id.includes('framer-motion')) return 'vendor-motion';
          if (id.includes('@uiw/react-md-editor') || id.includes('@uiw/react-markdown-preview')) {
            return 'vendor-mdeditor';
          }
          if (id.includes('xlsx')) return 'vendor-xlsx';
          if (id.includes('@supabase')) return 'vendor-supabase';
          if (id.includes('recharts')) return 'vendor-recharts';
          if (id.includes('antd') || id.includes('@ant-design') || id.includes('@rjsf')) {
            return 'vendor-antd-rjsf';
          }
          if (id.includes('react-dom') || id.includes('react-router') || id.includes('/react/')) {
            return 'vendor-react';
          }
        },
      },
    },
  },
})
