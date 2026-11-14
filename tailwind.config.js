/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Marie Gold palette
        gold: {
          50:  '#FDF8E7',
          100: '#FBEEC7',
          200: '#F7DC90',
          300: '#F5C842',
          400: '#E5B124',
          500: '#D4A017', // Core Marie Gold
          600: '#B5850E',
          700: '#8E6709',
          800: '#644705',
          900: '#3D2A02',
        },
        // Deep Black & Midnight palette
        midnight: {
          50:  '#F5E8C7',
          100: '#D4C4A8',
          200: '#9E927C',
          300: '#6E6454',
          400: '#3D382F',
          500: '#2A2A3D',
          600: '#1E1E2E',
          700: '#161622',
          800: '#111118',
          900: '#0A0A0F',
          950: '#06060A',
        },
        // Royal Purple palette
        violet: {
          50:  '#FAF5FF',
          100: '#F3E8FF',
          200: '#E9D5FF',
          300: '#D8B4FE',
          400: '#C084FC',
          500: '#A855F7',
          600: '#9333EA',
          700: '#7C3AED',
          800: '#6B21A8',
          900: '#4C1D95',
          950: '#2E1065',
        },
        // Semantic mappings
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["Public Sans", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        display: ["Plus Jakarta Sans", "Public Sans", "sans-serif"],
        mono: ["JetBrains Mono", "Menlo", "Monaco", "Consolas", "monospace"],
      },
      animation: {
        'shimmer': 'shimmer 2.5s linear infinite',
        'fade-in': 'fadeIn 0.35s ease-out forwards',
        'slide-up': 'slideUp 0.4s ease-out forwards',
        'slide-in-left': 'slideInLeft 0.35s ease-out forwards',
        'pulse-gold': 'pulseGold 2.2s ease-in-out infinite',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
        'float': 'float 5s ease-in-out infinite',
        'spin-slow': 'spin 4s linear infinite',
        'scanline': 'scanline 2.2s ease-in-out infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-12px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        pulseGold: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(212,160,23,0.35)' },
          '50%': { boxShadow: '0 0 0 10px rgba(212,160,23,0)' },
        },
        glowPulse: {
          '0%, 100%': { opacity: '0.45' },
          '50%': { opacity: '0.85' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        scanline: {
          '0%': { top: '0%' },
          '50%': { top: '100%' },
          '100%': { top: '0%' },
        },
      },
      backgroundImage: {
        'gold-shimmer': 'linear-gradient(90deg, transparent 0%, rgba(212,160,23,0.25) 50%, transparent 100%)',
        'gold-gradient': 'linear-gradient(135deg, #D4A017 0%, #F5C842 50%, #C9930A 100%)',
        'dark-gradient': 'linear-gradient(135deg, #0A0A0F 0%, #161622 50%, #111118 100%)',
        'purple-gradient': 'linear-gradient(135deg, #6B21A8 0%, #7C3AED 50%, #9333EA 100%)',
        'gold-purple-radial': 'radial-gradient(circle at top right, rgba(212,160,23,0.15), transparent 45%), radial-gradient(circle at bottom left, rgba(124,58,237,0.18), transparent 50%)',
      },
      boxShadow: {
        'gold': '0 0 24px rgba(212,160,23,0.28), 0 4px 16px rgba(212,160,23,0.15)',
        'gold-sm': '0 0 10px rgba(212,160,23,0.25)',
        'violet': '0 0 24px rgba(124,58,237,0.3), 0 4px 16px rgba(124,58,237,0.15)',
        'card-dark': '0 4px 24px rgba(0,0,0,0.6), 0 1px 0 rgba(212,160,23,0.08)',
        'elevated': '0 8px 32px rgba(0,0,0,0.7), 0 0 1px 1px rgba(212,160,23,0.12)',
      },
    },
  },
  plugins: [],
}
