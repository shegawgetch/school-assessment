/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // toggle with <html class="dark">
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563eb',
          light: '#60a5fa',
          dark: '#1e40af',
        },
        secondary: {
          DEFAULT: '#0ea5e9',
          light: '#38bdf8',
          dark: '#0369a1',
        },
        success: {
          DEFAULT: '#22c55e',
          dark: '#15803d',
        },
        danger: {
          DEFAULT: '#ef4444',
          dark: '#b91c1c',
        },
        warning: {
          DEFAULT: '#f59e0b',
          dark: '#b45309',
        },
        background: {
          light: '#f9fafb',
          dark: '#0f172a',
        },
        surface: {
          light: '#ffffff',
          dark: '#1e293b',
        },
        text: {
          light: '#1e293b',
          dark: '#f8fafc',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        sm: '0 1px 2px rgba(0,0,0,0.05)',
        md: '0 4px 6px rgba(0,0,0,0.1)',
        lg: '0 10px 15px rgba(0,0,0,0.15)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ],
};
