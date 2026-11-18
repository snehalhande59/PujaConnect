/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // DevSutra Official Brand Colors
        maroon: {
          DEFAULT: '#7B2635', // Primary Maroon
          50: '#FBF2F3',
          100: '#F4DEE1',
          200: '#EABDC4',
          300: '#DE97A3',
          400: '#CE6C7D',
          500: '#BA495C',
          600: '#9B3344',
          700: '#7B2635', // Primary Maroon
          800: '#652735', // Deep Maroon
          900: '#481620',
          950: '#320C13',
        },
        saffron: {
          DEFAULT: '#D97724',
          50: '#FEF7EE',
          100: '#FBE8D1',
          200: '#F7D1A3',
          300: '#F3B978',
          400: '#EE9E4E',
          500: '#D97724', // DevSutra Saffron
          600: '#B55B14',
          700: '#8E430B',
          800: '#692E07',
          900: '#4A1E04',
        },
        gold: {
          DEFAULT: '#C49A45', // Antique Gold
          50: '#FBF7EE',
          100: '#F4E8D0',
          200: '#EBD4A5',
          300: '#E3C98E',
          400: '#D4B363',
          500: '#C49A45', // Antique Gold
          600: '#A17A28',
          700: '#7F5E1B',
          800: '#5F4412',
          900: '#432E0A',
        },
        ivory: '#FFF8EC', // Ivory Cream website background
        beige: {
          DEFAULT: '#EDE0CB', // Soft Beige
          50: '#FAF6EE',
          100: '#F4EBDC',
          200: '#EDE0CB',
          300: '#DFCCAF',
          400: '#CFB590',
        },
        brown: {
          DEFAULT: '#382820', // Deep Brown text
          50: '#F5F2F0',
          100: '#E5DFDB',
          200: '#C8BCB5',
          300: '#A9988D',
          400: '#7B675A',
          500: '#564034',
          600: '#382820', // Deep Brown
          700: '#2C1E17',
          800: '#201510',
          900: '#140D0A',
        },
      },
      fontFamily: {
        brand: ['var(--font-cinzel)', 'Cinzel', 'Georgia', 'serif'],
        heading: ['var(--font-playfair)', 'Playfair Display', 'Georgia', 'serif'],
        sans: ['var(--font-poppins)', 'Poppins', 'system-ui', 'sans-serif'],
        devanagari: ['var(--font-devanagari)', 'Noto Sans Devanagari', 'sans-serif'],
      },
      boxShadow: {
        'sacred': '0 4px 20px -2px rgba(123, 38, 53, 0.08), 0 2px 6px -1px rgba(196, 154, 69, 0.06)',
        'sacred-lg': '0 10px 30px -4px rgba(123, 38, 53, 0.12), 0 4px 12px -2px rgba(196, 154, 69, 0.10)',
        'gold-glow': '0 0 25px rgba(196, 154, 69, 0.25)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
