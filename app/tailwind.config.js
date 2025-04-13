/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fcf5fe',
          100: '#f8e9fe',
          200: '#f1d3fb',
          300: '#e9b0f7',
          400: '#dc81f1',
          500: '#c850e5',
          600: '#af30c9',
          700: '#9c27b0',
          800: '#7a2088',
          900: '#661f70',
          950: '#42084a',
        },
        secondary: {
          50: '#F8FAF0',
          100: '#F2F4E1',
          200: '#E5EAC3',
          300: '#D4DD9D',
          400: '#C2CE73',
          500: '#AFBF48',
          600: '#9BAA3B',
          700: '#8A9735',
          800: '#75802D',
          900: '#535B20',
          950: '#3E4418',
        },
        tertiary: {
          50: '#F4F5F6',
          100: '#E9ECEC',
          200: '#D0D6D7',
          300: '#B4BEC0',
          400: '#909FA2',
          500: '#647477',
          600: '#586769',
          700: '#4F5C5E',
          800: '#414C4E',
          900: '#2A3132',
          950: '#23292A',
        },
      },
    },
  },
  plugins: [
    // ...
    require('@tailwindcss/forms'),
  ],
};
