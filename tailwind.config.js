const colors = require('tailwindcss/colors')

module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // This enables dark mode with a 'dark' class
  theme: {
    extend: {
      colors: {
        primary: colors.indigo,
        secondary: colors.cyan,
        accent: colors.fuchsia,
        background: {
          light: '#FFFFFF',
          dark: '#000000',
        },
        text: {
          light: '#000000',
          dark: '#FFFFFF',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'neon': '0 0 5px theme("colors.primary.400"), 0 0 20px theme("colors.primary.700")',
        'light-smooth': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'light-sharp': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}