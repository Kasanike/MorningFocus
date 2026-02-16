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
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      letterSpacing: {
        tighter: "-0.02em",
      },
      colors: {
        app: {
          bg: "#09090b",
          fg: "#e4e4e7",
          muted: "#a1a1aa",
          border: "#262626",
          card: "#0f0f0f",
        },
      },
      borderRadius: {
        DEFAULT: "8px",
        lg: "8px",
        xl: "8px",
        "2xl": "8px",
      },
      keyframes: {
        "slow-pulse": {
          "0%, 100%": { transform: "scale(1)", opacity: "0.8" },
          "50%": { transform: "scale(1.05)", opacity: "1" },
        },
      },
      animation: {
        "sun-pulse": "slow-pulse 8s infinite ease-in-out",
      },
    },
  },
  plugins: [],
};

export default config;
