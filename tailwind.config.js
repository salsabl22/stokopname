/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        navy: {
          950: '#0f1729',
          900: '#131b2e',
          800: '#1a2438',
          700: '#232f47',
          600: '#2d3b57',
        },
        surface: {
          bg: '#f5f6f8',
          card: '#ffffff',
          border: '#e5e7eb',
        },
        status: {
          success: '#16a34a',
          successBg: '#dcfce7',
          danger: '#dc2626',
          dangerBg: '#fee2e2',
          warning: '#d97706',
          warningBg: '#fef3c7',
          neutral: '#6b7280',
          neutralBg: '#f3f4f6',
        },
      },
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1rem' }],
        sm: ['0.8125rem', { lineHeight: '1.25rem' }],
        base: ['0.875rem', { lineHeight: '1.5rem' }],
      },
      borderRadius: {
        DEFAULT: '6px',
        md: '8px',
        lg: '10px',
      },
      boxShadow: {
        card: '0 1px 2px 0 rgb(0 0 0 / 0.04)',
      },
    },
  },
  plugins: [],
}

