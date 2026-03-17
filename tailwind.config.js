/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: '#f5f1eb',
        'bg-card': '#ffffff',
        ink: '#1a1a2e',
        'ink-light': '#6b7280',
        accent: '#c2410c',
        'accent-light': '#fed7aa',
        accent2: '#1e40af',
        'accent2-light': '#dbeafe',
        success: '#15803d',
        'success-light': '#dcfce7',
        error: '#b91c1c',
        'error-light': '#fee2e2',
        border: '#e5e0d8',
      },
      fontFamily: {
        sans: ['"Noto Sans JP"', 'sans-serif'],
        heading: ['"Zen Kaku Gothic New"', 'sans-serif'],
      },
      maxWidth: {
        content: '720px',
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)',
        'card-lg': '0 4px 12px rgba(0,0,0,0.08), 0 12px 32px rgba(0,0,0,0.06)',
      },
    },
  },
  plugins: [],
}
