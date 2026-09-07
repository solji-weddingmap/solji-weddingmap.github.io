/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        olive: {
          DEFAULT: '#5F7058',
          dark: '#4B5A46',
          light: '#DDE4D8',
        },
        beige: '#F8F7F2',
        ink: '#292D28',
        subtext: '#7D827A',
        line: '#E6E7E1',
      },
      fontFamily: {
        sans: [
          'Pretendard',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
      boxShadow: {
        card: '0 2px 12px rgba(41, 45, 40, 0.06)',
        popover: '0 8px 24px rgba(41, 45, 40, 0.12)',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
    },
  },
  plugins: [],
}
