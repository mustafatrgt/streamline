/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './index.html',
    './assets/js/main.js',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#D4AF37',
        'primary-light': '#F9E27D',
        'primary-dark': '#B8860B',
        'background-light': '#f8f8f6',
        'background-dark': '#050505',
        obsidian: '#050505',
      },
      fontFamily: {
        display: ['Montserrat', 'system-ui', '-apple-system', '"Segoe UI"', 'Arial', 'sans-serif'],
        accent: ['Syne', 'system-ui', '-apple-system', '"Segoe UI"', 'Arial', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '0.5rem',
        lg: '1rem',
        xl: '1.5rem',
        full: '9999px',
      },
      letterSpacing: {
        'widest-luxury': '0.15em',
        'ultra-wide': '0.25em',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries'),
  ],
};
