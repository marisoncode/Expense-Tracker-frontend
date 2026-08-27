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
          light: '#e8f3fc',
          dark: '#0c1527',
        },
        clay: {
          bg: '#e8f3fc',
          'bg-dark': '#0c1527',
          surface: '#ffffff',
          'surface-dark': '#152138',
          sky: '#0284c7',
          'sky-light': '#e0f2fe',
          'sky-vibrant': '#0ea5e9',
        }
      },
      boxShadow: {
        // Claymorphism Pillowy 3D Shadows
        'clay-card': '12px 16px 32px -4px rgba(14, 116, 144, 0.14), -8px -8px 24px 0px rgba(255, 255, 255, 0.95), inset 2px 2px 4px rgba(255, 255, 255, 0.9), inset -3px -3px 8px rgba(186, 230, 253, 0.45)',
        'clay-card-dark': '12px 16px 32px -4px rgba(0, 0, 0, 0.6), -6px -6px 20px 0px rgba(255, 255, 255, 0.03), inset 1px 1px 2px rgba(255, 255, 255, 0.15), inset -3px -3px 8px rgba(0, 0, 0, 0.5)',
        
        'clay-btn': '6px 8px 18px -2px rgba(14, 116, 144, 0.16), -4px -4px 12px 0px rgba(255, 255, 255, 0.9), inset 1.5px 1.5px 2px rgba(255, 255, 255, 0.85), inset -2px -2px 4px rgba(186, 230, 253, 0.4)',
        'clay-btn-dark': '6px 8px 18px -2px rgba(0, 0, 0, 0.5), -3px -3px 10px 0px rgba(255, 255, 255, 0.04), inset 1px 1px 2px rgba(255, 255, 255, 0.15), inset -2px -2px 4px rgba(0, 0, 0, 0.4)',
        
        'clay-inset': 'inset 3px 3px 6px rgba(14, 116, 144, 0.14), inset -3px -3px 6px rgba(255, 255, 255, 0.85)',
        'clay-inset-dark': 'inset 3px 3px 6px rgba(0, 0, 0, 0.6), inset -1px -1px 3px rgba(255, 255, 255, 0.05)',
        
        'clay-primary': '0 10px 24px -3px rgba(14, 165, 233, 0.45), inset 2px 2px 3px rgba(255, 255, 255, 0.6), inset -2px -2px 4px rgba(3, 105, 161, 0.45)',
        'clay-bubble': 'inset -10px -10px 25px rgba(56, 189, 248, 0.35), inset 10px 10px 25px rgba(255, 255, 255, 0.9), 0 15px 30px -5px rgba(14, 165, 233, 0.25)',
        
        // Compatibility Aliases with Clay Aesthetic
        'neu-flat': '8px 10px 22px -3px rgba(14, 116, 144, 0.13), -6px -6px 16px 0px rgba(255, 255, 255, 0.9), inset 1.5px 1.5px 2.5px rgba(255, 255, 255, 0.85), inset -2px -2px 4px rgba(186, 230, 253, 0.35)',
        'neu-pressed': 'inset 3px 3px 6px rgba(14, 116, 144, 0.14), inset -3px -3px 6px rgba(255, 255, 255, 0.85)',
        'neu-flat-dark': '8px 10px 22px -3px rgba(0, 0, 0, 0.55), -4px -4px 14px 0px rgba(255, 255, 255, 0.03), inset 1px 1px 2px rgba(255, 255, 255, 0.12), inset -2px -2px 4px rgba(0, 0, 0, 0.4)',
        'neu-pressed-dark': 'inset 3px 3px 6px rgba(0, 0, 0, 0.55), inset -1px -1px 3px rgba(255, 255, 255, 0.05)',
      },
      animation: {
        'float-slow': 'float 14s ease-in-out infinite',
        'float-medium': 'float 9s ease-in-out infinite',
        'float-fast': 'float 6s ease-in-out infinite',
        'float-reverse': 'floatRev 11s ease-in-out infinite',
        'spin-slow': 'spinSlow 30s linear infinite',
        'pulse-subtle': 'pulseSubtle 4s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg) scale(1)' },
          '50%': { transform: 'translateY(-22px) rotate(6deg) scale(1.05)' },
        },
        floatRev: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg) scale(1)' },
          '50%': { transform: 'translateY(18px) rotate(-6deg) scale(1.04)' },
        },
        spinSlow: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '0.45', transform: 'scale(1)' },
          '50%': { opacity: '0.75', transform: 'scale(1.08)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        }
      }
    },
  },
  plugins: [],
}
