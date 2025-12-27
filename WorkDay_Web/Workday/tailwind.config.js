/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: '#FA5804', // base color
        secondary: '#D9D9D9'
      },
      fontFamily: {
        Inter: ['Inter', 'sans-serif'], // base font
      },
    },
  },
  plugins: [],


}

