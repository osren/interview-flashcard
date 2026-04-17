/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // MiniMax 品牌色
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#1456f0',  // 品牌主色
          700: '#17437d',  // 深蓝
        },
        // MiniMax 文本色
        text: {
          primary: '#222222',
          secondary: '#18181b',
          muted: '#45515e',
          tertiary: '#8e8e93',
        },
        // MiniMax 表面色
        surface: {
          white: '#ffffff',
          gray: '#f0f0f0',
          border: '#e5e7eb',
          divider: '#f2f3f5',
        },
        // MiniMax 品牌粉（点缀色）
        accent: {
          pink: '#ea5ec1',
          sky: '#3daeff',
        },
        primary: {
          50: 'var(--primary-50)',
          100: 'var(--primary-100)',
          200: '#bfdbfe',
          300: 'var(--primary-300)',
          light: '#60a5fa',
          400: 'var(--primary-400)',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: 'var(--primary-800)',
          900: 'var(--primary-900)',
        },
        // 保留原有色彩系统
        rose: {
          50: '#fff1f2',
          100: '#ffe4e6',
          200: '#fecdd3',
          300: '#fda4af',
          400: '#fb7185',
          500: '#f43f5e',
          600: '#e11d48',
          700: '#be123c',
          800: '#9f1239',
          900: '#881337',
        },
        sunset: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        sapphire: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        emerald: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
        slate: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
        violet: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
        },
      },
      borderRadius: {
        // MiniMax 圆角系统
        none: '0',
        sm: '4px',       // 微小标签
        DEFAULT: '8px',  // 按钮、小卡片
        md: '13px',      // 中等卡片
        lg: '20px',      // 大产品卡片
        xl: '24px',      // 更大卡片
        '2xl': '30px',   // 圆角面板
        full: '9999px',  // 导航/胶囊按钮
      },
      boxShadow: {
        // MiniMax 阴影系统
        'subtle': '0 4px 6px rgba(0, 0, 0, 0.08)',
        'ambient': '0 0 22.576px rgba(0, 0, 0, 0.08)',
        'brand-glow': '0 0 15px rgba(44, 30, 116, 0.16)',
        'brand-offset': '6.5px 2px 17.5px rgba(44, 30, 116, 0.11)',
        'elevated': '0 12px 16px -4px rgba(36, 36, 36, 0.08)',
      },
      fontFamily: {
        // MiniMax 字体系统
        sans: ['DM Sans', 'Helvetica Neue', 'Helvetica', 'Arial'],
        display: ['Outfit', 'Helvetica Neue', 'Helvetica', 'Arial'],
        mid: ['Poppins', 'sans-serif'],
        mono: ['Roboto', 'Helvetica Neue', 'Helvetica', 'Arial'],
      },
      animation: {
        'flip': 'flip 0.6s ease-in-out',
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        flip: {
          '0%': { transform: 'rotateY(0deg)' },
          '100%': { transform: 'rotateY(180deg)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}