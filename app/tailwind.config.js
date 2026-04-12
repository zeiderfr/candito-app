/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0a0e13',
        surface: 'rgba(255, 255, 255, 0.04)',
        border: 'rgba(255, 255, 255, 0.07)',
        accent: {
          DEFAULT: '#66bb6a',
          muted: 'rgba(76, 175, 80, 0.1)',
        },
        muted: 'rgba(255, 255, 255, 0.45)',
        dim: 'rgba(255, 255, 255, 0.25)',
        danger: '#ef5350',
      },
      fontFamily: {
        sans: ['"DM Sans"', 'sans-serif'],
        display: ['"Instrument Serif"', 'serif'],
      },
      zIndex: {
        10: '10',
        20: '20',
        30: '30',
        40: '40',
        50: '50',
      },
      borderRadius: {
        card: '16px',
        input: '12px',
        pill: '999px',
      },
    },
  },
  plugins: [],
}
