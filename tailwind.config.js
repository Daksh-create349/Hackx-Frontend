/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-dark': '#0B0C10',
        'brand-cyan': '#66FCF1',
        'brand-teal': '#45A29E',
        'brand-gray': '#1F2833',
        'brand-light': '#C5C6C7',
        'alert-red': '#FF3B30',
        'alert-yellow': '#FFCC00',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0))',
      }
    },
  },
  plugins: [],
}
