/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
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
          950: '#022c22',
          DEFAULT: '#00FFA3', // Neon Green
          glow: 'rgba(0, 255, 163, 0.5)',
        },
        secondary: {
          cyan: '#00E5FF',
          blue: '#2962FF',
          purple: '#B000FF',
        },
        background: '#07111F',
        surface: 'rgba(11, 20, 36, 0.7)',
        surfaceSolid: '#0B1424',
        surfaceHighlight: 'rgba(30, 41, 59, 0.8)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'glass-gradient': 'linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)',
        'active-gradient': 'linear-gradient(90deg, rgba(0,255,163,0.15) 0%, rgba(0,229,255,0.05) 100%)',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
        'neon': '0 0 10px rgba(0, 255, 163, 0.5), 0 0 20px rgba(0, 255, 163, 0.3)',
        'neon-cyan': '0 0 10px rgba(0, 229, 255, 0.5), 0 0 20px rgba(0, 229, 255, 0.3)',
        'neon-purple': '0 0 10px rgba(176, 0, 255, 0.5), 0 0 20px rgba(176, 0, 255, 0.3)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}
