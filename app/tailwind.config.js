/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#000000',
        surface: 'rgba(28, 28, 30, 0.85)',
        'surface-elevated': 'rgba(44, 44, 46, 0.95)',
        border: 'rgba(84, 84, 88, 0.65)',
        accent: {
          DEFAULT: '#0A84FF',
          hover: '#409CFF',
          muted: 'rgba(10, 132, 255, 0.15)',
        },
        muted: 'rgba(235, 235, 245, 0.6)',
        dim: 'rgba(235, 235, 245, 0.3)',
        danger: '#FF453A',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Text"', '"Inter"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Display"', '"Inter"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
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
