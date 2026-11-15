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
        navy: {
          950: '#070b14',
          900: '#0a0f1d',
          850: '#0f172a',
          800: '#141f36',
          750: '#1a2744',
          700: '#1e2e50',
          600: '#2b3f6c',
        },
        electric: {
          cyan: '#00f0ff',
          blue: '#38bdf8',
          deep: '#0284c7',
          glow: 'rgba(56, 189, 248, 0.15)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      },
      boxShadow: {
        'glow-electric': '0 0 25px -5px rgba(56, 189, 248, 0.25)',
        'glow-cyan': '0 0 20px -3px rgba(0, 240, 255, 0.3)',
        'card-dark': '0 4px 20px -2px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)',
      }
    },
  },
  plugins: [],
}
