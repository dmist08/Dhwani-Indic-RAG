export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
        display: ['"Plus Jakarta Sans"', 'sans-serif']
      },
      colors: {
        accent: '#C0FE04',
        dark: {
          bg: '#080808',
          card: '#111111',
          border: '#222222',
          text: '#f2f2f2',
          muted: '#888888'
        },
        light: {
          bg: '#f7f7f7',
          card: '#ffffff',
          border: '#e0e0e0',
          text: '#111111',
          muted: '#777777'
        }
      }
    },
  },
  plugins: [],
};