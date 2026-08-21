// tailwind.config.cjs
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    colors: {
      // Extend with custom colors
      primaryBg: '#07111F',
      secondaryBg: '#0B1628',
      surface: '#0F1C30',
      surfaceAlt: '#111F35',
      glass: 'rgba(255,255,255,0.045)',
      glassHover: 'rgba(255,255,255,0.075)',
      border: 'rgba(255,255,255,0.10)',
      accentPrimary: '#4F8CFF',
      accentSecondary: '#38BDF8',
      success: '#22C55E',
      warning: '#F59E0B',
      error: '#EF4444',
      textPrimary: '#F8FAFC',
      textSecondary: '#94A3B8',
      textMuted: '#64748B',
    },
    backdropBlur: {
      xs: '4px',
      sm: '8px',
      md: '12px',
      lg: '16px',
    },
    boxShadow: {
      glass: '0 4px 30px rgba(0,0,0,0.12)',
    },
  },
  plugins: [],
};
