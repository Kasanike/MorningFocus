import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        serif: ["var(--font-cormorant-garamond)", "Georgia", "serif"],
        "serif-display": ["var(--font-playfair)", "Georgia", "serif"],
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        app: {
          bg: "#09090b",
          fg: "#fafafa",
          muted: "#a1a1aa",
          border: "#27272a",
          card: "#18181b",
          accent: "#e4e4e7",
        },
      },
    },
  },
  plugins: [],
};

export default config;
