/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      gridTemplateColumns: {
        // Agregamos soporte para la cuadrícula de 15 números
        '15': 'repeat(15, minmax(0, 1fr))',
      }
    },
  },
  plugins: [],
}