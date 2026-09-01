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

          // Only split self-contained heavy deps.
          // Do NOT force-split react / antd / rjsf — that can load React as
          // undefined when circular chunk edges evaluate (React.Component crash).
          if (id.includes('framer-motion')) return 'vendor-motion';
          if (id.includes('@uiw/react-md-editor') || id.includes('@uiw/react-markdown-preview')) {
            return 'vendor-mdeditor';
          }
          if (id.includes('xlsx')) return 'vendor-xlsx';
          if (id.includes('@supabase')) return 'vendor-supabase';
          if (id.includes('recharts')) return 'vendor-recharts';
        },
      },
    },
  },
})
