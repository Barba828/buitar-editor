/** @type {import('tailwindcss').Config} */
export default {
  corePlugins: {
    preflight: false,
  },
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './lib/**/*.{js,jsx,ts,tsx}',
    './common/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'm-white': {
          100: 'var(--white-1)',
          200: 'var(--white-2)',
          300: 'var(--white-3)',
        },
        'm-gray': {
          50: 'var(--gray-0)',
          100: 'var(--gray-1)',
          150: 'var(--gray-1--hover)',
          200: 'var(--gray-2)',
          300: 'var(--gray-3)',
          400: 'var(--gray-4)',
          500: 'var(--gray-5)',
          600: 'var(--gray-6)',
          700: 'var(--gray-7)',
          800: 'var(--gray-8)',
          900: 'var(--gray-9)',
          950: 'var(--gray-10)',
        },
      },
    },
  },
  plugins: [],
}
