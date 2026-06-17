import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: "#B7A441",
          deep: "#8A7A2E",
          soft: "#DED39A",
          pale: "#F2EDD4",
        },
        ink: {
          DEFAULT: "#2B2712",
          soft: "#6A6234",
        },
      },
      fontFamily: {
        // Wired to the next/font CSS variables defined in app/layout.tsx.
        ar: ["var(--font-lateef)", "serif"],
        display: ["var(--font-fraunces)", "Georgia", "serif"],
        body: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      spacing: {
        // 4px base unit scale (4/8/16/24/40/64...) — no odd values.
        channel: "6rem", // 96px central road channel (desktop)
        rail: "3rem", // 48px mobile rail
        gutter: "2.5rem", // 40px reserved gutter around the channel
      },
      maxWidth: {
        road: "72rem",
      },
      transitionTimingFunction: {
        road: "cubic-bezier(0.2, 0.7, 0.2, 1)",
      },
      keyframes: {
        "pulse-soft": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.75", transform: "scale(1.08)" },
        },
      },
      animation: {
        "pulse-soft": "pulse-soft 2.4s cubic-bezier(0.2,0.7,0.2,1) infinite",
      },
    },
  },
  plugins: [],
};

export default config;
