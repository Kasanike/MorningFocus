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
        /* shadcn semantic (from globals.css :root) */
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        /* New color system (use via var() in CSS or arbitrary value in Tailwind) */
        color: {
          bg: "var(--color-bg)",
          "surface-1": "var(--color-surface-1)",
          "surface-2": "var(--color-surface-2)",
          "surface-3": "var(--color-surface-3)",
          border: "var(--color-border)",
          "border-hover": "var(--color-border-hover)",
          "text-primary": "var(--color-text-primary)",
          "text-secondary": "var(--color-text-secondary)",
          "text-muted": "var(--color-text-muted)",
          accent: "var(--color-accent)",
          "accent-dim": "var(--color-accent-dim)",
          "accent-glow": "var(--color-accent-glow)",
          success: "var(--color-success)",
          "success-dim": "var(--color-success-dim)",
        },
        /* Legacy aliases */
        app: {
          bg: "var(--color-bg)",
          fg: "var(--color-text-primary)",
          muted: "var(--color-text-secondary)",
          border: "var(--color-border)",
          card: "var(--color-surface-1)",
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
