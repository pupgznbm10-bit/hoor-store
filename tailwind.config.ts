import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/app/**/*.{ts,tsx,js,jsx}',
    './src/components/**/*.{ts,tsx,js,jsx}',
    './src/context/**/*.{ts,tsx,js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          900: '#0B132B',
          800: '#0F1A35',
          700: '#17243A',
        },
        gold: {
          500: '#D4AF37',
          400: '#C5A059',
          300: '#E8C871',
        },
        ivory: '#FAFAFA',
        slateWarm: '#F1F5F9',
        charcoalText: '#1E293B',
        mutedGoldGray: '#64748B',
      },
      fontFamily: {
        sans: ['Tajawal', 'Cairo', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'lux-card': '0 10px 30px rgba(11,19,43,0.18)',
        'lux-soft': '0 4px 18px rgba(11,19,43,0.08)',
      },
      keyframes: {
        float: {
          '0%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
          '100%': { transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        bounce: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(212,175,55,0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(212,175,55,0.6)' },
        },
        slide: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        spin360: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        shimmer: 'shimmer 1.8s linear infinite',
        'fade-in-up': 'fadeInUp 300ms ease-out both',
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        bounce: 'bounce 1s ease-in-out infinite',
        glow: 'glow 3s ease-in-out infinite',
        slide: 'slide 20s linear infinite',
        spin360: 'spin360 1s linear infinite',
      },
    },
  },
  plugins: [],
};

export default config;
