/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
      colors: {
        neu: {
          light: '#d1d9e6',
          dark: '#292d32',
        }
      },
      boxShadow: {
        'neu-flat': '3px 3px 6px rgba(163,177,198,0.25), -2px -2px 5px rgba(255,255,255,0.35)',
        'neu-pressed': 'inset 2px 2px 4px rgba(163,177,198,0.25), inset -2px -2px 4px rgba(255,255,255,0.35)',
        'neu-flat-dark': '3px 3px 6px rgba(0,0,0,0.35), -1px -1px 4px rgba(255,255,255,0.02)',
        'neu-pressed-dark': 'inset 2px 2px 4px rgba(0,0,0,0.35), inset -1px -1px 4px rgba(255,255,255,0.02)',
      }
    },
  },
  plugins: [],
}
