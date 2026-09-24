/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'brand-red': '#C50022',
        ink: {
          DEFAULT: '#0A0A0A',
          800: '#141414',
          700: '#1E1E1E',
          600: '#2A2A2A',
          500: '#3A3A3A',
        },
        sand: {
          DEFAULT: '#B5AC8A',
          200: '#E8E4D8',
          100: '#F5F3ED',
        },
      },
      fontFamily: {
        display: ['"IBM Plex Sans"', 'sans-serif'],
        body: ['"Roboto"', 'sans-serif'],
        sans: ['"Roboto"', 'sans-serif'],
        roboto: ['"Roboto"', 'sans-serif'],
        plex: ['"IBM Plex Sans"', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-hero': 'linear-gradient(135deg, #C50022 0%, #0A0A0A 100%)',
        'gradient-card': 'linear-gradient(135deg, #1E1E1E 0%, #141414 100%)',
      },
      boxShadow: {
        'red-glow': '0 0 40px rgba(197, 0, 34, 0.15)',
        'card-dark': '0 4px 24px rgba(0,0,0,0.4)',
        'card-light': '0 2px 12px rgba(0,0,0,0.08)',
      },
      animation: {
        'slide-in-right': 'slideInRight 0.25s ease-out',
        'slide-in-up': 'slideInUp 0.2s ease-out',
        'fade-in': 'fadeIn 0.15s ease-out',
        'scale-up': 'scaleUp 0.15s ease-out',
      },
      keyframes: {
        slideInRight: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideInUp: {
          '0%': { transform: 'translateY(8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleUp: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
