/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bid: {
          DEFAULT: '#16c784',
          light: '#16c78420',
        },
        ask: {
          DEFAULT: '#ea3943',
          light: '#ea394320',
        },
        surface: {
          DEFAULT: '#1e1e2f',
          light: '#2a2a3d',
          lighter: '#33334a',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
