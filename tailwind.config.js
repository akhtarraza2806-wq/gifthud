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
        // Giftlove Signature Romantic Palette
        romantic: {
          50: '#fff5f6',   // Whisper pink / silk petal
          100: '#ffe4e8',  // Soft morning rose
          200: '#fecdd6',  // Blush rose
          300: '#fda4b4',  // Coral blush
          400: '#fb718b',  // Peony pink
          500: '#f43f68',  // Vibrant passion rose (Signature primary)
          600: '#e11d53',  // Crimson romance
          700: '#be1243',  // Deep luxury velvet rose
          800: '#9f123c',  // Royal wine / Bordeaux
          900: '#881337',  // Vintage burgundy
          950: '#4c051a',  // Dark romantic noir
        },
        // Premium Champagne & Warm Gold Accents
        champagne: {
          50: '#fdfbf7',   // Frosted champagne
          100: '#f7f2e7',  // Pale gold silk
          200: '#ede2cc',  // Soft bullion
          300: '#dfcca8',  // Shimmering sand
          400: '#cfb27e',  // Muted gold
          500: '#bfa060',  // Premium polished gold
          600: '#a38249',  // Antique brass
          700: '#836539',  // Deep bronze
          800: '#674e30',  // Aged amber
          900: '#483520',  // Espresso gold
        },
        // Velvet & Noir Undertones for Depth & Luxury Contrast
        velvet: {
          50: '#faf7f8',
          100: '#f3ecef',
          200: '#e6d8de',
          300: '#d2bcc6',
          400: '#b899a7',
          500: '#9e798c',
          600: '#815e71',
          700: '#674a5a',
          800: '#3e2834',  // Deep plum velvet
          900: '#22121c',  // Midnight wine
          950: '#140910',  // Obsidian noir
        },
        // Warm Alabaster, Pearl, and Silk Backgrounds
        pearl: {
          DEFAULT: '#fdfcfb',
          subtle: '#f9f5f6',
          warm: '#fbf8f5',
          card: '#ffffff',
        }
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', '"Playfair Display"', 'Georgia', 'serif'],
        display: ['"Playfair Display"', '"Cormorant Garamond"', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        script: ['"Alex Brush"', 'cursive'],
      },
      boxShadow: {
        'romantic-sm': '0 2px 8px -1px rgba(244, 63, 104, 0.12), 0 1px 4px -1px rgba(190, 18, 67, 0.08)',
        'romantic-md': '0 10px 25px -5px rgba(244, 63, 104, 0.18), 0 8px 10px -6px rgba(190, 18, 67, 0.1)',
        'romantic-lg': '0 20px 35px -8px rgba(244, 63, 104, 0.25), 0 10px 15px -5px rgba(190, 18, 67, 0.15)',
        'champagne-glow': '0 0 25px -3px rgba(191, 160, 96, 0.35)',
        'velvet-card': '0 20px 40px -15px rgba(34, 18, 28, 0.25)',
      },
      backgroundImage: {
        'gradient-romantic': 'linear-gradient(135deg, #fff5f6 0%, #ffe4e8 50%, #fecdd6 100%)',
        'gradient-rose-gold': 'linear-gradient(135deg, #f43f68 0%, #be1243 50%, #bfa060 100%)',
        'gradient-velvet-dark': 'linear-gradient(145deg, #22121c 0%, #3e2834 60%, #140910 100%)',
        'gradient-gold-foil': 'linear-gradient(135deg, #ede2cc 0%, #bfa060 50%, #dfcca8 100%)',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float-gentle': 'floatGentle 4s ease-in-out infinite',
      },
      keyframes: {
        floatGentle: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        }
      }
    },
  },
  plugins: [],
}
