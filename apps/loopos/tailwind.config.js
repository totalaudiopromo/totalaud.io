/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0F1113',
        foreground: '#FFFFFF',
        accent: '#3AA9BE',
        border: '#2A2D30',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 240ms cubic-bezier(0.22, 1, 0.36, 1)',
        'slide-up': 'slideUp 240ms cubic-bezier(0.22, 1, 0.36, 1)',
        'glow': 'glow 400ms ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        glow: {
          '0%, 100%': { textShadow: '0 0 20px rgba(58, 169, 190, 0.3)' },
          '50%': { textShadow: '0 0 40px rgba(58, 169, 190, 0.6)' },
        },
      },
    },
  },
  plugins: [],
}
