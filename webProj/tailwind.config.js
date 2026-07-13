/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Cyber-Fusion theme colors
        'cyber-dark': '#0a0e27',
        'cyber-indigo': '#1a1f4d',
        'cyber-blue': '#0d47a1',
        'neon-cyan': '#00f0ff',
        'neon-magenta': '#ff00ff',
        'neon-purple': '#9d00ff',
        'neon-pink': '#ff00a0',
        'tech-gray': '#1a1a2e',
      },
      fontFamily: {
        sans: ['Inter', 'Roboto', 'sans-serif'],
        tech: ['Space Mono', 'monospace'],
      },
      backgroundImage: {
        'gradient-cyber': 'linear-gradient(135deg, #0a0e27 0%, #1a1f4d 50%, #0d47a1 100%)',
        'gradient-neon': 'linear-gradient(135deg, #00f0ff 0%, #ff00ff 100%)',
      },
      boxShadow: {
        'neon-cyan': '0 0 20px rgba(0, 240, 255, 0.5)',
        'neon-magenta': '0 0 20px rgba(255, 0, 255, 0.5)',
        'neon-glow': '0 0 40px rgba(0, 240, 255, 0.3), 0 0 60px rgba(255, 0, 255, 0.2)',
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 40px rgba(0, 240, 255, 0.3)' },
          '50%': { opacity: '0.8', boxShadow: '0 0 60px rgba(255, 0, 255, 0.4)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
      },
    },
  },
  plugins: [],
};
