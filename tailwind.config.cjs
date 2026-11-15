/** @type {import('tailwindcss').Config} */
const daisyui = require('daisyui');
const defaultColors = require('tailwindcss/colors');

module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: '#2563eb',
        'brand-light': '#4ca7f8',
        'brand-tint': '#bce4fc',
        ink: '#0f172a',
        paper: '#f8f8fa',
        mint: '#6ec98e',
        pink: '#eb54a7',
        orange: '#f19e38',
        muted: defaultColors.neutral,
      },
      fontFamily: {
        sans: [
          '"Plus Jakarta Sans"',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'sans-serif',
        ],
      },
      backgroundImage: {
        'pexels': "url('/pexels.jpg')",
      },
      keyframes: {
        wiggle: {
            '0%, 100%': {
                transform: 'rotate(-3deg)'
            },
            '50%': {
                transform: 'rotate(3deg)'
            },
        },
        headShake:{
          '0%': {
            transform: 'translateX(0)',
          },
          '6.5%': {
            transform: 'translateX(-6px) rotateY(-9deg)',
          },

          '18.5%': {
            transform: 'translateX(5px) rotateY(7deg)',
          },

          '31.5%': {
            transform: 'translateX(-3px) rotateY(-5deg)',
          },

          '43.5%': {
            transform: 'translateX(2px) rotateY(3deg)',
          },
          '50%': {
            transform: 'translateX(0)',
          },
        }
      },
      animation: {
          wiggle: 'wiggle 1s ease-in-out infinite',
          headShake: 'headShake 2s infinite',
      }
    },
  },
  plugins: [daisyui.default],
}
