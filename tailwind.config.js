import ddsThemeExtend from './src/dds/tailwind/extend.js';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    './App.tsx',
  ],
  theme: {
    extend: {
      ...ddsThemeExtend,
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Montserrat', 'sans-serif'],
        ...ddsThemeExtend.fontFamily,
      },
      colors: {
        brand: {
          red: '#E50914',
          dark: 'var(--brand-dark, #050505)',
          gray: 'var(--brand-gray, #121212)',
          light: 'var(--brand-light, #F3F4F6)',
        },
        ...ddsThemeExtend.colors,
      },
      animation: {
        ...ddsThemeExtend.animation,
        /** @deprecated Use animate-phd-emerge — mantido para rotas admin legadas */
        'fade-in-up': 'phd-emerge var(--phd-duration-normal) var(--phd-ease-decelerate) forwards',
        'pulse-slow': 'pulse var(--phd-duration-continuous) cubic-bezier(0.4, 0, 0.6, 1) infinite',
        marquee: 'marquee var(--phd-duration-continuous) linear infinite',
        'marquee-institutional': 'marquee 300s linear infinite',
        'marquee-institutional-slow': 'marquee 420s linear infinite',
      },
      keyframes: {
        ...ddsThemeExtend.keyframes,
        /** @deprecated Use keyframes phd-emerge */
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(var(--phd-translate-emerge))' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        marquee: {
          '0%': { transform: 'translate3d(0, 0, 0)' },
          '100%': { transform: 'translate3d(-50%, 0, 0)' },
        },
      },
    },
  },
  plugins: [],
};
