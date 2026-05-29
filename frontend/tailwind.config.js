/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Warna coklat khas Flojava
        brown: {
          900: '#3e2723',
        }
      },
    },
  },
  plugins: [],
}