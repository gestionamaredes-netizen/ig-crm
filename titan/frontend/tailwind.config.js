/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        titan: {
          primary: '#1e40af',
          secondary: '#16a34a',
          dark: '#0f172a',
          accent: '#0ea5e9',
        },
      },
      spacing: {
        safe: 'env(safe-area-inset-bottom)',
      },
    },
  },
  plugins: [],
}
