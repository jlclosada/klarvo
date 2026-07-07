import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '1.5rem',
      screens: { '2xl': '1200px' },
    },
    extend: {
      fontFamily: {
        sans: [
          'var(--font-sans)',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'sans-serif',
        ],
        display: [
          'var(--font-sans)',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'sans-serif',
        ],
      },
      colors: {
        ink: {
          50: '#f6f7f9',
          100: '#eceef2',
          200: '#d4d9e2',
          300: '#adb6c6',
          400: '#808da4',
          500: '#5f6d86',
          600: '#4b566d',
          700: '#3e4658',
          800: '#363c4b',
          900: '#0b0e14',
          950: '#05070b',
        },
        brand: {
          50: '#eef4ff',
          100: '#dae7ff',
          200: '#bcd3ff',
          300: '#8eb6ff',
          400: '#598eff',
          500: '#3366ff',
          600: '#1f47f5',
          700: '#1734e1',
          800: '#1a2db6',
          900: '#1c2c8f',
          950: '#151c57',
        },
        accent: {
          50: '#effdf6',
          100: '#d9fbe8',
          200: '#b5f5d3',
          300: '#7febb4',
          400: '#41d98d',
          500: '#18c06e',
          600: '#0c9d58',
          700: '#0c7d48',
          800: '#0e623c',
          900: '#0d5133',
        },
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      spacing: {
        '4.5': '1.125rem',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(11,14,20,0.04), 0 8px 24px -12px rgba(11,14,20,0.12)',
        glow: '0 0 0 1px rgba(51,102,255,0.08), 0 20px 60px -20px rgba(51,102,255,0.45)',
        card: '0 1px 0 rgba(255,255,255,0.6) inset, 0 1px 3px rgba(11,14,20,0.06), 0 12px 32px -16px rgba(11,14,20,0.18)',
      },
      backgroundImage: {
        'mesh-brand':
          'radial-gradient(60% 60% at 20% 10%, rgba(51,102,255,0.16) 0%, transparent 60%), radial-gradient(50% 50% at 90% 20%, rgba(24,192,110,0.12) 0%, transparent 55%), radial-gradient(60% 60% at 60% 100%, rgba(89,142,255,0.14) 0%, transparent 60%)',
        'grid-fade':
          'linear-gradient(to bottom, transparent, rgba(255,255,255,0.9)), linear-gradient(rgba(11,14,20,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(11,14,20,0.04) 1px, transparent 1px)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        blob: {
          '0%,100%': { transform: 'translate(0,0) scale(1)' },
          '33%': { transform: 'translate(20px,-30px) scale(1.06)' },
          '66%': { transform: 'translate(-18px,14px) scale(0.96)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        'gradient-x': {
          '0%,100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.7s cubic-bezier(0.16,1,0.3,1) both',
        float: 'float 6s ease-in-out infinite',
        blob: 'blob 16s ease-in-out infinite',
        shimmer: 'shimmer 2.2s infinite',
        'gradient-x': 'gradient-x 8s ease infinite',
      },
    },
  },
  plugins: [],
};

export default config;
