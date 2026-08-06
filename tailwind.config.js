/** @type {import('tailwindcss').Config} */
const ink = {
  50: '#f8f7f4',
  100: '#efede8',
  200: '#ded9cf',
  300: '#c5bfb4',
  400: '#9a9389',
  500: '#6f6a63',
  600: '#4d4943',
  700: '#33302c',
  800: '#201f1d',
  900: '#121212',
  950: '#070707',
};

export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: ink,
      },
      boxShadow: {
        sm: '0 1px 2px rgb(18 18 18 / 0.06)',
        DEFAULT: '0 10px 24px rgb(18 18 18 / 0.08)',
        lg: '0 18px 45px rgb(18 18 18 / 0.12)',
        xl: '0 24px 70px rgb(18 18 18 / 0.16)',
      },
    },
  },
  plugins: [],
}
