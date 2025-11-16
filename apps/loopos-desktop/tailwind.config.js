/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#0F1113',
        foreground: '#ffffff',
        accent: '#3AA9BE',
        border: '#2A2D30',
      },
    },
  },
  plugins: [],
}
