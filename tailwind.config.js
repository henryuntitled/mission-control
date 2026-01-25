/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'navy': {
          900: '#0f1419',
          800: '#1a1f2e',
          700: '#242b3d',
          600: '#2e364a',
        },
        'accent': {
          DEFAULT: '#8b5cf6',
          hover: '#7c3aed',
          light: '#a78bfa',
        }
      }
    },
  },
  plugins: [],
}
