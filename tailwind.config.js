/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#f97316', // Orange Snack
        secondary: '#ea580c',
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'], // Set default font
      }
    },
  },
  plugins: [],
}