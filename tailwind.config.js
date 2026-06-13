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
        duo: {
          green: '#58CC02',
          'green-dark': '#46A302',
          'green-light': '#89E219',
          blue: '#1CB0F6',
          'blue-dark': '#1899D6',
          yellow: '#FFC800',
          red: '#FF4B4B',
          gray: '#AFAFAF',
          'gray-light': '#E5E5E5',
          bg: '#F7F7F7',
          text: '#4B4B4B',
          heading: '#3C3C3C',
        },
        brand: {
          50: 'var(--brand-50)',
          100: 'var(--brand-100)',
          200: 'var(--brand-200)',
          300: 'var(--brand-300)',
          400: 'var(--brand-400)',
          500: 'var(--brand-500)',
          600: 'var(--brand-600)',
          700: 'var(--brand-700)',
        },
        primary: {
          50: 'var(--primary-50)',
          100: 'var(--primary-100)',
          200: 'var(--primary-200)',
          300: 'var(--primary-300)',
          400: 'var(--primary-400)',
          500: 'var(--primary-500)',
          600: 'var(--primary-600)',
          700: 'var(--primary-700)',
          800: 'var(--primary-800)',
          900: 'var(--primary-900)',
        },
      },
      fontFamily: {
        sans: ['Nunito', 'system-ui', 'sans-serif'],
        display: ['Nunito', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        duo: '12px',
      },
      boxShadow: {
        'duo-green': '0 4px 0 #46A302',
        'duo-blue': '0 4px 0 #1899D6',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
