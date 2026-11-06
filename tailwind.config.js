/** @type {import('tailwindcss').Config} */
const config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["DM Sans", "sans-serif"],
        mono: ["DM Mono", "monospace"],
        display: ["Space Grotesk", "sans-serif"],
      },
      colors: {
        brand: {
          bg: "var(--bg)",
          surface: "var(--surface)",
          text: "var(--text)",
          muted: "var(--muted)",
          line: "var(--line)",
          blue: "var(--blue)",
          soft: "var(--soft)",
          card: "var(--card)",
          dark: "var(--dark)",
        },
      },
    },
  },
  plugins: [],
};

export default config;
